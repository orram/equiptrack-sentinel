import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function EquipmentSummaryTable({ data, isLoading, onViewModeChange }) {
  const [showBySquad, setShowBySquad] = useState(false);
  const subHeaders = ["סה\"כ", "הוצא", "במחסן", "תיקון"];

  const handleToggleChange = (checked) => {
    setShowBySquad(checked);
    // Notify parent component of the view mode change
    if (onViewModeChange) {
      onViewModeChange(checked);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!data || data.isEmpty) {
    return <p className="text-center text-slate-500 py-10">בחר פלוגות כדי להציג נתונים.</p>;
  }

  // New Single Platoon / Squad View
  if (data.isSinglePlatoonView) {
    const { tableData, squads, equipmentTypes, totalsBySquad, platoonTotal, singlePlatoonName } = data;

    if (!equipmentTypes || equipmentTypes.length === 0) {
      return <p className="text-center text-slate-500 py-10">אין נתוני ציוד להציג עבור פלוגה זו.</p>;
    }

    return (
      <div dir="rtl">
        <div className="flex items-center justify-end space-x-2 p-4 border-b">
            <Label htmlFor="squad-toggle">סיכום פלוגתי</Label>
            <Switch
                id="squad-toggle"
                checked={showBySquad}
                onCheckedChange={handleToggleChange}
            />
            <Label htmlFor="squad-toggle">פירוט לפי מחלקות</Label>
        </div>

        {showBySquad ? (
          <div className="w-full rounded-lg overflow-x-auto">
            <Table className="min-w-full divide-y divide-slate-200">
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead rowSpan={2} className="sticky right-0 bg-slate-100 z-10 font-bold text-slate-800 border-l-2 border-slate-300 w-48 text-right">ציוד</TableHead>
                  {squads.map(squad => (
                    <TableHead key={squad} colSpan={subHeaders.length} className="text-center font-semibold text-slate-700">מחלקה {squad}</TableHead>
                  ))}
                  <TableHead colSpan={subHeaders.length} className="text-center font-bold text-white bg-slate-800 border-r-2 border-slate-400">סה"כ פלוגתי</TableHead>
                </TableRow>
                <TableRow className="bg-slate-50">
                  {squads.map(squad => subHeaders.map((sub, index) => (
                    <TableHead key={`${squad}-${sub}`} className={`text-center text-xs font-medium border-r ${index === subHeaders.length - 1 ? 'border-r-2 border-slate-400' : 'border-slate-200'}`}>{sub}</TableHead>
                  )))}
                  {subHeaders.map(sub => (
                    <TableHead key={`platoon-total-${sub}`} className="text-center text-xs font-semibold text-slate-300 bg-slate-800 border-r">{sub}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipmentTypes.map(type => (
                  <TableRow key={type} className="hover:bg-slate-50">
                    <TableCell className="sticky right-0 bg-white hover:bg-slate-50 z-10 font-medium border-l-2 border-slate-300 text-right">{type}</TableCell>
                    {squads.map(squad => (
                      <React.Fragment key={`${type}-${squad}`}>
                        {subHeaders.map((sub, index) => (
                          <TableCell key={`${type}-${squad}-${sub}`} className={`text-center border-r ${index === subHeaders.length - 1 ? 'border-r-2 border-slate-400' : 'border-slate-200'}`}>
                            {tableData[type]?.bySquad[squad]?.[['total', 'issued', 'storage', 'repair'][index]] || 0}
                          </TableCell>
                        ))}
                      </React.Fragment>
                    ))}
                    {subHeaders.map((sub, index) => (
                      <TableCell key={`${type}-platoon-total-${sub}`} className="text-center font-semibold bg-slate-100 border-r">
                        {tableData[type]?.platoonTotal?.[['total', 'issued', 'storage', 'repair'][index]] || 0}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-slate-200 font-bold text-slate-900 border-t-2 border-slate-400">
                  <TableCell className="sticky right-0 bg-slate-200 z-10 border-l-2 border-slate-300 text-right">סך הכל</TableCell>
                  {squads.map(squad => (
                    <React.Fragment key={`total-${squad}`}>
                      {subHeaders.map((sub, index) => (
                        <TableCell key={`total-${squad}-${sub}`} className={`text-center font-bold border-r ${index === subHeaders.length - 1 ? 'border-r-2 border-slate-400' : 'border-slate-200'}`}>
                          {totalsBySquad[squad]?.[['total', 'issued', 'storage', 'repair'][index]] || 0}
                        </TableCell>
                      ))}
                    </React.Fragment>
                  ))}
                  {subHeaders.map((sub, index) => (
                    <TableCell key={`total-platoon-total-${sub}`} className="text-center bg-slate-900 text-white border-r">
                      {platoonTotal?.[['total', 'issued', 'storage', 'repair'][index]] || 0}
                    </TableCell>
                  ))}
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        ) : (
          <div className="w-full rounded-lg overflow-x-auto p-4">
            <h3 className="text-lg font-semibold mb-4 text-center">סיכום פלוגה: {singlePlatoonName}</h3>
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-100">
                        <TableHead className="text-right font-bold text-slate-800">ציוד</TableHead>
                        {subHeaders.map(h => <TableHead key={h} className="text-center">{h}</TableHead>)}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {equipmentTypes.map(type => (
                        <TableRow key={type}>
                            <TableCell className="text-right font-medium">{type}</TableCell>
                            <TableCell className="text-center">{tableData[type].platoonTotal.total}</TableCell>
                            <TableCell className="text-center">{tableData[type].platoonTotal.issued}</TableCell>
                            <TableCell className="text-center">{tableData[type].platoonTotal.storage}</TableCell>
                            <TableCell className="text-center">{tableData[type].platoonTotal.repair}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow className="bg-slate-200 font-bold">
                        <TableCell className="text-right">סך הכל</TableCell>
                        <TableCell className="text-center">{platoonTotal.total}</TableCell>
                        <TableCell className="text-center">{platoonTotal.issued}</TableCell>
                        <TableCell className="text-center">{platoonTotal.storage}</TableCell>
                        <TableCell className="text-center">{platoonTotal.repair}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
          </div>
        )}
      </div>
    );
  }

  // Existing Multi-Platoon View
  const { tableData, platoons, equipmentTypes, totalsByPlatoon, grandTotal } = data;
  
  if (!equipmentTypes || equipmentTypes.length === 0) {
    return <p className="text-center text-slate-500 py-10">אין נתוני ציוד להציג.</p>;
  }

  return (
    <div className="w-full border rounded-lg overflow-x-auto" dir="rtl">
      <Table className="min-w-full divide-y divide-slate-200">
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead rowSpan={2} className="sticky right-0 bg-slate-100 z-10 font-bold text-slate-800 border-l-2 border-slate-300 w-48 text-right">
              ציוד
            </TableHead>
            {platoons.map(platoon => (
              <TableHead key={platoon} colSpan={subHeaders.length} className="text-center font-semibold text-slate-700">
                {platoon}
              </TableHead>
            ))}
            <TableHead colSpan={subHeaders.length} className="text-center font-bold text-white bg-slate-800 border-r-2 border-slate-400">
              סה״כ כללי
            </TableHead>
          </TableRow>
          <TableRow className="bg-slate-50">
            {platoons.map(platoon =>
              subHeaders.map((sub, index) => (
                <TableHead
                  key={`${platoon}-${sub}`}
                  className={`text-center text-xs font-medium ${
                    index === 0 ? 'border-l-2 border-slate-400' : 'border-l border-slate-200'
                  }`}
                >
                  {sub}
                </TableHead>
              ))
            )}
            {subHeaders.map(sub => (
              <TableHead key={`grand-total-${sub}`} className="text-center text-xs font-semibold text-slate-300 bg-slate-800 border-r">
                {sub}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipmentTypes.map(type => (
            <TableRow key={type} className="hover:bg-slate-50">
              <TableCell className="sticky right-0 bg-white hover:bg-slate-50 z-10 font-medium border-l-2 border-slate-300 text-right">
                {type}
              </TableCell>
              {platoons.map(platoon => (
                <React.Fragment key={`${type}-${platoon}`}>
                  {subHeaders.map((sub, index) => (
                    <TableCell
                      key={`${type}-${platoon}-${sub}`}
                      className={`text-center ${
                        index === 0 ? 'border-l-2 border-slate-400' : 'border-l border-slate-200'
                      }`}
                    >
                      {tableData[type]?.byPlatoon[platoon]?.[
                        ['total', 'issued', 'storage', 'repair'][index]
                      ] || 0}
                    </TableCell>
                  ))}
                </React.Fragment>
              ))}
              {subHeaders.map((sub, index) => (
                <TableCell key={`${type}-grand-total-${sub}`} className="text-center font-semibold bg-slate-100 border-r">
                  {tableData[type]?.grandTotal?.[
                    ['total', 'issued', 'storage', 'repair'][index]
                  ] || 0}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-slate-200 font-bold text-slate-900 border-t-2 border-slate-400">
            <TableCell className="sticky right-0 bg-slate-200 z-10 border-l-2 border-slate-300 text-right">סך הכל</TableCell>
            {platoons.map(platoon => (
              <React.Fragment key={`total-${platoon}`}>
                {subHeaders.map((sub, index) => (
                  <TableCell
                    key={`total-${platoon}-${sub}`}
                    className={`text-center font-bold ${
                      index === 0 ? 'border-l-2 border-slate-400' : 'border-l border-slate-200'
                    }`}
                  >
                    {totalsByPlatoon[platoon]?.[
                      ['total', 'issued', 'storage', 'repair'][index]
                    ] || 0}
                  </TableCell>
                ))}
              </React.Fragment>
            ))}
            {subHeaders.map((sub, index) => (
              <TableCell key={`total-grand-total-${sub}`} className="text-center bg-slate-900 text-white border-r">
                {grandTotal?.[
                  ['total', 'issued', 'storage', 'repair'][index]
                ] || 0}
              </TableCell>
            ))}
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}