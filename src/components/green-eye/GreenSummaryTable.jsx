import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const STATUS_ORDER = ["storage", "issued", "repair"];

export default function GreenSummaryTable({ equipment, wrongItemIds, viewMode }) {
  const grouped = equipment.reduce((acc, item) => {
    const groupKey = viewMode === "squad" ? (item.squad || "ללא מחלקה") : "סה״כ";
    const type = item.object_name || "לא ידוע";
    acc[groupKey] ||= {};
    acc[groupKey][type] ||= { total: 0, storage: 0, issued: 0, repair: 0, wrong: 0 };
    acc[groupKey][type].total += 1;
    if (STATUS_ORDER.includes(item.assignment_status)) acc[groupKey][type][item.assignment_status] += 1;
    if (wrongItemIds.has(item.id)) acc[groupKey][type].wrong += 1;
    return acc;
  }, {});

  return (
    <div className="overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-100">
            {viewMode === "squad" && <TableHead className="text-right">מחלקה</TableHead>}
            <TableHead className="text-right">סוג ציוד</TableHead>
            <TableHead className="text-center">סה״כ</TableHead>
            <TableHead className="text-center">מחסן</TableHead>
            <TableHead className="text-center">מנופק</TableHead>
            <TableHead className="text-center">תיקון</TableHead>
            <TableHead className="text-center">שגויים</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(grouped).flatMap(([group, types]) =>
            Object.entries(types).map(([type, counts]) => (
              <TableRow key={`${group}-${type}`}>
                {viewMode === "squad" && <TableCell className="text-right font-medium">{group}</TableCell>}
                <TableCell className="text-right font-medium">{type}</TableCell>
                <TableCell className="text-center">{counts.total}</TableCell>
                <TableCell className="text-center">{counts.storage}</TableCell>
                <TableCell className="text-center">{counts.issued}</TableCell>
                <TableCell className="text-center">{counts.repair}</TableCell>
                <TableCell className={counts.wrong > 0 ? "text-center text-red-700 font-bold" : "text-center"}>{counts.wrong}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}