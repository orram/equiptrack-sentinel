import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function PlatoonApprovalTable({ platoons, latestByPlatoon }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>סטטוס פלוגות</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">פלוגה</TableHead>
              <TableHead className="text-center">סטטוס</TableHead>
              <TableHead className="text-center">מאשר</TableHead>
              <TableHead className="text-center">מספר אישי</TableHead>
              <TableHead className="text-center">תאריך</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {platoons.map((platoon) => {
              const record = latestByPlatoon[platoon];
              const approved = record?.status === "approved";
              return (
                <TableRow key={platoon}>
                  <TableCell className="font-medium text-right">{platoon}</TableCell>
                  <TableCell className="text-center">
                    {record ? (
                      <Badge className={approved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {approved ? "מאושר" : "לא מאושר"}
                      </Badge>
                    ) : (
                      <Badge variant="outline">לא נבדק</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{record?.approver_name || "-"}</TableCell>
                  <TableCell className="text-center">{record?.approver_id || "-"}</TableCell>
                  <TableCell className="text-center">{record?.inspection_date || "-"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}