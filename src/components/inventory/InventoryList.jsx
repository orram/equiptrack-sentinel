import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Layers, PackagePlus } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export default function InventoryList({ inventory, isLoading, onAdjustQuantity, onViewDetails, t }) {
  const getProgressColor = (percentage) => {
    if (percentage > 70) return "bg-green-500";
    if (percentage > 30) return "bg-yellow-500";
    return "bg-red-500";
  };
    
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Layers className="w-5 h-5" />
          {t.inventoryStock} ({inventory.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : inventory.length > 0 ? (
          <div className="space-y-3">
            {inventory.map((item) => {
              const availablePercentage = item.total_quantity > 0 
                ? (item.available_quantity / item.total_quantity) * 100 
                : 0;

              return (
                <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{item.object_name}</h3>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => onViewDetails(item)}>
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => onAdjustQuantity(item)}>
                                <PackagePlus className="w-4 h-4 mr-2" />
                                {t.adjustQuantity}
                            </Button>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>{t.category}: {item.category || 'N/A'}</span>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-slate-600">
                            <span>{t.availability}</span>
                            <span>{item.available_quantity} / {item.total_quantity}</span>
                        </div>
                        <Progress value={availablePercentage} className="h-2" indicatorClassName={getProgressColor(availablePercentage)} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500">
            <Layers className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="font-medium">{t.noInventoryItemsFound}</p>
            <p className="text-sm">{t.addNewInventoryItemToStart}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}