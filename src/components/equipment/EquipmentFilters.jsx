import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function EquipmentFilters({ filters, onFilterChange, equipment, t }) {
  const platoons = [...new Set(equipment.map(e => e.platoon).filter(Boolean))];
  const squads = [...new Set(equipment.map(e => e.squad).filter(Boolean))];
  
  // Check if there are any equipment items with no platoon assigned
  const hasNoPlatoonItems = equipment.some(e => !e.platoon);
  
  return (
    <div className="flex gap-3">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        <Select 
          value={filters.status} 
          onValueChange={(value) => onFilterChange({ ...filters, status: value })}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder={t.status} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allStatuses}</SelectItem>
            <SelectItem value="issued">{t.issued}</SelectItem>
            <SelectItem value="storage">{t.storage}</SelectItem>
            <SelectItem value="repair">{t.repair}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Select 
        value={filters.platoon} 
        onValueChange={(value) => onFilterChange({ ...filters, platoon: value })}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder={t.platoon} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.allPlatoons}</SelectItem>
          {platoons.map(platoon => (
            <SelectItem key={platoon} value={platoon}>{platoon}</SelectItem>
          ))}
          {hasNoPlatoonItems && (
            <SelectItem value="no_platoon">{t.noPlatoon || "No Platoon"}</SelectItem>
          )}
        </SelectContent>
      </Select>

      <Select 
        value={filters.squad} 
        onValueChange={(value) => onFilterChange({ ...filters, squad: value })}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder={t.squad} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.allSquads}</SelectItem>
          {squads.map(squad => (
            <SelectItem key={squad} value={squad}>{squad}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select 
        value={filters.condition} 
        onValueChange={(value) => onFilterChange({ ...filters, condition: value })}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder={t.condition} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.allConditions}</SelectItem>
          <SelectItem value="excellent">Excellent</SelectItem>
          <SelectItem value="good">Good</SelectItem>
          <SelectItem value="fair">Fair</SelectItem>
          <SelectItem value="poor">Poor</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}