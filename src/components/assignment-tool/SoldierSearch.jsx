
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, UserCheck, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SoldierSearch({ soldiers, onSoldierSelect, isLoading, onAddNewSoldier, t }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSoldiers = soldiers.filter(soldier =>
    soldier.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    soldier.soldier_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    soldier.platoon?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            {t.findSoldier}
          </div>
          <Button variant="outline" onClick={onAddNewSoldier}>
            <UserPlus className="w-4 h-4 mr-2" />
            {t.addNewSoldier}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Input
            placeholder={t.searchByNameIdPlatoon}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 border rounded-lg">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {filteredSoldiers.map(soldier => (
              <div
                key={soldier.id}
                onClick={() => onSoldierSelect(soldier)}
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{soldier.full_name}</p>
                  <p className="text-sm text-slate-500">
                    {t.soldierId}: {soldier.soldier_id} • {t.platoon}: {soldier.platoon}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            ))}
            {filteredSoldiers.length === 0 && (
              <div className="text-center py-10 text-slate-500">
                <p>{t.noSoldiersFound}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
