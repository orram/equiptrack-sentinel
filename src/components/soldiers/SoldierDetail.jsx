import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Edit, Package, Layers, Trash2 } from "lucide-react";

export default function SoldierDetail({ soldier, assignments = [], equipment = [], inventoryItems = [], onEdit, onDelete, t }) {
  if (!soldier) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-full py-12">
          <User className="w-16 h-16 text-slate-300 mb-4" />
          <p className="text-slate-500">{t?.selectSoldierToSeeDetails || "Select a soldier to see details"}</p>
        </CardContent>
      </Card>
    );
  }

  const activeAssignments = assignments.filter(a => a?.status === 'active');

  const activeSerialized = activeAssignments
    .filter(a => !a.assignment_type || a.assignment_type === 'serialized')
    .map(a => equipment.find(e => e?.serial_number === a?.equipment_id))
    .filter(Boolean);
    
  const activeInventory = activeAssignments
    .filter(a => a?.assignment_type === 'inventory');

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {soldier.full_name || "Unknown Soldier"}
            </CardTitle>
            <CardDescription>{t?.soldierId || "Soldier ID"}: {soldier.soldier_id || "N/A"}</CardDescription>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(soldier)}>
                <Edit className="w-3 h-3 mr-2" />
                {t?.editProfile || "Edit Profile"}
              </Button>
            )}
            {onDelete && (
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => onDelete(soldier)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-slate-600 mb-6">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>{soldier.email || "No email"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>{soldier.phone || "No phone"}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{t?.platoon || "Platoon"}: {soldier.platoon || "N/A"}</span>
          </div>
           <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{t?.squad || "Squad"}: {soldier.squad || "N/A"}</span>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4"/>
            {t?.activeEquipment || "Active Equipment"} ({activeSerialized.length + activeInventory.length})
          </h4>
          
          {(activeSerialized.length + activeInventory.length) === 0 ? (
            <p className="text-sm text-slate-500">{t?.soldierHasNoEquipment || "This soldier has no equipment assigned."}</p>
          ) : (
            <div className="space-y-3">
              {/* Serialized Items */}
              {activeSerialized.map((item, index) => (
                <div key={item?.id || `serialized-${index}`} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-500"/>
                    <span className="font-medium text-sm">{item?.object_name || "Unknown Item"}</span>
                  </div>
                  <code className="text-xs bg-slate-200 px-2 py-1 rounded">{item?.serial_number || "N/A"}</code>
                </div>
              ))}
              {/* Inventory Items */}
              {activeInventory.map((item, index) => (
                <div key={item?.id || `inventory-${index}`} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-500"/>
                    <span className="font-medium text-sm">{item?.equipment_id || "Unknown Item"}</span>
                  </div>
                   <Badge variant="secondary">{item?.quantity || 0}x</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}