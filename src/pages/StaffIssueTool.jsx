
import React, { useState, useEffect } from "react";
import { Equipment, Soldier, Assignment, User } from "@/entities/all"; // Added User import
import { SendEmail } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Package,
  ArrowLeft,
  Search,
  CheckCircle,
  User as UserIcon // Renamed User import to UserIcon to avoid conflict
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function StaffIssueTool() {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [soldiers, setSoldiers] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedSoldier, setSelectedSoldier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const equipmentData = await Equipment.filter({ assignment_status: "storage" });
      await new Promise(resolve => setTimeout(resolve, 200));
      const soldierData = await Soldier.list();
      
      setEquipment(equipmentData);
      setSoldiers(soldierData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const filteredEquipment = equipment.filter(item =>
    item.object_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredEquipment.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredEquipment.map(item => item.id));
    }
  };

  const sendStaffIssueEmail = async (staffSergeant, issuedItems) => {
    if (!staffSergeant?.email) return;

    try {
      const issuePdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Staff Issue Form 1008</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.4;
              color: #333;
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
            .staff-stamp {
              background-color: #e3f2fd;
              border: 2px solid #2196f3;
              padding: 10px;
              text-align: center;
              margin: 20px 0;
              font-weight: bold;
              color: #1565c0;
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
            .acknowledgment { 
              background-color: #f9f9f9; 
              padding: 15px; 
              margin: 20px 0; 
              border-left: 4px solid #333;
            }
            .signature-section { 
              display: grid; 
              grid-template-columns: 1fr; 
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
              background-color: #f8f9fa;
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
          <div class="header">
            <div class="form-number">1008</div>
            <div class="form-title">STAFF EQUIPMENT ISSUE FORM</div>
            <div style="margin-top: 10px;">Military Equipment Management System</div>
          </div>

          <div class="staff-stamp">
            <div style="font-size: 20px; margin-bottom: 5px;">📋 STAFF ISSUE</div>
            <div>Equipment Issued to Staff Sergeant - ${new Date().toLocaleString()}</div>
          </div>

          <div class="section">
            <div class="section-title">STAFF SERGEANT INFORMATION</div>
            <div class="info-grid">
              <div>
                <div class="info-item">
                  <span class="label">Name:</span> ${staffSergeant.full_name}
                </div>
                <div class="info-item">
                  <span class="label">ID:</span> ${staffSergeant.soldier_id}
                </div>
                <div class="info-item">
                  <span class="label">Rank:</span> ${staffSergeant.rank || "Staff Sergeant"}
                </div>
              </div>
              <div>
                <div class="info-item">
                  <span class="label">Platoon:</span> ${staffSergeant.platoon || "N/A"}
                </div>
                <div class="info-item">
                  <span class="label">Squad:</span> ${staffSergeant.squad || "N/A"}
                </div>
                <div class="info-item">
                  <span class="label">Issue Date:</span> ${new Date().toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">ISSUED EQUIPMENT</div>
            <table class="equipment-table">
              <thead>
                <tr>
                  <th>Serial Number</th>
                  <th>Equipment Name</th>
                  <th>Condition</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${issuedItems.map(item => `
                  <tr>
                    <td>${item.serial_number}</td>
                    <td>${item.object_name}</td>
                    <td>${item.condition || "Good"}</td>
                    <td style="color: green; font-weight: bold;">ISSUED</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div><strong>Total Items Issued:</strong> ${issuedItems.length}</div>
          </div>

          <div class="acknowledgment">
            <strong>STAFF ACKNOWLEDGMENT:</strong><br>
            I hereby acknowledge that I have received the equipment listed above through the Staff Issue process. This equipment has been distributed to soldiers under my command. I understand my responsibility to track and manage this equipment distribution.
          </div>

          <div class="signature-section">
            <div>
              <div class="section-title">STAFF SERGEANT SIGNATURE</div>
              <div class="signature-box">
                [Digital signature required for official record]
              </div>
              <div>
                <span class="label">Name:</span> ${staffSergeant.full_name}<br>
                <span class="label">Date:</span> <span class="date-line">${new Date().toLocaleString()}</span><br>
                <span class="label">Issue Method:</span> Staff Issue Tool (No Individual Signatures)
              </div>
            </div>
          </div>

          <div class="footer">
            Form 1008 - Staff Equipment Issue Record<br>
            Generated: ${new Date().toLocaleString()}<br>
            EquipTrack Military Equipment Management System
          </div>
        </body>
        </html>
      `;

      const emailSubject = `📋 Staff Equipment Issue Confirmation - ${issuedItems.length} Items`;
      
      const emailBody = `
<p>Dear ${staffSergeant.full_name},</p>

<p><strong>📋 STAFF EQUIPMENT ISSUE CONFIRMATION</strong></p>

<p>The following equipment has been issued through the Staff Issue process and distributed to soldiers under your command:</p>

<p><strong>📦 ISSUED EQUIPMENT SUMMARY:</strong><br>
${issuedItems.map(item => `• ${item.object_name} - Serial: ${item.serial_number}`).join('<br>')}</p>

<p><strong>📋 ISSUE DETAILS:</strong><br>
• Issue Date: ${new Date().toLocaleString()}<br>
• Total Items: ${issuedItems.length}<br>
• Issue Method: Staff Issue Tool<br>
• Your Platoon: ${staffSergeant.platoon || 'N/A'}</p>

<p><strong>📌 IMPORTANT NOTES:</strong><br>
• This equipment has been distributed to individual soldiers without individual signatures.<br>
• Each soldier is now responsible for their assigned equipment.<br>
• Individual assignment records have been created in the system.<br>
• You maintain oversight responsibility for proper equipment management.<br>
• All equipment remains tracked in the EquipTrack system.</p>

<p><strong>📎 ATTACHMENT:</strong><br>
Official Form 1008 staff equipment issue record is attached for your records.</p>

<hr>
<p style="font-size: 12px; color: #666;">This is an automated notification from EquipTrack Military Equipment Management System.</p>

<p>Best regards,<br>
Equipment Management Team 🛡️</p>
`;

      // Create blob and convert to base64 for attachment
      const blob = new Blob([issuePdfContent], { type: 'text/html' });
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];
        
        try {
          await SendEmail({
            to: staffSergeant.email,
            subject: emailSubject,
            body: emailBody,
            from_name: "EquipTrack System",
            attachments: [{
              filename: `Staff_Issue_1008_${staffSergeant.soldier_id}_${new Date().toISOString().split('T')[0]}.html`,
              content: base64data,
              content_type: 'text/html'
            }]
          });
          console.log(`Staff issue email sent to ${staffSergeant.email}`);
        } catch (error) {
          console.error("Error sending staff issue email:", error);
        }
      };
      
      reader.readAsDataURL(blob);

    } catch (error) {
      console.error("Error preparing staff issue email:", error);
    }
  };

  const handleStaffIssue = async () => {
    if (selectedItems.length === 0 || !selectedSoldier) {
      alert("Please select at least one item and a staff sergeant.");
      return;
    }

    if (!confirm(`Issue ${selectedItems.length} items through ${selectedSoldier.full_name} (Staff Sergeant)?`)) {
      return;
    }

    setIsProcessing(true);
    const issuedItems = [];
    
    try {
      // Get current user info for assignment tracking
      let currentUser;
      try {
        currentUser = await User.me();
      } catch (error) {
        console.error("Could not get current user:", error);
        currentUser = { full_name: "System User", email: "system@app.com" }; // Fallback user
      }

      for (const itemId of selectedItems) {
        const equipmentItem = equipment.find(e => e.id === itemId);
        if (!equipmentItem) continue;

        // Create assignment record (without signature) - keeping individual soldier data if available
        await Assignment.create({
          equipment_id: equipmentItem.serial_number,
          soldier_id: equipmentItem.issued_soldier_id || selectedSoldier.soldier_id,
          soldier_name: equipmentItem.issued_soldier_name || selectedSoldier.full_name,
          assignment_date: new Date().toISOString().split('T')[0],
          status: "active",
          condition_on_assignment: equipmentItem.condition || "good",
          notes: `Issued via Staff Issue Tool through ${selectedSoldier.full_name} (Staff Sergeant) - No individual signature`,
          location_platoon: equipmentItem.platoon || selectedSoldier.platoon,
          assigned_by: `${currentUser.full_name || currentUser.email || "System User"} (via Staff Issue Tool)` // Changed assigned_by
        });

        // Update equipment status - keeping the original soldier data if it exists
        await Equipment.update(equipmentItem.id, {
          assignment_status: "issued",
          issued_soldier_id: equipmentItem.issued_soldier_id || selectedSoldier.soldier_id,
          issued_soldier_name: equipmentItem.issued_soldier_name || selectedSoldier.full_name,
          platoon: equipmentItem.platoon || selectedSoldier.platoon
        });

        issuedItems.push(equipmentItem);
        await new Promise(resolve => setTimeout(resolve, 200)); // Avoid rate limiting
      }

      // Send email to staff sergeant with 1008 document
      if (selectedSoldier.email) {
        await sendStaffIssueEmail(selectedSoldier, issuedItems);
      }

      alert(`Successfully issued ${selectedItems.length} items through ${selectedSoldier.full_name}. ${selectedSoldier.email ? 'Staff issue documentation sent via email.' : 'No email found for staff sergeant.'}`);
      setSelectedItems([]);
      setSelectedSoldier(null);
      loadData();
    } catch (error) {
      console.error("Error processing staff issue:", error);
      alert("Error processing request. Please try again.");
    }
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Staff Issue Tool</h1>
            <p className="text-slate-600 mt-1 text-sm md:text-base">Issue multiple items through staff sergeant without individual signatures.</p>
          </div>
        </div>

        <Card className="mb-4 md:mb-6">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search equipment in storage..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select onValueChange={(value) => setSelectedSoldier(soldiers.find(s => s.id === value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Staff Sergeant" />
                </SelectTrigger>
                <SelectContent>
                  {soldiers.map(soldier => (
                    <SelectItem key={soldier.id} value={soldier.id}>{soldier.full_name} ({soldier.soldier_id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4 md:mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedItems.length === filteredEquipment.length && filteredEquipment.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium">
                  Select All ({filteredEquipment.length} items)
                </label>
                {selectedItems.length > 0 && (
                  <Badge variant="secondary">{selectedItems.length} selected</Badge>
                )}
              </div>
              <Button
                onClick={handleStaffIssue}
                disabled={selectedItems.length === 0 || !selectedSoldier || isProcessing}
                className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isProcessing ? "Processing..." : `Staff Issue ${selectedItems.length} Items`}
              </Button>
            </div>
            {selectedItems.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h3 className="font-medium mb-2 text-slate-800">Selected Items:</h3>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                  {equipment
                    .filter(item => selectedItems.includes(item.id))
                    .map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-md">
                        <span>{item.object_name}</span>
                        <code className="text-xs bg-slate-200 px-1.5 py-1 rounded">{item.serial_number}</code>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Package className="w-5 h-5" />
              Equipment in Storage ({filteredEquipment.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? <p>Loading...</p> : filteredEquipment.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-3 border rounded-lg transition-colors ${
                    selectedItems.includes(item.id) ? 'bg-blue-50 border-blue-300' : 'hover:bg-slate-50'
                  }`}
                >
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => handleSelectItem(item.id)}
                  />
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.object_name}</h4>
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono font-semibold">
                      {item.serial_number}
                    </code>
                    {/* Show intended soldier if pre-assigned */}
                    {item.issued_soldier_name && (
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        Pre-assigned to: {item.issued_soldier_name}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">{item.condition || "Good"}</Badge>
                </div>
              ))}
              {!isLoading && filteredEquipment.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="font-medium">No equipment found in storage.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
