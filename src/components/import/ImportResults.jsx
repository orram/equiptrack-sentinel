import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Package, Users } from "lucide-react";

export default function ImportResults({ results, onStartOver, onGoToDashboard }) {
  const totalSuccess = results.equipment.created + results.equipment.updated + results.soldiers.created + results.soldiers.updated;
  const totalErrors = results.equipment.errors.length + results.soldiers.errors.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Import Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-slate-600" />
                <h3 className="font-semibold">Equipment</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Created</span>
                  <Badge className="bg-green-100 text-green-800">
                    {results.equipment.created}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Updated</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {results.equipment.updated}
                  </Badge>
                </div>
                {results.equipment.errors.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Errors</span>
                    <Badge className="bg-red-100 text-red-800">
                      {results.equipment.errors.length}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-slate-600" />
                <h3 className="font-semibold">Soldiers</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Created</span>
                  <Badge className="bg-green-100 text-green-800">
                    {results.soldiers.created}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Updated</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {results.soldiers.updated}
                  </Badge>
                </div>
                {results.soldiers.errors.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Errors</span>
                    <Badge className="bg-red-100 text-red-800">
                      {results.soldiers.errors.length}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {totalErrors > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Errors ({totalErrors})
              </h4>
              <div className="space-y-1 text-sm text-red-600">
                {results.equipment.errors.map((error, index) => (
                  <p key={index}>• {error}</p>
                ))}
                {results.soldiers.errors.map((error, index) => (
                  <p key={index}>• {error}</p>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onStartOver}>
          Import Another File
        </Button>
        <Button onClick={onGoToDashboard} className="bg-slate-900 hover:bg-slate-800">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}