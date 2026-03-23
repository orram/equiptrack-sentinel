import React, { useState } from 'react';
import { InventoryItem } from '@/entities/all';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function AddInventoryItemModal({ onComplete, onClose, t }) {
  const [itemData, setItemData] = useState({
    object_name: '',
    category: '',
    total_quantity: 0,
    available_quantity: 0,
    notes: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await InventoryItem.create({
          ...itemData,
          available_quantity: itemData.total_quantity // Initially, all are available
      });
      onComplete();
    } catch (error) {
      console.error('Error creating inventory item:', error);
      alert('Error creating item. Please ensure the name is unique.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.addNewInventoryItem}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="object_name">{t.itemName} *</Label>
            <Input id="object_name" value={itemData.object_name} onChange={e => setItemData({...itemData, object_name: e.target.value})} required />
          </div>
          <div>
            <Label htmlFor="category">{t.category}</Label>
            <Input id="category" value={itemData.category} onChange={e => setItemData({...itemData, category: e.target.value})} />
          </div>
          <div>
            <Label htmlFor="total_quantity">{t.initialQuantity} *</Label>
            <Input id="total_quantity" type="number" value={itemData.total_quantity} onChange={e => setItemData({...itemData, total_quantity: parseInt(e.target.value, 10) || 0})} required min="0" />
          </div>
          <div>
            <Label htmlFor="notes">{t.notes}</Label>
            <Textarea id="notes" value={itemData.notes} onChange={e => setItemData({...itemData, notes: e.target.value})} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>{t.cancel}</Button>
            <Button type="submit" disabled={isProcessing}>{isProcessing ? t.creating : t.createItem}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}