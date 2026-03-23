
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, User, MapPin, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const statusColors = {
  assigned: "bg-green-100 text-green-800 border-green-200",
  storage: "bg-amber-100 text-amber-800 border-amber-200",
  repair: "bg-red-100 text-red-800 border-red-200"
};

export default function EquipmentSummary({ equipment, searchTerm, isLoading }) {
  const filteredEquipment = equipment.filter(item => 
    item.object_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.issued_soldier_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Equipment Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 border rounded-lg">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32 mt-1" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Equipment Overview
          </CardTitle>
          <Link to={createPageUrl("Equipment")}>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredEquipment.slice(0, 8).map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-slate-100 px-2 py-1 rounded font-mono font-semibold">
                    {item.serial_number}
                  </code>
                  <h4 className="font-medium">{item.object_name}</h4>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
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
                  {item.squad && (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {item.squad}
                    </span>
                  )}
                </div>
              </div>
              <Badge 
                variant="secondary"
                className={`${statusColors[item.assignment_status]} border text-xs`}
              >
                {item.assignment_status}
              </Badge>
            </div>
          ))}
          {filteredEquipment.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No equipment found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
