import { google } from 'npm:googleapis@140.0.1';
import { createClient } from 'npm:@base44/sdk@0.1.0';
import MailComposer from 'npm:nodemailer/lib/mail-composer';

// Helper function to create the raw email message
async function createMail(options) {
  const mail = new MailComposer(options);
  const data = await mail.compile().build();
  return data.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

Deno.serve(async (req) => {
  // Check for required secrets first. This makes debugging easier.
  const clientId = Deno.env.get("GMAIL_CLIENT_ID");
  const clientSecret = Deno.env.get("GMAIL_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    console.error("GMAIL_CLIENT_ID or GMAIL_CLIENT_SECRET is not set.");
    return new Response(JSON.stringify({ error: 'Server configuration error: Missing Gmail credentials.' }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // --- Authenticate the base44 user ---
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Missing Authorization header.' }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const token = authHeader.split(' ')[1];
  const base44 = createClient({ appId: Deno.env.get('BASE44_APP_ID') });
  base44.auth.setToken(token);

  const user = await base44.auth.me();
  if (!user || !user.google_access_token) {
    return new Response(JSON.stringify({ error: 'User not authenticated with Google.' }), { status: 403, headers: { "Content-Type": "application/json" } });
  }

  try {
    const { to, subject, body, from_name, attachments = [] } = await req.json();

    // --- Initialize Google OAuth2 client for this request ---
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({
      access_token: user.google_access_token,
      refresh_token: user.google_refresh_token,
      expiry_date: user.google_token_expiry,
    });

    // --- Refresh token if it's expired ---
    if (user.google_token_expiry && new Date().getTime() > user.google_token_expiry) {
      console.log("Refreshing Google access token...");
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);
      
      // Persist the new tokens to the database
      await base44.entities.User.update(user.id, {
        google_access_token: credentials.access_token,
        google_refresh_token: credentials.refresh_token || user.google_refresh_token, // refresh_token is sometimes not returned
        google_token_expiry: credentials.expiry_date,
      });
      console.log("Token refreshed and saved.");
    }
    
    // --- Get user's primary email to use as 'from' address ---
    const people = google.people({ version: 'v1', auth: oauth2Client });
    const profile = await people.people.get({
        resourceName: 'people/me',
        personFields: 'emailAddresses',
    });
    const fromEmail = profile.data.emailAddresses?.find(e => e.metadata?.primary)?.value;

    if (!fromEmail) {
        throw new Error("Could not determine user's primary email address from Google.");
    }

    // --- Construct and send the email ---
    const mailOptions = {
      from: from_name ? `"${from_name}" <${fromEmail}>` : fromEmail,
      to,
      subject,
      html: body,
      attachments: attachments.map(att => ({
        filename: att.filename,
        content: att.content,
        encoding: 'base64',
        contentType: att.content_type,
      })),
    };

    const rawMessage = await createMail(mailOptions);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: rawMessage,
      },
    });

    return new Response(JSON.stringify({ success: true, message: 'Email sent successfully!' }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error sending email:', error.response ? error.response.data : error.message);
    const errorMessage = error.response?.data?.error?.message || error.message || 'An unknown error occurred.';
    return new Response(JSON.stringify({ error: 'Failed to send email.', details: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});