import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, AlertTriangle, FileSpreadsheet } from "lucide-react";

export default function DataPreview({ data, fileName, onImport, onCancel, isImporting }) {
  const equipmentData = data.equipment || [];
  const validItems = equipmentData.filter(item => item.object_name && item.serial_number);
  const invalidItems = equipmentData.filter(item => !item.object_name || !item.serial_number);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Data Preview: {fileName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">{validItems.length} valid records</span>
            </div>
            {invalidItems.length > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm">{invalidItems.length} invalid records</span>
              </div>
            )}
          </div>
          
          <div className="rounded-md border max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Object Name</TableHead>
                  <TableHead>Platoon</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Squad</TableHead>
                  <TableHead>Signature</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipmentData.slice(0, 10).map((item, index) => (
                  <TableRow key={index} className={!item.object_name || !item.serial_number ? "bg-red-50" : ""}>
                    <TableCell>
                      {item.serial_number ? (
                        <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">
                          {item.serial_number}
                        </code>
                      ) : (
                        "Missing"
                      )}
                    </TableCell>
                    <TableCell>{item.object_name || "Missing"}</TableCell>
                    <TableCell>{item.platoon || "-"}</TableCell>
                    <TableCell>{item.soldier_name || "-"}</TableCell>
                    <TableCell>{item.soldier_id || "-"}</TableCell>
                    <TableCell>
                      {item.assignment_status && (
                        <Badge variant="outline" className="text-xs">
                          {item.assignment_status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{item.squad || "-"}</TableCell>
                    <TableCell>{item.signature || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {equipmentData.length > 10 && (
            <p className="text-sm text-slate-500 mt-4">
              Showing first 10 records of {equipmentData.length} total
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={() => onImport(data)}
          disabled={isImporting || validItems.length === 0}
          className="bg-slate-900 hover:bg-slate-800"
        >
          {isImporting ? "Importing..." : `Import ${validItems.length} Records`}
        </Button>
      </div>
    </div>
  );
}