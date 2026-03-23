
import React, { useState } from "react";
import { Equipment, Assignment, User } from "@/entities/all"; // Added User import
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, User as UserIcon } from "lucide-react"; // Renamed User to UserIcon to avoid conflict

export default function AssignmentModal({ equipment, soldiers, onComplete, onClose, t }) {
  const [selectedSoldierId, setSelectedSoldierId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [assignmentData, setAssignmentData] = useState({
    assignment_date: new Date().toISOString().split('T')[0],
    condition_on_assignment: equipment.condition || "good",
    notes: "",
    platoon: equipment.platoon || "",
    squad: equipment.squad || "",
    signature: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredSoldiers = soldiers.filter(soldier =>
    soldier.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    soldier.soldier_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedSoldier = soldiers.find(s => s.id === selectedSoldierId);

  const handleIssue = async () => {
    if (!selectedSoldier) return;

    setIsProcessing(true);
    try {
      // Get current user info for assignment tracking
      let currentUser;
      try {
        currentUser = await User.me();
      } catch (error) {
        console.error("Could not get current user:", error);
        currentUser = { full_name: "System User", email: "system@app.com" }; // Fallback user
      }

      // Create assignment record
      await Assignment.create({
        equipment_id: equipment.serial_number, // Use serial_number for consistency
        soldier_id: selectedSoldier.soldier_id,
        soldier_name: selectedSoldier.full_name,
        assignment_date: assignmentData.assignment_date,
        status: "active",
        condition_on_assignment: assignmentData.condition_on_assignment,
        notes: assignmentData.notes,
        location_platoon: assignmentData.platoon,
        assigned_by: currentUser.full_name || currentUser.email || "System User" // Use fetched user info or fallback
      });

      // Update equipment status
      await Equipment.update(equipment.id, {
        assignment_status: "issued", // Changed from "assigned" to "issued"
        issued_soldier_id: selectedSoldier.soldier_id, // Changed from assigned_soldier_id
        issued_soldier_name: selectedSoldier.full_name, // Changed from assigned_soldier_name
        platoon: assignmentData.platoon,
        squad: assignmentData.squad,
        signature: assignmentData.signature
      });

      onComplete();
    } catch (error) {
      console.error("Error issuing equipment:", error); // Changed from "Error assigning equipment"
    }
    setIsProcessing(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.issueEquipment}: {equipment.object_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Equipment Info */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <code className="text-sm bg-slate-200 px-2 py-1 rounded font-mono font-bold">
                {equipment.serial_number}
              </code>
              <span className="font-medium">{equipment.object_name}</span>
            </div>
          </div>

          {/* Soldier Selection */}
          <div>
            <Label>{t.selectSoldierToIssue}</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder={t.searchForSoldier}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg">
            {filteredSoldiers.map((soldier) => (
              <div
                key={soldier.id}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 ${
                  selectedSoldierId === soldier.id ? 'bg-slate-100' : ''
                }`}
                onClick={() => setSelectedSoldierId(soldier.id)}
              >
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-slate-600" /> {/* Changed to UserIcon */}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{soldier.full_name}</p>
                  <p className="text-sm text-slate-500">
                    {t.soldierId}: {soldier.soldier_id} • {soldier.platoon}
                  </p>
                </div>
              </div>
            ))}
            {filteredSoldiers.length === 0 && (
              <p className="text-center text-sm text-slate-500 py-4">{t.noSoldiersFound}</p>
            )}
          </div>

          {/* Assignment Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignment_date">Assignment Date</Label>
              <Input
                id="assignment_date"
                type="date"
                value={assignmentData.assignment_date}
                onChange={(e) => setAssignmentData({...assignmentData, assignment_date: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition on Assignment</Label>
              <Select
                value={assignmentData.condition_on_assignment}
                onValueChange={(value) => setAssignmentData({...assignmentData, condition_on_assignment: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platoon">Platoon</Label>
              <Input
                id="platoon"
                value={assignmentData.platoon}
                onChange={(e) => setAssignmentData({...assignmentData, platoon: e.target.value})}
                placeholder="Platoon"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="squad">Squad</Label>
              <Input
                id="squad"
                value={assignmentData.squad}
                onChange={(e) => setAssignmentData({...assignmentData, squad: e.target.value})}
                placeholder="Squad"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature">Signature/Acknowledgment</Label>
            <Input
              id="signature"
              value={assignmentData.signature}
              onChange={(e) => setAssignmentData({...assignmentData, signature: e.target.value})}
              placeholder="Digital signature or acknowledgment"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={assignmentData.notes}
              onChange={(e) => setAssignmentData({...assignmentData, notes: e.target.value})}
              placeholder="Assignment notes..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              {t.cancel}
            </Button>
            <Button
              onClick={handleIssue}
              disabled={!selectedSoldierId || isProcessing}
              className="bg-slate-900 hover:bg-slate-800"
            >
              {isProcessing ? t.issuing : t.completeIssuance}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
