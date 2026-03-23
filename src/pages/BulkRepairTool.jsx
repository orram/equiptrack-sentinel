
import React, { useState, useEffect } from "react";
import { Equipment, Soldier, Assignment } from "@/entities/all";
import { SendEmail } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Package,
  ArrowLeft,
  Search,
  Wrench,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function BulkRepairTool() {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [soldiers, setSoldiers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const equipmentData = await Equipment.filter({ assignment_status: { $in: ["storage", "issued"] } });
      await new Promise(resolve => setTimeout(resolve, 200));
      const soldierData = await Soldier.list();
      await new Promise(resolve => setTimeout(resolve, 200));
      const assignmentData = await Assignment.filter({ status: "active" });

      setEquipment(equipmentData);
      setSoldiers(soldierData);
      setAssignments(assignmentData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };
  
  const sendRepairClearanceEmail = async (equipmentItem, assignment, soldier) => {
    if (!soldier?.email) return;

    try {
      const clearancePdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Equipment Return & Repair Form 1008</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; color: #333; position: relative; }
            .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 120px; font-weight: bold; color: rgba(0, 128, 0, 0.3); z-index: -1; font-family: Arial, sans-serif; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .form-number { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .form-title { font-size: 18px; font-weight: bold; }
            .clearance-stamp { background-color: #d4edda; border: 2px solid #28a745; padding: 10px; text-align: center; margin: 20px 0; font-weight: bold; color: #155724; }
            .repair-notice { background-color: #fff3cd; border: 2px solid #ffc107; padding: 10px; text-align: center; margin: 20px 0; font-weight: bold; color: #856404; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 20px; }
            .info-item { margin-bottom: 8px; }
            .label { font-weight: bold; display: inline-block; width: 120px; }
            .equipment-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .equipment-table th, .equipment-table td { border: 1px solid #333; padding: 8px; text-align: left; }
            .equipment-table th { background-color: #f5f5f5; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="watermark">זוכה</div>
          <div class="header">
            <div class="form-number">1008</div>
            <div class="form-title">EQUIPMENT RETURN & REPAIR FORM</div>
          </div>
          <div class="clearance-stamp"><div style="font-size: 24px; margin-bottom: 5px;">זוכה - CLEARED</div><div>Soldier Cleared of Responsibility</div></div>
          <div class="repair-notice"><div style="font-size: 18px; margin-bottom: 5px;">⚠️ SENT TO REPAIR</div></div>
          <div class="section"><div class="section-title">SOLDIER INFORMATION</div>
            <div class="info-grid">
              <div><div class="info-item"><span class="label">Name:</span> ${soldier?.full_name || 'N/A'}</div><div class="info-item"><span class="label">ID:</span> ${equipmentItem.issued_soldier_id}</div></div>
              <div><div class="info-item"><span class="label">Platoon:</span> ${equipmentItem.platoon || "N/A"}</div><div class="info-item"><span class="label">Return Date:</span> ${new Date().toLocaleString()}</div></div>
            </div>
          </div>
          <div class="section"><div class="section-title">EQUIPMENT SENT TO REPAIR</div>
            <table class="equipment-table"><thead><tr><th>Serial Number</th><th>Equipment Name</th><th>Status</th></tr></thead>
              <tbody><tr><td>${equipmentItem.serial_number}</td><td>${equipmentItem.object_name}</td><td style="color: orange; font-weight: bold;">SENT TO REPAIR</td></tr></tbody>
            </table>
          </div>
        </body>
        </html>`;

      const emailSubject = `✅ Equipment Cleared - Sent to Repair (זוכה)`;
      const emailBody = `<p>Dear ${soldier?.full_name || 'Soldier'},</p><p><strong>🎉 EQUIPMENT RESPONSIBILITY CLEARED - זוכה</strong></p><p>Your equipment has been returned and you are now officially cleared of responsibility. The equipment has been sent to repair.</p><p><strong>📦 EQUIPMENT DETAILS:</strong><br>• ${equipmentItem.object_name} - Serial: ${equipmentItem.serial_number}</p><p><strong>✅ CLEARANCE STATUS: זוכה (CLEARED)</strong></p><p>This is an automated notification from EquipTrack System.</p>`;

      const blob = new Blob([clearancePdfContent], { type: 'text/html' });
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];
        try {
          await SendEmail({
            to: soldier.email,
            subject: emailSubject,
            body: emailBody,
            from_name: "EquipTrack System",
            attachments: [{
              filename: `Repair_Clearance_${equipmentItem.serial_number}.html`,
              content: base64data,
              content_type: 'text/html'
            }]
          });
          console.log(`Repair clearance email sent to ${soldier.email}`);
        } catch (error) {
          console.error("Error sending repair clearance email:", error);
        }
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Error sending repair clearance email:", error);
    }
  };

  const filteredEquipment = equipment.filter(item =>
    item.object_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.issued_soldier_name?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleBulkRepair = async () => {
    if (selectedItems.length === 0) return;
    if (!confirm(`Send ${selectedItems.length} items to repair? This will clear soldiers of responsibility for any issued items.`)) {
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    for (const itemId of selectedItems) {
      const equipmentItem = equipment.find(e => e.id === itemId);
      if (!equipmentItem) continue;

      try {
        if (equipmentItem.assignment_status === 'issued') {
          const soldier = soldiers.find(s => s.soldier_id === equipmentItem.issued_soldier_id);
          const activeAssignment = assignments.find(a => a.equipment_id === equipmentItem.serial_number);
          
          if (activeAssignment) {
            await Assignment.update(activeAssignment.id, {
              status: 'returned',
              return_date: new Date().toISOString().split('T')[0],
              notes: 'Returned and sent to repair via Bulk Tool - CLEARED (זוכה)'
            });
          }
          if (soldier) {
            await sendRepairClearanceEmail(equipmentItem, activeAssignment, soldier);
          }
        }
        
        await Equipment.update(equipmentItem.id, {
          assignment_status: "repair",
          issued_soldier_id: null,
          issued_soldier_name: null,
          notes: `Sent to repair via Bulk Repair Tool on ${new Date().toLocaleString()}`
        });

        successCount++;
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Failed to process item ${equipmentItem.serial_number}:`, error);
      }
    }

    alert(`Successfully sent ${successCount} of ${selectedItems.length} items to repair.`);
    setSelectedItems([]);
    loadData();
    setIsProcessing(false);
  };

  const statusColors = {
    issued: "bg-green-100 text-green-800",
    storage: "bg-amber-100 text-amber-800",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("Dashboard"))}><ArrowLeft className="w-4 h-4" /></Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Bulk Repair Tool</h1>
            <p className="text-slate-600 mt-1 text-sm md:text-base">Send multiple equipment items to repair.</p>
          </div>
        </div>

        <Card className="mb-4 md:mb-6">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
              <div className="relative flex-grow w-full">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input placeholder="Search equipment..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Button onClick={handleBulkRepair} disabled={selectedItems.length === 0 || isProcessing} className="bg-orange-600 hover:bg-orange-700 w-full md:w-auto">
                <Wrench className="w-4 h-4 mr-2" />
                {isProcessing ? "Processing..." : `Send ${selectedItems.length} to Repair`}
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 border-t pt-4">
              <Checkbox id="select-all" checked={selectedItems.length === filteredEquipment.length && filteredEquipment.length > 0} onCheckedChange={handleSelectAll} />
              <label htmlFor="select-all" className="text-sm font-medium">Select All ({filteredEquipment.length})</label>
              {selectedItems.length > 0 && <Badge variant="secondary">{selectedItems.length} selected</Badge>}
            </div>

            {selectedItems.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h3 className="font-medium mb-2 text-slate-800">Selected for Repair:</h3>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                  {equipment
                    .filter(item => selectedItems.includes(item.id))
                    .map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-md">
                        <div>
                          <span>{item.object_name}</span>
                          {item.issued_soldier_name && (
                            <span className="text-xs text-slate-500 ml-2">(from {item.issued_soldier_name})</span>
                          )}
                        </div>
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
              Available Equipment ({filteredEquipment.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? <p>Loading...</p> : filteredEquipment.map((item) => (
                <div key={item.id} className={`flex items-center gap-4 p-3 border rounded-lg transition-colors ${selectedItems.includes(item.id) ? 'bg-blue-50 border-blue-300' : 'hover:bg-slate-50'}`}>
                  <Checkbox checked={selectedItems.includes(item.id)} onCheckedChange={() => handleSelectItem(item.id)} />
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0"><Package className="w-5 h-5 text-slate-600" /></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.object_name}</h4>
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono font-semibold">{item.serial_number}</code>
                  </div>
                  <div className="flex flex-col items-end text-xs">
                    <Badge variant="outline" className={`${statusColors[item.assignment_status]}`}>{item.assignment_status}</Badge>
                    {item.issued_soldier_name && <span className="mt-1 flex items-center gap-1 text-slate-500"><User className="w-3 h-3"/>{item.issued_soldier_name}</span>}
                  </div>
                </div>
              ))}
              {!isLoading && filteredEquipment.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p className="font-medium">No equipment available to send to repair.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
