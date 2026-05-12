import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

export default function ControlTableAddEquipment({ equipment, controlItems, controlEntity, onItemsChange, language = 'he' }) {
  const [selectedName, setSelectedName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const isHe = language === 'he';

  const availableEquipmentNames = useMemo(() => {
    const existingNames = new Set(controlItems.map(item => String(item.name || "").trim()).filter(Boolean));
    return [...new Set(equipment.map(item => String(item.object_name || "").trim()).filter(Boolean))]
      .filter(name => !existingNames.has(name))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [equipment, controlItems]);

  const handleAdd = async () => {
    if (!selectedName) return;
    setIsAdding(true);
    const maxOrder = controlItems.reduce((max, item) => Math.max(max, Number(item.display_order) || 0), 0);
    const createdItem = await controlEntity.create({ name: selectedName, display_order: maxOrder + 1 });
    onItemsChange([...controlItems, createdItem].sort((a, b) => a.display_order - b.display_order));
    setSelectedName("");
    setIsAdding(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedName} onValueChange={setSelectedName} disabled={availableEquipmentNames.length === 0 || isAdding}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder={isHe ? "בחר ציוד להוספה" : "Choose equipment"} />
        </SelectTrigger>
        <SelectContent>
          {availableEquipmentNames.map(name => (
            <SelectItem key={name} value={name}>{name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleAdd} variant="outline" disabled={!selectedName || isAdding}>
        <Plus className={`w-4 h-4 ${isHe ? 'ml-2' : 'mr-2'}`} />
        {isHe ? "הוסף לטבלה" : "Add to table"}
      </Button>
    </div>
  );
}