import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const statusLabels = {
  issued: "מנופק",
  storage: "מחסן",
  repair: "תיקון"
};

export default function EquipmentEvaluationTable({ equipment, wrongItemIds, onToggleWrong }) {
  return (
    <div className="overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-100">
            <TableHead className="text-center">שגוי</TableHead>
            <TableHead className="text-right">מספר סידורי</TableHead>
            <TableHead className="text-right">ציוד</TableHead>
            <TableHead className="text-right">מחזיק</TableHead>
            <TableHead className="text-right">מחלקה</TableHead>
            <TableHead className="text-center">סטטוס</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipment.map((item) => (
            <TableRow key={item.id} className={wrongItemIds.has(item.id) ? "bg-red-50" : ""}>
              <TableCell className="text-center">
                <Checkbox checked={wrongItemIds.has(item.id)} onCheckedChange={() => onToggleWrong(item.id)} />
              </TableCell>
              <TableCell className="text-right font-mono">{item.serial_number}</TableCell>
              <TableCell className="text-right font-medium">{item.object_name}</TableCell>
              <TableCell className="text-right">{item.issued_soldier_name || "-"}</TableCell>
              <TableCell className="text-right">{item.squad || "-"}</TableCell>
              <TableCell className="text-center">
                <Badge variant="outline">{statusLabels[item.assignment_status] || item.assignment_status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}