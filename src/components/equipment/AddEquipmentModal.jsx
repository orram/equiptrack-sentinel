
import React, { useState } from "react";
import { Equipment } from "@/entities/all";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AddEquipmentModal({ onComplete, onClose, t }) {
  const [equipmentData, setEquipmentData] = useState({
    serial_number: "",
    object_name: "",
    platoon: "",
    squad: "",
    assignment_status: "storage",
    condition: "good",
    category: "",
    acquisition_date: "",
    last_maintenance: "",
    notes: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      await Equipment.create(equipmentData);
      onComplete(equipmentData);
    } catch (error) {
      console.error("Error creating equipment:", error);
      alert("Error creating equipment. Please try again.");
    }
    
    setIsProcessing(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.addNewEquipment}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serial_number">{t.serialNumber} *</Label>
              <Input
                id="serial_number"
                value={equipmentData.serial_number}
                onChange={(e) => setEquipmentData({...equipmentData, serial_number: e.target.value})}
                required
                placeholder="Enter unique serial number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="object_name">{t.equipmentName} *</Label>
              <Input
                id="object_name"
                value={equipmentData.object_name}
                onChange={(e) => setEquipmentData({...equipmentData, object_name: e.target.value})}
                required
                placeholder="Enter equipment name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platoon">{t.platoon}</Label>
              <Input
                id="platoon"
                value={equipmentData.platoon}
                onChange={(e) => setEquipmentData({...equipmentData, platoon: e.target.value})}
                placeholder="Enter platoon"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="squad">{t.squad}</Label>
              <Input
                id="squad"
                value={equipmentData.squad}
                onChange={(e) => setEquipmentData({...equipmentData, squad: e.target.value})}
                placeholder="Enter squad"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignment_status">{t.status}</Label>
              <Select
                value={equipmentData.assignment_status}
                onValueChange={(value) => setEquipmentData({...equipmentData, assignment_status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="storage">{t.storage}</SelectItem>
                  <SelectItem value="issued">{t.issued}</SelectItem>
                  <SelectItem value="repair">{t.repair}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">{t.condition}</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{t.category}</Label>
            <Input
              id="category"
              value={equipmentData.category}
              onChange={(e) => setEquipmentData({...equipmentData, category: e.target.value})}
              placeholder="Enter equipment category"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="acquisition_date">{t.acquisitionDate}</Label>
              <Input
                id="acquisition_date"
                type="date"
                value={equipmentData.acquisition_date}
                onChange={(e) => setEquipmentData({...equipmentData, acquisition_date: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last_maintenance">{t.lastMaintenance}</Label>
              <Input
                id="last_maintenance"
                type="date"
                value={equipmentData.last_maintenance}
                onChange={(e) => setEquipmentData({...equipmentData, last_maintenance: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t.notes}</Label>
            <Textarea
              id="notes"
              value={equipmentData.notes}
              onChange={(e) => setEquipmentData({...equipmentData, notes: e.target.value})}
              placeholder="Additional notes or comments"
              className="h-20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t.cancel}
            </Button>
            <Button 
              type="submit"
              disabled={isProcessing}
              className="bg-slate-900 hover:bg-slate-800"
            >
              {isProcessing ? t.creating : t.createEquipment}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
