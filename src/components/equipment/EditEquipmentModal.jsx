import React, { useState } from "react";
import { Equipment, OldEquipment, User } from "@/entities/all";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function EditEquipmentModal({ equipment, onComplete, onClose, t }) {
  const [equipmentData, setEquipmentData] = useState({
    serial_number: equipment.serial_number || "",
    object_name: equipment.object_name || "",
    platoon: equipment.platoon || "",
    squad: equipment.squad || "",
    assignment_status: equipment.assignment_status || "storage",
    condition: equipment.condition || "good",
    category: equipment.category || "",
    acquisition_date: equipment.acquisition_date || "",
    last_maintenance: equipment.last_maintenance || "",
    notes: equipment.notes || ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletionReason, setDeletionReason] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      await Equipment.update(equipment.id, equipmentData);
      onComplete();
    } catch (error) {
      console.error("Error updating equipment:", error);
      alert("Error updating equipment. Please try again.");
    }
    
    setIsProcessing(false);
  };

  const handleDelete = async () => {
    if (!deletionReason.trim()) {
      alert("Please provide a reason for deleting this equipment.");
      return;
    }

    setIsProcessing(true);
    try {
      // Get current user for deletion tracking
      let currentUser;
      try {
        currentUser = await User.me();
      } catch (error) {
        currentUser = { email: "system@app.com" };
      }

      // Create record in OldEquipment table
      await OldEquipment.create({
        original_id: equipment.id,
        serial_number: equipment.serial_number,
        object_name: equipment.object_name,
        platoon: equipment.platoon,
        issued_soldier_name: equipment.issued_soldier_name,
        issued_soldier_id: equipment.issued_soldier_id,
        assignment_status: equipment.assignment_status,
        squad: equipment.squad,
        signature: equipment.signature,
        condition: equipment.condition,
        category: equipment.category,
        acquisition_date: equipment.acquisition_date,
        last_maintenance: equipment.last_maintenance,
        notes: equipment.notes,
        deletion_reason: deletionReason,
        deletion_date: new Date().toISOString().split('T')[0],
        deleted_by: currentUser.email
      });

      // Delete from Equipment table
      await Equipment.delete(equipment.id);

      alert("Equipment has been deleted and archived successfully.");
      onComplete();
    } catch (error) {
      console.error("Error deleting equipment:", error);
      alert("Error deleting equipment. Please try again.");
    }
    
    setIsProcessing(false);
  };

  const canDelete = equipment.assignment_status === 'storage';

  if (showDeleteConfirm) {
    return (
      <Dialog open onOpenChange={() => setShowDeleteConfirm(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You are about to permanently delete <strong>{equipment.object_name}</strong> (S/N: {equipment.serial_number}).
                This action cannot be undone, but the equipment will be archived for record keeping.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="deletion_reason">Reason for Deletion *</Label>
              <Textarea
                id="deletion_reason"
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                placeholder="e.g., Damaged beyond repair, Lost, Obsolete, etc."
                rows={3}
                required
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDelete}
                disabled={isProcessing || !deletionReason.trim()}
              >
                {isProcessing ? "Deleting..." : "Delete Equipment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.updateEquipment || "Update Equipment"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_serial_number">{t.serialNumber || "Serial Number"} *</Label>
              <Input
                id="edit_serial_number"
                value={equipmentData.serial_number}
                onChange={(e) => setEquipmentData({...equipmentData, serial_number: e.target.value})}
                required
                placeholder="Enter unique serial number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_object_name">Equipment Name *</Label>
              <Input
                id="edit_object_name"
                value={equipmentData.object_name}
                onChange={(e) => setEquipmentData({...equipmentData, object_name: e.target.value})}
                required
                placeholder="Enter equipment name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_platoon">{t.platoon || "Platoon"}</Label>
              <Input
                id="edit_platoon"
                value={equipmentData.platoon}
                onChange={(e) => setEquipmentData({...equipmentData, platoon: e.target.value})}
                placeholder="Enter platoon"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_squad">{t.squad || "Squad"}</Label>
              <Input
                id="edit_squad"
                value={equipmentData.squad}
                onChange={(e) => setEquipmentData({...equipmentData, squad: e.target.value})}
                placeholder="Enter squad"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_assignment_status">{t.status || "Status"}</Label>
              <Select
                value={equipmentData.assignment_status}
                onValueChange={(value) => setEquipmentData({...equipmentData, assignment_status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="storage">{t.storage || "Storage"}</SelectItem>
                  <SelectItem value="issued">{t.issued || "Issued"}</SelectItem>
                  <SelectItem value="repair">{t.repair || "Repair"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_condition">{t.condition || "Condition"}</Label>
              <Select
                value={equipmentData.condition}
                onValueChange={(value) => setEquipmentData({...equipmentData, condition: value})}
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
            
            <div className="space-y-2">
              <Label htmlFor="edit_category">{t.category || "Category"}</Label>
              <Input
                id="edit_category"
                value={equipmentData.category}
                onChange={(e) => setEquipmentData({...equipmentData, category: e.target.value})}
                placeholder="Enter category"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_acquisition_date">{t.acquisitionDate || "Acquisition Date"}</Label>
              <Input
                id="edit_acquisition_date"
                type="date"
                value={equipmentData.acquisition_date}
                onChange={(e) => setEquipmentData({...equipmentData, acquisition_date: e.target.value})}
              />
            </div>
            
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit_last_maintenance">{t.lastMaintenance || "Last Maintenance"}</Label>
              <Input
                id="edit_last_maintenance"
                type="date"
                value={equipmentData.last_maintenance}
                onChange={(e) => setEquipmentData({...equipmentData, last_maintenance: e.target.value})}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit_notes">{t.notes || "Notes"}</Label>
            <Textarea
              id="edit_notes"
              value={equipmentData.notes}
              onChange={(e) => setEquipmentData({...equipmentData, notes: e.target.value})}
              placeholder="Enter additional notes"
              rows={3}
            />
          </div>
          
          <div className="flex justify-between">
            <div>
              {canDelete ? (
                <Button 
                  type="button" 
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isProcessing}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Equipment
                </Button>
              ) : (
                <Alert className="max-w-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Equipment can only be deleted when in storage status.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                {t.cancel || "Cancel"}
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? (t.updating || "Updating...") : (t.updateEquipment || "Update Equipment")}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}