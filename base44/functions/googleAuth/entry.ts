import { google } from 'npm:googleapis@140.0.1';
import { createClient } from 'npm:@base44/sdk@0.1.0';

const oauth2Client = new google.auth.OAuth2(
  Deno.env.get("GMAIL_CLIENT_ID"),
  Deno.env.get("GMAIL_CLIENT_SECRET"),
  // This must match an Authorized redirect URI in your Google Cloud console
  `${Deno.env.get("BASE44_APP_URL")}/Settings` 
);

const scopes = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email', // to get user's email
];

Deno.serve(async (req) => {
  const base44 = createClient({ appId: Deno.env.get('BASE44_APP_ID') });
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  const token = authHeader.split(' ')[1];
  base44.auth.setToken(token);
  const user = await base44.auth.me();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const { code } = await req.json();

  if (code) {
    // Phase 2: Exchange authorization code for tokens
    try {
      const { tokens } = await oauth2Client.getToken(code);
      
      await base44.entities.User.update(user.id, {
        google_access_token: tokens.access_token,
        google_refresh_token: tokens.refresh_token,
        google_token_expiry: tokens.expiry_date,
      });

      return new Response(JSON.stringify({ success: true, message: "Successfully connected to Google." }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error('Error exchanging token:', error);
      return new Response(JSON.stringify({ error: 'Failed to exchange token.', details: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } else {
    // Phase 1: Generate and return the authentication URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // requests a refresh token
      scope: scopes,
      prompt: 'consent', // important to ensure a refresh token is always sent
    });
    return new Response(JSON.stringify({ authUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
});