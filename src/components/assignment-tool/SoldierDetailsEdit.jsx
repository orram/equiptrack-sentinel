import React, { useState } from "react";
import { Soldier, Equipment, Assignment } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, UserCog, Save, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PLATOON_OPTIONS = ["א", "ב", "ג", "מסייעת", "דרג", "פלסם"];

export default function SoldierDetailsEdit({ soldier, onSave, onBack, t }) {
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
  const [idChanged, setIdChanged] = useState(false);

  const handleIdChange = (value) => {
    setSoldierData({ ...soldierData, soldier_id: value });
    setIdChanged(value !== soldier.soldier_id);
  };

  const handleSaveAndContinue = async () => {
    setIsProcessing(true);
    try {
      await Soldier.update(soldier.id, soldierData);

      // Sync platoon/squad/name on all equipment currently issued to this soldier
      // Match by EITHER soldier_id OR soldier_name to catch stale/mismatched records
      const platoonChanged = soldierData.platoon !== soldier.platoon;
      const squadChanged = soldierData.squad !== soldier.squad;
      const nameChanged = soldierData.full_name !== soldier.full_name;
      const idChanged2 = soldierData.soldier_id !== soldier.soldier_id;

      if (platoonChanged || squadChanged || nameChanged || idChanged2) {
        const allIssuedEquipment = await Equipment.filter({ assignment_status: 'issued' });
        const matchedEquipment = allIssuedEquipment.filter(item =>
          item.issued_soldier_id === soldier.soldier_id ||
          (item.issued_soldier_name && item.issued_soldier_name === soldier.full_name)
        );

        const equipmentUpdatePayload = {
          issued_soldier_id: soldierData.soldier_id,
          issued_soldier_name: soldierData.full_name,
          platoon: soldierData.platoon,
          squad: soldierData.squad,
        };

        for (const item of matchedEquipment) {
          await Equipment.update(item.id, equipmentUpdatePayload);
        }

        // Also update active Assignment records so ReturnTool can find them by new soldier_id
        if (idChanged2) {
          const activeAssignments = await Assignment.filter({ soldier_id: soldier.soldier_id, status: 'active' });
          for (const a of activeAssignments) {
            await Assignment.update(a.id, {
              soldier_id: soldierData.soldier_id,
              soldier_name: soldierData.full_name,
            });
          }
        }
      }

      onSave(soldierData);
    } catch (error) {
      console.error("Error updating soldier:", error);
      alert(t.errorUpdatingData || "Error updating soldier. Please try again.");
    }
    setIsProcessing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="w-5 h-5" />
          {t.editSoldierInfo}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {idChanged && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t.warningIdChange}
            </AlertDescription>
          </Alert>
        )}
        
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveAndContinue(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="soldier_id">{t.soldierId}</Label>
              <Input 
                id="soldier_id" 
                value={soldierData.soldier_id} 
                onChange={(e) => handleIdChange(e.target.value)}
                className={idChanged ? "border-amber-300 bg-amber-50" : ""}
              />
              {idChanged && (
                <p className="text-sm text-amber-600 mt-1">
                  {t.originalId}: {soldier.soldier_id}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="full_name">{t.fullName}</Label>
              <Input
                id="full_name"
                value={soldierData.full_name}
                onChange={(e) => setSoldierData({ ...soldierData, full_name: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rank">{t.rank}</Label>
              <Input
                id="rank"
                value={soldierData.rank}
                onChange={(e) => setSoldierData({ ...soldierData, rank: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="platoon">{t.platoon}</Label>
              <Select
                value={soldierData.platoon}
                onValueChange={(value) => setSoldierData({ ...soldierData, platoon: value })}
              >
                <SelectTrigger id="platoon">
                  <SelectValue placeholder={t.platoon} />
                </SelectTrigger>
                <SelectContent>
                  {PLATOON_OPTIONS.map(platoon => (
                    <SelectItem key={platoon} value={platoon}>{platoon}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="squad">{t.squad}</Label>
            <Input
              id="squad"
              value={soldierData.squad}
              onChange={(e) => setSoldierData({ ...soldierData, squad: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">{t.phone}</Label>
              <Input
                id="phone"
                type="tel"
                value={soldierData.phone}
                onChange={(e) => setSoldierData({ ...soldierData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                value={soldierData.email}
                onChange={(e) => setSoldierData({ ...soldierData, email: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.backToSearch}
            </Button>
            <Button type="submit" disabled={isProcessing}>
              <Save className="w-4 h-4 mr-2" />
              {isProcessing ? t.saving : t.saveAndContinue}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}