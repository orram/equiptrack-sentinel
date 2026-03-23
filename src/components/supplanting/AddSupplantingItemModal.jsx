import React, { useState } from "react";
import { SupplantingItem } from "@/entities/all";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle, Search } from "lucide-react";

export default function AddSupplantingItemModal({ equipment, onComplete, onClose }) {
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [equipmentSearch, setEquipmentSearch] = useState("");
  const [showEquipmentList, setShowEquipmentList] = useState(false);
  const [supplantingItemName, setSupplantingItemName] = useState("");
  const [description, setDescription] = useState("");
  const [isDefault, setIsDefault] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [addedItems, setAddedItems] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const equipmentNames = [...new Set(equipment.map(e => e.object_name))].sort();
  
  const filteredEquipment = equipmentNames.filter(name => 
    name.toLowerCase().includes(equipmentSearch.toLowerCase())
  );

  const handleEquipmentSelect = (name) => {
    setSelectedEquipment(name);
    setEquipmentSearch("");
    setShowEquipmentList(false);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!selectedEquipment || !supplantingItemName.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsProcessing(true);
    try {
      const newItem = {
        equipment_name: selectedEquipment,
        supplanting_item_name: supplantingItemName.trim(),
        description: description.trim(),
        is_default: isDefault
      };
      await SupplantingItem.create(newItem);
      setAddedItems(prev => [...prev, newItem]);
      setSupplantingItemName("");
      setDescription("");
      setIsDefault(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Error creating supplanting item:", error);
      alert("Error creating item. Please try again.");
    }
    setIsProcessing(false);
  };

  const handleDone = () => {
    onComplete();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Supplanting Items</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Equipment Selection */}
          <div className="space-y-2">
            <Label>Main Equipment *</Label>
            {selectedEquipment ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="font-medium text-green-800">{selectedEquipment}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedEquipment("");
                    setAddedItems([]);
                  }}
                  className="text-green-600 hover:text-green-800"
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search for equipment..."
                    value={equipmentSearch}
                    onChange={(e) => {
                      setEquipmentSearch(e.target.value);
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
            )}
          </div>
          
          {selectedEquipment && (
            <form onSubmit={handleAddItem} className="space-y-4 p-4 border rounded-lg bg-slate-50">
              <div className="space-y-2">
                <Label htmlFor="supplanting_item_name">New Supplanting Item *</Label>
                <Input
                  id="supplanting_item_name"
                  value={supplantingItemName}
                  onChange={(e) => setSupplantingItemName(e.target.value)}
                  placeholder="e.g., Magazine, Scope"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional details..."
                  rows={2}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_default"
                  checked={isDefault}
                  onCheckedChange={setIsDefault}
                />
                <Label htmlFor="is_default">Add by default</Label>
              </div>
              
              <Button type="submit" disabled={isProcessing} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {isProcessing ? "Adding..." : "Add Item"}
              </Button>
              
              {showSuccess && (
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Item added successfully!
                </div>
              )}
            </form>
          )}

          {addedItems.length > 0 && (
            <div className="space-y-2">
              <Label>Added for {selectedEquipment} ({addedItems.length})</Label>
              <div className="max-h-32 overflow-y-auto space-y-1 p-2 bg-slate-50 rounded border">
                {addedItems.map((item, index) => (
                  <Badge key={index} variant="secondary" className="mr-1 mb-1">
                    {item.supplanting_item_name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button onClick={handleDone}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}