
/**
 * Email service utility that uses the new secure Gmail integration.
 */
import { User } from "@/entities/User";
import { sendGmail } from "@/functions/sendGmail";

export class EmailService {
  /**
   * Send email using the connected Gmail account via a secure backend function.
   * If not connected, it will fail gracefully and prompt the user.
   */
  static async sendEmail({ to, subject, body, from_name = "EquipTrack System", attachments = [] }) {
    try {
      const currentUser = await User.me();
      if (!currentUser?.google_access_token) {
        const message = "Email not sent. Please connect your Gmail account in the Settings page to enable sending emails.";
        console.warn(message);
        alert(message);
        return { success: false, error: "Gmail account not connected." };
      }

      console.log("Sending email via secure Gmail function:", { to, subject, from_name });
      
      const { data, error } = await sendGmail({ to, subject, body, from_name, attachments });
      
      if (error || !data.success) {
        throw new Error(error?.data?.details || data?.details || "Failed to send email via backend function.");
      }

      console.log("Email sent successfully via Gmail:", data.message);
      return { success: true, messageId: data.messageId || `gmail_${Date.now()}` };

    } catch (error) {
      console.error("Email service error:", error);
      alert(`Failed to send email: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send assignment confirmation email to soldier
   */
  static async sendAssignmentEmail(soldier, signedEquipment, signatureData) {
    const subject = `✅ Equipment Assignment Confirmation - ${signedEquipment.length} Items`;
    const body = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #1e293b;">Equipment Assignment Confirmation</h2>
  
  <p>Dear <strong>${soldier.full_name}</strong>,</p>
  
  <p>The following equipment has been officially assigned to you. You are now responsible for its care and maintenance.</p>
  
  <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #374151; margin-top: 0;">📦 ASSIGNED EQUIPMENT:</h3>
    ${signedEquipment.map(item => `
      <p style="margin: 5px 0; padding: 8px; background: white; border-radius: 4px;">
        • <strong>${item.object_name}</strong> - Serial: <code>${item.serial_number}</code>
      </p>
    `).join('')}
  </div>
  
  <div style="background-color: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #0369a1; margin-top: 0;">📋 ASSIGNMENT DETAILS:</h3>
    <p>• <strong>Assignment Date:</strong> ${new Date(signatureData.date).toLocaleString()}</p>
    <p>• <strong>Total Items:</strong> ${signedEquipment.length}</p>
    <p>• <strong>Soldier ID:</strong> ${soldier.soldier_id}</p>
    <p>• <strong>Platoon:</strong> ${soldier.platoon || 'Not specified'}</p>
  </div>
  
  <div style="background-color: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #166534; margin-top: 0;">✅ RESPONSIBILITIES:</h3>
    <p>You are now responsible for:</p>
    <ul>
      <li>Proper care and maintenance of assigned equipment</li>
      <li>Reporting any damage or issues immediately</li>
      <li>Returning equipment in good condition when required</li>
      <li>Following all safety protocols</li>
    </ul>
  </div>
  
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
  <p style="font-size: 12px; color: #6b7280;">
    This is an automated notification from EquipTrack Sentinel System.<br>
    Generated on: ${new Date().toLocaleString()}
  </p>
</div>
`;

    if (soldier.email) {
      return await this.sendEmail({
        to: soldier.email,
        subject,
        body,
        from_name: "EquipTrack Sentinel"
      });
    } else {
      console.warn("Soldier has no email address:", soldier.full_name);
      return { success: false, error: "No email address" };
    }
  }

  /**
   * Send return confirmation email to soldier
   */
  static async sendReturnEmail(soldier, equipmentItem, assignment) {
    const subject = `✅ Equipment Return Confirmation - CLEARED (זוכה)`;
    
    // Check for supplanting items
    const supplantingItems = assignment?.signature_data?.supplanting_items || [];
    const hasSupplantingItems = supplantingItems.length > 0;
    
    const body = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #dcfce7; border: 2px solid #16a34a; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
    <h1 style="color: #166534; margin: 0; font-size: 24px;">🎉 EQUIPMENT CLEARED (זוכה) 🎉</h1>
  </div>
  
  <p>Dear <strong>${soldier?.full_name || 'Soldier'}</strong>,</p>
  
  <p>Your equipment has been successfully returned and you are now <strong>officially cleared</strong> of responsibility!</p>
  
  <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #374151; margin-top: 0;">📦 RETURNED EQUIPMENT:</h3>
    <p style="padding: 8px; background: white; border-radius: 4px;">
      • <strong>${equipmentItem.object_name}</strong> - Serial: <code>${equipmentItem.serial_number}</code>
    </p>
    
    ${hasSupplantingItems ? `
    <h4 style="color: #374151; margin-top: 15px; margin-bottom: 5px;">📎 INCLUDED SUPPLANTING ITEMS:</h4>
    <div style="padding: 8px; background: white; border-radius: 4px;">
      ${supplantingItems.map(item => `• ${item}`).join('<br>')}
    </div>
    ` : ''}
  </div>
  
  <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #92400e; margin-top: 0;">📋 RETURN DETAILS:</h3>
    <p>• <strong>Original Assignment:</strong> ${assignment?.assignment_date ? new Date(assignment.assignment_date).toLocaleString() : 'N/A'}</p>
    <p>• <strong>Return Date:</strong> ${new Date().toLocaleString()}</p>
    <p>• <strong>Condition When Assigned:</strong> ${assignment?.condition_on_assignment || 'Good'}</p>
    <p>• <strong>Condition When Returned:</strong> ${equipmentItem.condition || 'Good'}</p>
    ${hasSupplantingItems ? `<p>• <strong>Supplanting Items:</strong> ${supplantingItems.length} item(s) returned</p>` : ''}
    <p>• <strong>Reason:</strong> ${assignment?.notes?.includes('reassignment') ? 'Equipment reassigned to another soldier' : 'Standard return'}</p>
  </div>
  
  <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
    <h2 style="color: #166534; margin: 0;">✅ STATUS: CLEARED (זוכה)</h2>
    <p style="margin: 10px 0 0 0; color: #166534;">You have no outstanding equipment responsibilities for ${hasSupplantingItems ? 'these items' : 'this item'}.</p>
  </div>
  
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
  <p style="font-size: 12px; color: #6b7280;">
    This is an automated notification from EquipTrack Sentinel System.<br>
    Generated on: ${new Date().toLocaleString()}
  </p>
</div>
`;

    if (soldier?.email) {
      return await this.sendEmail({
        to: soldier.email,
        subject,
        body,
        from_name: "EquipTrack Sentinel"
      });
    } else {
      console.warn("Soldier has no email address");
      return { success: false, error: "No email address" };
    }
  }

  /**
   * Send app invitation email to soldier
   */
  static async sendInvitationEmail(soldier, appUrl) {
    const subject = "Invitation to Join EquipTrack Sentinel";
    const body = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #1e293b; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">EquipTrack Sentinel</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Equipment Management System</p>
  </div>
  
  <div style="background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
    <p>Hello <strong>${soldier.full_name}</strong>,</p>
    
    <p>You have been invited to join <strong>EquipTrack Sentinel</strong>, the equipment management system for our unit.</p>
    
    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #374151; margin-top: 0;">🎯 What you can do:</h3>
      <ul style="color: #4b5563;">
        <li>Track your assigned equipment in real-time</li>
        <li>View equipment status and history</li>
        <li>Receive assignment and return notifications</li>
        <li>Access your equipment records anytime</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}" style="display: inline-block; padding: 15px 30px; background-color: #1e293b; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
        🚀 Join EquipTrack Sentinel
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">
      If you have any questions about using the system, please contact your equipment manager.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    <p style="font-size: 12px; color: #9ca3af; text-align: center;">
      EquipTrack Sentinel System<br>
      Generated on: ${new Date().toLocaleString()}
    </p>
  </div>
</div>
`;

    return await this.sendEmail({
      to: soldier.email,
      subject,
      body,
      from_name: "EquipTrack Sentinel"
    });
  }
}
