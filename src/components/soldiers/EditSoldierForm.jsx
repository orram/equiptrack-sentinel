import React, { useState } from "react";
import { Soldier, Equipment } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCog, Save, X } from "lucide-react";

export default function EditSoldierForm({ soldier, onSave, onCancel, t }) {
  const [soldierData, setSoldierData] = useState({
    soldier_id: soldier.soldier_id || "",
    full_name: soldier.full_name || "",
    rank: soldier.rank || "",
    platoon: soldier.platoon || "",
    squad: soldier.squad || "",
    phone: soldier.phone || "",
    email: soldier.email || "",
    status: soldier.status || "active"
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await Soldier.update(soldier.id, soldierData);

      // Sync relevant fields to all equipment issued to this soldier
      const nameChanged = soldierData.full_name !== soldier.full_name;
      const platoonChanged = soldierData.platoon !== soldier.platoon;
      const squadChanged = soldierData.squad !== soldier.squad;
      const idChanged = soldierData.soldier_id !== soldier.soldier_id;

      if (nameChanged || platoonChanged || squadChanged || idChanged) {
        // Fetch all issued equipment and match by EITHER soldier_id OR soldier_name
        // to catch equipment with stale/mismatched IDs
        const allIssuedEquipment = await Equipment.filter({ assignment_status: 'issued' });
        const issuedEquipment = allIssuedEquipment.filter(item =>
          item.issued_soldier_id === soldier.soldier_id ||
          (item.issued_soldier_name && item.issued_soldier_name === soldier.full_name)
        );

        const updatePayload = {
          issued_soldier_id: soldierData.soldier_id,
          issued_soldier_name: soldierData.full_name,
          platoon: soldierData.platoon,
          squad: soldierData.squad,
        };

        for (const item of issuedEquipment) {
          await Equipment.update(item.id, updatePayload);
        }
      }

      onSave();
    } catch (error) {
      console.error("Error updating soldier:", error);
      alert(t.errorUpdatingSoldier);
    }
    setIsProcessing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="w-5 h-5" />
          {t.editSoldierProfile}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_soldier_id">{t.soldierId} *</Label>
              <Input
                id="edit_soldier_id"
                value={soldierData.soldier_id}
                onChange={(e) => setSoldierData({...soldierData, soldier_id: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_full_name">{t.fullName} *</Label>
              <Input
                id="edit_full_name"
                value={soldierData.full_name}
                onChange={(e) => setSoldierData({...soldierData, full_name: e.target.value})}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="edit_rank">{t.rank}</Label>
              <Input
                id="edit_rank"
                value={soldierData.rank}
                onChange={(e) => setSoldierData({...soldierData, rank: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_platoon">{t.platoon}</Label>
              <Input
                id="edit_platoon"
                value={soldierData.platoon}
                onChange={(e) => setSoldierData({...soldierData, platoon: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_squad">{t.squad}</Label>
            <Input
              id="edit_squad"
              value={soldierData.squad}
              onChange={(e) => setSoldierData({...soldierData, squad: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="edit_phone">{t.phone}</Label>
              <Input
                id="edit_phone"
                value={soldierData.phone}
                onChange={(e) => setSoldierData({...soldierData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_email">{t.email}</Label>
              <Input
                id="edit_email"
                type="email"
                value={soldierData.email}
                onChange={(e) => setSoldierData({...soldierData, email: e.target.value})}
              />
            </div>
          </div>
           <div className="space-y-2">
            <Label htmlFor="edit_status">{t.status}</Label>
            <Select
              value={soldierData.status}
              onValueChange={(value) => setSoldierData({...soldierData, status: value})}
            >
              <SelectTrigger id="edit_status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t.statusActive}</SelectItem>
                <SelectItem value="transferred">{t.statusTransferred}</SelectItem>
                <SelectItem value="discharged">{t.statusDischarged}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              {t.cancel}
            </Button>
            <Button 
              type="submit"
              disabled={isProcessing}
              className="bg-slate-900 hover:bg-slate-800"
            >
              <Save className="w-4 h-4 mr-2" />
              {isProcessing ? t.saving : t.saveChanges}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}