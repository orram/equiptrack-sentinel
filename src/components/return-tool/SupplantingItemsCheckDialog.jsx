import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

export default function SupplantingItemsCheckDialog({ 
  isOpen, 
  supplantingItems = [], 
  onConfirm, 
  onCancel,
  t 
}) {
  const [checked, setChecked] = React.useState(false);

  const handleConfirm = () => {
    if (checked) {
      onConfirm();
      setChecked(false);
    }
  };

  const handleCancel = () => {
    onCancel();
    setChecked(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <DialogTitle>{t?.returnSupplantingItemsTitle || "Verify Supplanting Items"}</DialogTitle>
              <DialogDescription className="mt-2">
                {t?.returnSupplantingItemsDescription || "This equipment has supplementary items that must be returned together."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
          <h4 className="font-medium text-sm text-amber-900 mb-3">
            {t?.supplantingItemsIncluded || "Supplementary Items:"}
          </h4>
          <div className="space-y-2">
            {supplantingItems.map((item) => (
              <div key={item} className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-600 mt-2 flex-shrink-0"></div>
                <span className="text-sm text-amber-900">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-3 my-4">
          <Checkbox 
            id="confirm-return"
            checked={checked}
            onCheckedChange={setChecked}
          />
          <Label 
            htmlFor="confirm-return" 
            className="text-sm font-medium cursor-pointer flex-1"
          >
            {t?.confirmAllSupplantingReturned || "I confirm that all supplementary items have been returned"}
          </Label>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            {t?.cancel || "Cancel"}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!checked}
            className="bg-green-600 hover:bg-green-700"
          >
            {t?.proceedReturn || "Proceed with Return"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}