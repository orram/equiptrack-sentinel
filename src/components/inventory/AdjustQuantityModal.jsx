import React, { useState } from 'react';
import { InventoryItem } from '@/entities/all';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdjustQuantityModal({ item, onComplete, onClose, t }) {
  const [newTotal, setNewTotal] = useState(item.total_quantity);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const quantityChange = newTotal - item.total_quantity;
    const newAvailable = item.available_quantity + quantityChange;

    if (newAvailable < 0) {
      alert("New total quantity cannot be less than the number of items currently issued.");
      setIsProcessing(false);
      return;
    }
    
    try {
      await InventoryItem.update(item.id, {
        total_quantity: newTotal,
        available_quantity: newAvailable
      });
      onComplete();
    } catch (error) {
      console.error('Error adjusting quantity:', error);
      alert('Error adjusting quantity.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.adjustQuantityFor} "{item.object_name}"</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <p>{t.currentTotal}: {item.total_quantity}</p>
                <p>{t.currentlyAvailable}: {item.available_quantity}</p>
                <p>{t.currentlyIssued}: {item.total_quantity - item.available_quantity}</p>
            </div>
          <div>
            <Label htmlFor="new_total_quantity">{t.newTotalQuantity}</Label>
            <Input id="new_total_quantity" type="number" value={newTotal} onChange={e => setNewTotal(parseInt(e.target.value, 10) || 0)} required min="0"/>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>{t.cancel}</Button>
            <Button type="submit" disabled={isProcessing}>{isProcessing ? t.updating : t.updateQuantity}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}