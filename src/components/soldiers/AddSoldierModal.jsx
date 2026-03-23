import React, { useState } from "react";
import { Soldier } from "@/entities/all";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "../../layout.js";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      await Soldier.create(soldierData);
      // Pass the soldier data that was used to create the record
      onComplete(soldierData);
    } catch (error) {
      console.error("Error creating soldier:", error);
      alert("Error creating soldier. Please try again.");
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="transferred">Transferred</SelectItem>
                <SelectItem value="discharged">Discharged</SelectItem>
              </SelectContent>
            </Select>
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
              {isProcessing ? t.creating : t.createSoldier}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}