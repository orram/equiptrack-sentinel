import React, { useState } from "react";
import { SupplantingItem } from "@/entities/all";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";

export default function EditSupplantingItemModal({ item, equipment, onComplete, onClose }) {
  const [formData, setFormData] = useState({
    equipment_name: item?.equipment_name || "",
    supplanting_item_name: item?.supplanting_item_name || "",
    description: item?.description || "",
    is_default: item?.is_default ?? true
  });
  const [equipmentSearch, setEquipmentSearch] = useState(item?.equipment_name || "");
  const [showEquipmentList, setShowEquipmentList] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const equipmentNames = [...new Set(equipment.map(e => e.object_name))].sort();
  
  const filteredEquipment = equipmentNames.filter(name => 
    name.toLowerCase().includes(equipmentSearch.toLowerCase())
  );

  const handleEquipmentSelect = (name) => {
    setFormData(prev => ({ ...prev, equipment_name: name }));
    setEquipmentSearch(name);
    setShowEquipmentList(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.equipment_name || !formData.supplanting_item_name) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsProcessing(true);
    try {
      await SupplantingItem.update(item.id, formData);
      onComplete();
    } catch (error) {
      console.error("Error updating supplanting item:", error);
      alert("Error updating item. Please try again.");
    }
    setIsProcessing(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Supplanting Item</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Main Equipment *</Label>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search for equipment..."
                  value={equipmentSearch}
                  onChange={(e) => {
                    setEquipmentSearch(e.target.value);
                    setFormData(prev => ({ ...prev, equipment_name: e.target.value }));
                    setShowEquipmentList(true);
                  }}
                  onFocus={() => setShowEquipmentList(true)}
                  className="pl-10"
                />
              </div>
              
              {showEquipmentList && filteredEquipment.length > 0 && (
                <div className="max-h-48 overflow-y-auto border rounded-lg bg-white shadow-lg">
                  {filteredEquipment.map((name) => (
                    <button
                      key={name}
                      type="button"
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                      onClick={() => handleEquipmentSelect(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="supplanting_item_name">Supplanting Item Name *</Label>
            <Input
              id="supplanting_item_name"
              value={formData.supplanting_item_name}
              onChange={(e) => setFormData({...formData, supplanting_item_name: e.target.value})}
              placeholder="e.g., Magazine, Scope, Battery"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Additional details about this item..."
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_default"
              checked={formData.is_default}
              onCheckedChange={(checked) => setFormData({...formData, is_default: checked})}
            />
            <Label htmlFor="is_default" className="text-sm">
              Add by default when assigning this equipment type
            </Label>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? "Updating..." : "Update Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}