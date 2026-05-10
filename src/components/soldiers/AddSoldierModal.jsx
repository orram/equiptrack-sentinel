import React, { useState } from "react";
import { Soldier } from "@/entities/all";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/lib/language";

export default function AddSoldierModal({ onComplete, onClose }) {
  const { t } = useLanguage();
  const [soldierData, setSoldierData] = useState({
    soldier_id: "",
    full_name: "",
    rank: "",
    platoon: "",
    squad: "",
    phone: "",
    email: "",
    status: "active"
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [idWarning, setIdWarning] = useState(null); // null | {existingSoldier}

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Check if soldier_id is already used
      const existing = await Soldier.filter({ soldier_id: soldierData.soldier_id });
      if (existing.length > 0) {
        setIdWarning(existing[0]);
        setIsProcessing(false);
        return;
      }

      await Soldier.create(soldierData);
      onComplete(soldierData);
    } catch (error) {
      console.error("Error creating soldier:", error);
      alert(t.errorCreatingSoldier);
    }

    setIsProcessing(false);
  };

  const handleForceCreate = async () => {
    setIdWarning(null);
    setIsProcessing(true);
    try {
      await Soldier.create(soldierData);
      onComplete(soldierData);
    } catch (error) {
      console.error("Error creating soldier:", error);
      alert(t.errorCreatingSoldier);
    }
    setIsProcessing(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.addSoldier}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="soldier_id">{t.soldierId} *</Label>
              <Input
                id="soldier_id"
                value={soldierData.soldier_id}
                onChange={(e) => setSoldierData({...soldierData, soldier_id: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="full_name">{t.fullName} *</Label>
              <Input
                id="full_name"
                value={soldierData.full_name}
                onChange={(e) => setSoldierData({...soldierData, full_name: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rank">{t.rank}</Label>
              <Input
                id="rank"
                value={soldierData.rank}
                onChange={(e) => setSoldierData({...soldierData, rank: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="platoon">{t.platoon}</Label>
              <Input
                id="platoon"
                value={soldierData.platoon}
                onChange={(e) => setSoldierData({...soldierData, platoon: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="squad">{t.squad}</Label>
            <Input
              id="squad"
              value={soldierData.squad}
              onChange={(e) => setSoldierData({...soldierData, squad: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">{t.phone}</Label>
              <Input
                id="phone"
                value={soldierData.phone}
                onChange={(e) => setSoldierData({...soldierData, phone: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                value={soldierData.email}
                onChange={(e) => setSoldierData({...soldierData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">{t.status}</Label>
            <Select
              value={soldierData.status}
              onValueChange={(value) => setSoldierData({...soldierData, status: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t.statusActive}</SelectItem>
                <SelectItem value="transferred">{t.statusTransferred}</SelectItem>
                <SelectItem value="discharged">{t.statusDischarged}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {idWarning && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 text-sm">
              <p className="font-semibold text-amber-800 mb-1">⚠ Soldier ID already in use</p>
              <p className="text-amber-700">ID <strong>{soldierData.soldier_id}</strong> is already assigned to <strong>{idWarning.full_name}</strong> ({idWarning.rank}, {idWarning.platoon}).</p>
              <p className="text-amber-600 mt-1">Do you still want to create this soldier with the same ID?</p>
              <div className="flex gap-2 mt-3">
                <Button type="button" size="sm" variant="outline" onClick={() => setIdWarning(null)}>Go Back</Button>
                <Button type="button" size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={handleForceCreate}>Create Anyway</Button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t.cancel}
            </Button>
            <Button 
              type="submit"
              disabled={isProcessing}
              className="bg-slate-900 hover:bg-slate-800"
            >
              {isProcessing ? t.creating : t.createSoldier}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}