import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Package, Edit, ShieldCheck, AlertCircle, Layers } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import SignaturePad from "../signature/SignaturePad";

export default function DigitalSignature({
  soldier,
  pendingAssignments = [],
  pendingReassignments = [],
  supplantingItems = {},
  onComplete,
  onCancel,
  t = {}
}) {
  const soldierSigRef = useRef(null);
  const witnessSigRef = useRef(null);
  const [witnessName, setWitnessName] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleComplete = async () => {
    if (soldierSigRef.current?.isEmpty()) {
      setError(t.soldierSignatureRequired || "Soldier signature is required.");
      return;
    }
    setError("");
    setIsProcessing(true);

    const signatureData = {
      type: "canvas",
      soldier_signature_canvas: soldierSigRef.current.toDataURL(),
      witness_name: witnessName || null,
      witness_signature_canvas: witnessSigRef.current && !witnessSigRef.current.isEmpty()
        ? witnessSigRef.current.toDataURL()
        : null,
      date: new Date().toISOString(),
      supplanting_items: supplantingItems
    };

    await onComplete(signatureData);
    setIsProcessing(false);
  };

  const allSupplantingItems = Object.entries(supplantingItems || {})
    .flatMap(([key, items]) => items.map(item => ({ equipmentSerial: key, name: item })));

  return (
    <Dialog open onOpenChange={onCancel}>
        <DialogContent className="max-w-4xl w-[95vw] sm:w-full p-4 md:p-6">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <Edit className="w-5 h-5" />
                    {t.signOffTitle || "Equipment Assignment Sign-off"}
                </DialogTitle>
            </DialogHeader>
            <div className="max-h-[75vh] overflow-y-auto pr-2 space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-50 p-3 rounded-lg">
                    <User className="w-8 h-8 text-slate-500 flex-shrink-0" />
                    <div>
                        <p className="font-bold text-base md:text-lg text-slate-800">{soldier.full_name}</p>
                        <p className="text-xs md:text-sm text-slate-500">{t.soldierId}: {soldier.soldier_id} • {t.platoon}: {soldier.platoon}</p>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        {t.acknowledgeEquipment || "Equipment to Acknowledge"} ({pendingAssignments.length})
                    </h3>
                    <div className="space-y-2 rounded-lg border p-2 bg-slate-50/50 max-h-40 overflow-y-auto">
                        {pendingAssignments.map((item, index) => (
                            <div key={item.id || index} className="text-xs md:text-sm p-2 bg-white rounded-md shadow-sm flex items-center gap-2">
                                {item.assignment_type === 'serialized' ? 
                                    <Package className="w-4 h-4 text-slate-500 flex-shrink-0"/> : 
                                    <Layers className="w-4 h-4 text-slate-500 flex-shrink-0"/>
                                }
                                <span className="font-medium">{item.object_name}</span>
                                {item.assignment_type === 'serialized' ? 
                                    <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono font-semibold ml-auto">{item.serial_number}</code> :
                                    <Badge variant="secondary" className="ml-auto">{item.quantity}x</Badge>
                                }
                            </div>
                        ))}
                    </div>
                </div>
                {allSupplantingItems.length > 0 && (
                    <div>
                    <h3 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        {t.supplantingItems || "Supplanting Items"} ({allSupplantingItems.length})
                    </h3>
                    <div className="space-y-2 rounded-lg border p-2 bg-slate-50/50 max-h-40 overflow-y-auto">
                        {allSupplantingItems.map((item, index) => (
                        <div key={index} className="text-xs md:text-sm p-2 bg-white rounded-md shadow-sm">
                            <span className="font-medium">{item.name}</span> (for <code>{item.equipmentSerial}</code>)
                        </div>
                        ))}
                    </div>
                    </div>
                )}
                <div className="space-y-6 pt-4 border-t">
                    <div>
                        <Label className="font-semibold text-slate-700 mb-3 block">
                            {t.soldierSignature} <span className="text-red-500">*</span>
                        </Label>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <SignaturePad ref={soldierSigRef} width={400} height={150} className="w-full" />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="witness-name" className="font-semibold text-slate-700">
                            {t.witnessName}
                        </Label>
                        <Input
                            id="witness-name"
                            placeholder={t.fullName}
                            value={witnessName}
                            onChange={(e) => setWitnessName(e.target.value)}
                            className="mt-1 mb-3"
                        />
                        {witnessName && (
                            <div>
                                <Label className="font-semibold text-slate-700 mb-3 block">
                                    {t.witnessSignature}
                                </Label>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <SignaturePad ref={witnessSigRef} width={400} height={150} className="w-full" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{t.error || "Error"}</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
            </div>
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
                <Button variant="outline" onClick={onCancel}>{t.cancel || "Cancel"}</Button>
                <Button onClick={handleComplete} disabled={isProcessing} className="bg-green-600 hover:bg-green-700">
                    {isProcessing ? (t.processing || "Processing...") : (t.completeAssignment || "Complete Assignment")}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}