
import React, { useState, useEffect } from "react";
import { Equipment, Soldier, Assignment } from "@/entities/all";
import { SendEmail } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Package,
  User,
  Calendar,
  Users,
  Wrench,
  Edit,
  HeartPulse,
  History,
  FileText,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import EditEquipmentModal from "./EditEquipmentModal";

const statusColors = {
  issued: "bg-green-100 text-green-800",
  storage: "bg-amber-100 text-amber-800",
  repair: "bg-red-100 text-red-800",
  default: "bg-slate-100 text-slate-800" // Fallback color
};

// Helper function to safely format dates
const formatDate = (dateString) => {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
    return "N/A";
  }
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch (error) {
    return "Invalid Date";
  }
};

export default function EquipmentDetail({ equipment, onUpdate, t = {} }) {
  const [assignments, setAssignments] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      setIsHistoryLoading(true);
      if (equipment?.serial_number) { // Check for serial_number before fetching
        try {
          const assignmentData = await Assignment.filter({ equipment_id: equipment.serial_number }, '-assignment_date');
          setAssignments(assignmentData || []);
        } catch (error) {
          console.error("Failed to fetch assignment history:", error);
          setAssignments([]);
        }
      } else {
        setAssignments([]);
      }
      setIsHistoryLoading(false);
    };
    fetchAssignments();
  }, [equipment]);

  const sendRepairClearanceEmail = async (equipmentItem, assignment, soldier) => {
    if (!soldier?.email) return;
    const SUPER_USER_EMAIL = "management@equiptrack.app";

    try {
      // Check for supplanting items
      const supplantingItems = assignment?.signature_data?.supplanting_items || [];
      const hasSupplantingItems = supplantingItems.length > 0;

      const clearancePdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Equipment Return & Repair Form 1008</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.4;
              color: #333;
              position: relative;
            }
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 120px;
              font-weight: bold;
              color: rgba(0, 128, 0, 0.3);
              z-index: -1;
              font-family: Arial, sans-serif;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .form-number {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .form-title {
              font-size: 18px;
              font-weight: bold;
            }
            .clearance-stamp {
              background-color: #d4edda;
              border: 2px solid #28a745;
              padding: 10px;
              text-align: center;
              margin: 20px 0;
              font-weight: bold;
              color: #155724;
            }
            .repair-notice {
              background-color: #fff3cd;
              border: 2px solid #ffc107;
              padding: 10px;
              text-align: center;
              margin: 20px 0;
              font-weight: bold;
              color: #856404;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 10px;
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 20px;
            }
            .info-item {
              margin-bottom: 8px;
            }
            .label {
              font-weight: bold;
              display: inline-block;
              width: 120px;
            }
            .equipment-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .equipment-table th, .equipment-table td {
              border: 1px solid #333;
              padding: 8px;
              text-align: left;
            }
            .equipment-table th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .signature-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-top: 30px;
            }
            .signature-box {
              border: 1px solid #333;
              height: 80px;
              margin-bottom: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .signature-image {
              max-width: 100%;
              max-height: 100%;
            }
            .date-line {
              border-bottom: 1px solid #333;
              display: inline-block;
              min-width: 150px;
              text-align: center;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="watermark">זוכה</div>

          <div class="header">
            <div class="form-number">1008</div>
            <div class="form-title">EQUIPMENT RETURN & REPAIR FORM</div>
            <div style="margin-top: 10px;">Military Equipment Management System</div>
          </div>

          <div class="clearance-stamp">
            <div style="font-size: 24px; margin-bottom: 5px;">זוכה - CLEARED</div>
            <div>Equipment Returned - Soldier Cleared of Responsibility</div>
          </div>

          <div class="repair-notice">
            <div style="font-size: 18px; margin-bottom: 5px;">⚠️ SENT TO REPAIR</div>
            <div>Equipment transferred to maintenance department</div>
          </div>

          <div class="section">
            <div class="section-title">SOLDIER INFORMATION</div>
            <div class="info-grid">
              <div>
                <div class="info-item">
                  <span class="label">Name:</span> ${soldier?.full_name || 'N/A'}
                </div>
                <div class="info-item">
                  <span class="label">ID:</span> ${equipmentItem.issued_soldier_id}
                </div>
                <div class="info-item">
                  <span class="label">Rank:</span> ${soldier?.rank || "N/A"}
                </div>
              </div>
              <div>
                <div class="info-item">
                  <span class="label">Platoon:</span> ${equipmentItem.platoon || "N/A"}
                </div>
                <div class="info-item">
                  <span class="label">Squad:</span> ${equipmentItem.squad || "N/A"}
                </div>
                <div class="info-item">
                  <span class="label">Return Date:</span> ${new Date().toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">EQUIPMENT SENT TO REPAIR</div>
            <table class="equipment-table">
              <thead>
                <tr>
                  <th>Serial Number</th>
                  <th>Equipment Name</th>
                  <th>Condition on Assignment</th>
                  <th>Condition on Return</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${equipmentItem.serial_number}</td>
                  <td>${equipmentItem.object_name}</td>
                  <td>${assignment?.condition_on_assignment || "Good"}</td>
                  <td>${equipmentItem.condition || "Good"}</td>
                  <td style="color: orange; font-weight: bold;">SENT TO REPAIR</td>
                </tr>
              </tbody>
            </table>
          </div>

          ${hasSupplantingItems ? `
          <div class="section">
            <div class="section-title">SUPPLANTING ITEMS RETURNED</div>
            <table class="equipment-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${supplantingItems.map(item => `
                <tr>
                  <td>${item}</td>
                  <td style="color: green; font-weight: bold;">RETURNED</td>
                </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          ${assignment?.signature_data ? `
          <div class="signature-section">
            <div>
              <div class="section-title">ORIGINAL ISSUED SIGNATURE</div>
              <div class="signature-box">
                ${assignment.signature_data.soldier_signature_canvas ?
                  `<img src="${assignment.signature_data.soldier_signature_canvas}" class="signature-image" alt="Soldier Signature">` :
                  (assignment.signature_data.soldier_signature || '')}
              </div>
              <div>
                <span class="label">Issued:</span> ${new Date(assignment.assignment_date).toLocaleString()}<br>
                <span class="label">Returned:</span> <span class="date-line">${new Date().toLocaleString()}</span>
              </div>
            </div>

            <div>
              <div class="section-title">CLEARANCE CONFIRMATION</div>
              <div class="signature-box" style="background-color: #d4edda; color: #155724; font-weight: bold; font-size: 18px;">
                זוכה - CLEARED
              </div>
              <div>
                <span class="label">Processed by:</span> Equipment Manager<br>
                <span class="label">Date:</span> <span class="date-line">${new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>
          ` : ''}

          <div class="footer">
            Form 1008 - Equipment Return & Repair Record<br>
            Generated: ${new Date().toLocaleString()}<br>
            EquipTrack Military Equipment Management System
          </div>
        </body>
        </html>
      `;

      const emailSubject = `✅ Equipment Cleared - Sent to Repair (זוכה)`;

      const emailBody = `
<p>Dear ${soldier?.full_name || 'Soldier'},</p>

<p><strong>🎉 EQUIPMENT RESPONSIBILITY CLEARED - זוכה</strong></p>

<p>Your equipment has been returned and you are now officially cleared of responsibility. The equipment has been sent to repair.</p>

<p><strong>📦 EQUIPMENT DETAILS:</strong><br>
• ${equipmentItem.object_name} - Serial: ${equipmentItem.serial_number}</p>

${hasSupplantingItems ? `
<p><strong>📎 SUPPLANTING ITEMS RETURNED:</strong><br>
${supplantingItems.map(item => `• ${item}`).join('<br>')}</p>
` : ''}

<p><strong>📋 RETURN & REPAIR DETAILS:</strong><br>
• Original Assignment: ${assignment?.assignment_date ? new Date(assignment.assignment_date).toLocaleString() : 'N/A'}<br>
• Return Date: ${new Date().toLocaleString()}<br>
• Condition When Assigned: ${assignment?.condition_on_assignment || 'Good'}<br>
• Condition When Returned: ${equipmentItem.condition || 'Good'}<br>
• Current Status: <strong>SENT TO REPAIR</strong></p>

<p><strong>✅ CLEARANCE STATUS: זוכה (CLEARED)</strong></p>

<p><strong>🎖️ IMPORTANT INFORMATION:</strong><br>
• You are now officially cleared of responsibility for this equipment${hasSupplantingItems ? ' and all supplanting items' : ''}.<br>
• This clearance is permanent and documented in your military record.<br>
• The equipment has been transferred to the maintenance department for repair.<br>
• Keep this email and attached form as proof of equipment return and clearance.<br>
• No further action is required from you regarding ${hasSupplantingItems ? 'these items' : 'this equipment'}.</p>

<p><strong>📎 ATTACHMENT:</strong><br>
Official Form 1008 equipment return & repair record with clearance stamp (זוכה) is attached.</p>

<hr>
<p style="font-size: 12px; color: #666;">This is an automated notification from EquipTrack Military Equipment Management System.</p>

<p>Congratulations on completing your equipment responsibility! 🎖️</p>

<p>Best regards,<br>
Equipment Management Team 🛡️</p>
`;

      // Create blob and convert to base64 for attachment
      const blob = new Blob([clearancePdfContent], { type: 'text/html' });
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];

        await SendEmail({
          to: soldier.email,
          subject: emailSubject,
          body: emailBody,
          from_name: "EquipTrack System",
          attachments: [{
            filename: `Repair_Clearance_1008_${equipmentItem.serial_number}_${new Date().toISOString().split('T')[0]}.html`,
            content: base64data,
            content_type: 'text/html'
          }]
        });

        // BCC to super user
        const superUserSubject = `[COPY: Repair Clearance] for ${soldier.full_name} (${equipmentItem.serial_number})`;
        const superUserBody = `<p>This is a system copy of the repair clearance email sent to <b>${soldier.full_name} (${soldier.email})</b> for equipment <b>${equipmentItem.object_name} (Serial: ${equipmentItem.serial_number})</b>, which has been sent to repair.</p><hr/>${emailBody}`;
        await SendEmail({
            to: SUPER_USER_EMAIL,
            subject: superUserSubject,
            body: superUserBody,
            from_name: "EquipTrack System [Admin Copy]",
            attachments: [{
                filename: `COPY_Repair_Clearance_1008_${equipmentItem.serial_number}_${new Date().toISOString().split('T')[0]}.html`,
                content: base64data,
                content_type: 'text/html'
            }]
        });
      };

      reader.readAsDataURL(blob);

      console.log(`Repair clearance email queued for ${soldier.email} and management.`);
    } catch (error) {
      console.error("Error sending repair clearance email:", error);
    }
  };

  const handleSendToRepair = async () => {
    if (!equipment || equipment.assignment_status !== "issued") return;

    if (!confirm((t.confirmSendToRepairAndClearSoldier || "Confirm sending {equipmentName} to repair? This will clear the soldier of responsibility.").replace('{equipmentName}', equipment.object_name || 'this item'))) {
      return;
    }

    setIsProcessing(true);

    try {
      // Find the soldier who had this equipment
      const soldiers = await Soldier.list();
      const soldier = soldiers.find(s => s.soldier_id === equipment.issued_soldier_id);

      // Find active assignment more efficiently
      const activeAssignments = await Assignment.filter({
        equipment_id: equipment.serial_number,
        soldier_id: equipment.issued_soldier_id,
        status: "active"
      });
      const activeAssignment = activeAssignments.length > 0 ? activeAssignments[0] : null;

      // Update assignment to returned with repair clearance data
      if (activeAssignment) {
        const repairClearanceData = {
          ...activeAssignment.signature_data,
          return_date: new Date().toISOString().split('T')[0], // Kept as date only for database
          return_status: 'cleared_repair',
          return_stamp: 'זוכה',
          repair_reason: 'Sent to repair department',
          processed_by: 'Equipment Manager'
        };

        await Assignment.update(activeAssignment.id, {
          status: 'returned',
          return_date: new Date().toISOString().split('T')[0], // Kept as date only for database
          condition_on_return: equipment.condition || 'fair',
          notes: 'Returned and sent to repair - CLEARED (זוכה)',
          signature_data: repairClearanceData
        });
      }

      // Update equipment status to repair
      await Equipment.update(equipment.id, {
        assignment_status: "repair",
        issued_soldier_id: null,
        issued_soldier_name: null,
        notes: `Sent to repair on ${new Date().toLocaleString()} - Previous soldier cleared (זוכה)`
      });

      // Send clearance email if soldier has email
      if (soldier?.email) {
        await sendRepairClearanceEmail(equipment, activeAssignment, soldier);
      }

      alert((t.equipmentSentToRepairSuccess || "Equipment sent to repair. {soldierEmailStatus}").replace('{soldierEmailStatus}', soldier?.email ? (t.emailSentToSoldierAndManagement || "Email sent to soldier and management") : (t.noEmailFoundForSoldier || "No email found for soldier")));

      // Call onUpdate if available to refresh the parent component
      if (onUpdate) {
        onUpdate();
      }

    } catch (error) {
      console.error("Error sending equipment to repair:", error);
      alert(t.errorProcessingRepairRequest || "Error processing repair request.");
    }

    setIsProcessing(false);
  };

  const handleSendToRepairFromStorage = async () => {
    if (!equipment || equipment.assignment_status !== "storage") return;

    if (!confirm((t.confirmSendToRepairFromStorage || "Send {equipmentName} to repair from storage?").replace('{equipmentName}', equipment.object_name || 'this item'))) {
      return;
    }

    setIsProcessing(true);
    try {
        await Equipment.update(equipment.id, {
            assignment_status: "repair",
            notes: `Sent to repair from storage on ${new Date().toLocaleString()}`
        });

        alert(t.equipmentSentToRepairSuccessfully || "Equipment sent to repair successfully.");

        if (onUpdate) {
            onUpdate();
        }
    } catch (error) {
        console.error("Error sending equipment to repair from storage:", error);
        alert(t.errorProcessingRepairRequest || "Error processing repair request.");
    }
    setIsProcessing(false);
  };

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleEditComplete = () => {
    setShowEditModal(false);
    if (onUpdate) {
      onUpdate();
    }
  };

  if (!equipment) {
    return (
      <Card className="sticky top-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {t.equipmentDetails || "Equipment Details"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-slate-500">
            <p>{t.selectItemToSeeDetails || "Select an item to see its details."}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const detailItems = [
    { label: t.serialNumber || "Serial Number", value: equipment.serial_number, icon: Package },
    { label: t.category || "Category", value: equipment.category, icon: FileText },
    { label: t.acquisitionDate || "Acquisition Date", value: formatDate(equipment.acquisition_date), icon: Calendar },
    { label: t.lastMaintenance || "Last Maintenance", value: formatDate(equipment.last_maintenance), icon: Wrench },
    { label: t.condition || "Condition", value: equipment.condition, icon: HeartPulse },
    {
      label: t.status || "Status",
      value: equipment.assignment_status,
      badge: true,
      color: statusColors[equipment.assignment_status] || statusColors.default
    },
    { label: t.currentHolder || "Current Holder", value: equipment.issued_soldier_name || (t.noHolder || "No holder"), icon: User },
    { label: t.platoon || "Platoon", value: equipment.platoon, icon: Users },
  ];

  return (
    <>
      <Card className="sticky top-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {equipment.object_name || "Equipment Details"}
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            className="absolute top-4 right-4"
            onClick={handleEditClick}
          >
            <Edit className="w-4 h-4 mr-2" />
            {t.updateEquipment || "Update"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-6">
            {detailItems.map((item, index) => (
              item.icon && (
                <div key={index} className="flex items-start justify-between text-sm">
                  <span className="flex items-center text-slate-500">
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </span>
                  {item.badge ? (
                    <Badge variant="secondary" className={`${item.color} border text-xs`}>
                      {item.value || "N/A"}
                    </Badge>
                  ) : (
                    <span className="font-medium text-slate-800 text-right">{item.value || "N/A"}</span>
                  )}
                </div>
              )
            ))}
          </div>

          <div className="space-y-2 mb-6">
            <Label className="flex items-center"><MessageSquare className="w-4 h-4 mr-2" /> {t.notes || "Notes"}</Label>
            <div className="text-sm p-3 bg-slate-50 rounded-md min-h-[60px]">
              {equipment.notes || <span className="text-slate-400">{t.noNotesProvided || "No notes provided."}</span>}
            </div>
          </div>

          <div className="space-y-2 mb-6">
            {equipment.assignment_status === "issued" && (
              <Button
                className="w-full bg-orange-600 hover:bg-orange-700"
                onClick={handleSendToRepair}
                disabled={isProcessing}
              >
                <Wrench className="w-4 h-4 mr-2" />
                {isProcessing ? (t.processing || "Processing...") : (t.sendToRepairAndClearSoldier || "Send to Repair & Clear Soldier")}
              </Button>
            )}
            {equipment.assignment_status === "storage" && (
              <Button
                className="w-full bg-orange-600 hover:bg-orange-700"
                onClick={handleSendToRepairFromStorage}
                disabled={isProcessing}
              >
                <Wrench className="w-4 h-4 mr-2" />
                {isProcessing ? (t.processing || "Processing...") : (t.sendToRepair || "Send to Repair")}
              </Button>
            )}
            {equipment.assignment_status === "repair" && (
              <p className="text-sm text-center text-slate-500 p-2 bg-slate-100 rounded-md">{t.itemUnderRepair || "This item is currently under repair."}</p>
            )}
          </div>

          <div className="mb-6">
            <h4 className="font-semibold mb-3 flex items-center"><History className="w-4 h-4 mr-2"/>{t.assignmentHistory || "Assignment History"}</h4>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {isHistoryLoading ? (
                <p className="text-slate-500">{t.loadingHistory || "Loading history..."}</p>
              ) : assignments.length > 0 ? (
                assignments.map(assignment => (
                  <div key={assignment.id} className="p-3 bg-slate-50 rounded-md text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{assignment.soldier_name || "Unknown Soldier"}</span>
                      <Badge variant={assignment.status === 'active' ? 'default' : 'secondary'}>{assignment.status || "unknown"}</Badge>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      <span>{t.from || "From"}: {formatDate(assignment.assignment_date)}</span>
                      {assignment.return_date && <span> | {t.to || "To"}: {formatDate(assignment.return_date)}</span>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">{t.noAssignmentHistory || "No assignment history found."}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {showEditModal && (
        <EditEquipmentModal
          equipment={equipment}
          onComplete={handleEditComplete}
          onClose={() => setShowEditModal(false)}
          t={t}
        />
      )}
    </>
  );
}
