import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SignaturePad from "@/components/signature/SignaturePad";

export default function ApprovalDialog({ open, status, onClose, onSubmit }) {
  const signatureRef = useRef(null);
  const [formData, setFormData] = useState({ name: "", rank: "", idNumber: "" });

  const handleSubmit = () => {
    if (!formData.name || !formData.rank || !formData.idNumber) {
      alert("יש למלא שם, דרגה ומספר אישי");
      return;
    }
    if (signatureRef.current?.isEmpty()) {
      alert("נדרשת חתימה");
      return;
    }
    onSubmit({ ...formData, signature: signatureRef.current.toDataURL() });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>{status === "approved" ? "אישור ירוק בעיניים" : "סימון לא מאושר"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>שם</Label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>דרגה</Label>
            <Input value={formData.rank} onChange={(e) => setFormData({ ...formData, rank: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>מספר אישי</Label>
            <Input value={formData.idNumber} onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>חתימה</Label>
          <SignaturePad ref={signatureRef} height={180} className="w-full" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>ביטול</Button>
          <Button onClick={handleSubmit}>{status === "approved" ? "אשר" : "שמור לא מאושר"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}