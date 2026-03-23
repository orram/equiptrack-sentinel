
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Plus, Users } from "lucide-react"; // Added Users
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function SoldierList({ soldiers, isLoading, onSelectSoldier, onAddNewSoldier, t }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.soldiers}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 border rounded-lg">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (soldiers.length === 0) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-slate-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="font-medium">{t.noSoldiersFoundMatchingSearch}</p>
          <p className="text-sm mb-4">{t.addNewSoldierToStart}</p>
          <Button onClick={onAddNewSoldier} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            {t.addSoldier}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t.soldiers} ({soldiers.length})
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-3">
          {soldiers.map((soldier) => (
            <div 
              key={soldier.id} 
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => onSelectSoldier(soldier)}
            >
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-slate-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">{soldier.full_name}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{t.soldierId}: {soldier.soldier_id}</span>
                  {soldier.platoon && (
                    <span>{t.platoon}: {soldier.platoon}</span>
                  )}
                </div>
              </div>

              {soldier.rank && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {soldier.rank}
                  </Badge>
                </div>
              )}
              
              <Badge 
                variant={soldier.status === "active" ? "default" : "secondary"}
                className="text-xs"
              >
                {soldier.status}
              </Badge>
            </div>
          ))}
          
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center">
            <div className="text-slate-500 mb-3">
              <User className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">{t.addANewSoldierToTheSystem}</p>
            </div>
            <Button onClick={onAddNewSoldier} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              {t.addNewSoldier}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
