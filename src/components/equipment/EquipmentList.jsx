import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, User, MapPin, MoreVertical, Users, Check, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors = {
  issued: "bg-green-100 text-green-800",
  storage: "bg-amber-100 text-amber-800",
  repair: "bg-red-100 text-red-800"
};

const conditionColors = {
  excellent: "bg-green-100 text-green-800",
  good: "bg-blue-100 text-blue-800",
  fair: "bg-yellow-100 text-yellow-800",
  poor: "bg-red-100 text-red-800"
};

export default function EquipmentList({ equipment, isLoading, onIssueEquipment, onViewDetails, onDeleteEquipment, t }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="w-5 h-5" />
          {t.equipment} ({equipment.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32 mt-2" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : equipment.length > 0 ? (
          <div className="space-y-3">
            {equipment.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 border rounded-lg"
              >
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-slate-600" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="text-sm bg-slate-100 px-2 py-1 rounded font-mono font-semibold">
                      {item.serial_number}
                    </code>
                    <h3 className="font-semibold">{item.object_name}</h3>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    {item.platoon && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {item.platoon}
                      </span>
                    )}
                    {item.issued_soldier_name && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {item.issued_soldier_name}
                      </span>
                    )}
                    {item.issued_soldier_id && (
                      <span className="flex items-center gap-1">
                        <span>ID:</span>
                        {item.issued_soldier_id}
                      </span>
                    )}
                    {item.squad && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {item.squad}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`${statusColors[item.assignment_status]} text-xs`}
                  >
                    {item.assignment_status}
                  </Badge>

                  {item.condition && (
                    <Badge
                      variant="outline"
                      className={`${conditionColors[item.condition]} text-xs`}
                    >
                      {item.condition}
                    </Badge>
                  )}

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onViewDetails(item)}>
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteEquipment(item)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t.delete}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onIssueEquipment(item)}
                      disabled={item.assignment_status !== 'storage'}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {t.issue}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="font-medium">{t.noEquipmentFound}</p>
            <p className="text-sm">{t.tryAdjustingSearch}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}