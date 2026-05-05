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

export default function EquipmentSummaryTable({ data, isLoading, onViewModeChange, language = 'he' }) {
  const [showBySquad, setShowBySquad] = useState(false);

  const isHe = language === 'he';

  const subHeaders = isHe
    ? ["במחסן", "הוצא", "תיקון", "סה\"כ"]
    : ["Storage", "Issued", "Repair", "Total"];
  const dataKeys = ['storage', 'issued', 'repair', 'total'];

  const strings = {
    platoonSummaryLabel: isHe ? 'סיכום פלוגתי' : 'Platoon Summary',
    squadBreakdownLabel: isHe ? 'פירוט לפי מחלקות' : 'Squad Breakdown',
    equipmentCol: isHe ? 'ציוד' : 'Equipment',
    squadPrefix: isHe ? 'מחלקה' : 'Squad',
    platoonTotalHeader: isHe ? 'סה"כ פלוגתי' : 'Platoon Total',
    grandTotalHeader: isHe ? 'סה״כ כללי' : 'Grand Total',
    totalRow: isHe ? 'סך הכל' : 'Total',
    platoonSummaryTitle: isHe ? 'סיכום פלוגה:' : 'Platoon Summary:',
    selectPlatoonsPrompt: isHe ? 'בחר פלוגות כדי להציג נתונים.' : 'Select platoons to display data.',
    noDataForPlatoon: isHe ? 'אין נתוני ציוד להציג עבור פלוגה זו.' : 'No equipment data to display for this platoon.',
    noData: isHe ? 'אין נתוני ציוד להציג.' : 'No equipment data to display.',
  };

  const dir = isHe ? 'rtl' : 'ltr';

  const handleToggleChange = (checked) => {
    setShowBySquad(checked);
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
    return <p className="text-center text-slate-500 py-10">{strings.selectPlatoonsPrompt}</p>;
  }

  // Single Platoon / Squad View
  if (data.isSinglePlatoonView) {
    const { tableData, squads, equipmentTypes, totalsBySquad, platoonTotal, singlePlatoonName } = data;

    if (!equipmentTypes || equipmentTypes.length === 0) {
      return <p className="text-center text-slate-500 py-10">{strings.noDataForPlatoon}</p>;
    }

    return (
      <div dir={dir}>
        <div className={`flex items-center justify-end gap-2 p-4 border-b ${isHe ? 'flex-row-reverse justify-start' : ''}`}>
          <Label htmlFor="squad-toggle">{strings.platoonSummaryLabel}</Label>
          <Switch
            id="squad-toggle"
            checked={showBySquad}
            onCheckedChange={handleToggleChange}
          />
          <Label htmlFor="squad-toggle">{strings.squadBreakdownLabel}</Label>
        </div>

        {showBySquad ? (
          <div className="w-full rounded-lg overflow-x-auto">
            <Table className="min-w-full divide-y divide-slate-200">
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead rowSpan={2} className={`sticky ${isHe ? 'right-0' : 'left-0'} bg-slate-100 z-10 font-bold text-slate-800 border-l-2 border-slate-300 w-48 ${isHe ? 'text-right' : 'text-left'}`}>
                    {strings.equipmentCol}
                  </TableHead>
                  {squads.map(squad => (
                    <TableHead key={squad} colSpan={subHeaders.length} className="text-center font-semibold text-slate-700">
                      {strings.squadPrefix} {squad}
                    </TableHead>
                  ))}
                  <TableHead colSpan={subHeaders.length} className="text-center font-bold text-white bg-slate-800 border-r-2 border-slate-400">
                    {strings.platoonTotalHeader}
                  </TableHead>
                </TableRow>
                <TableRow className="bg-slate-50">
                  {squads.map(squad => subHeaders.map((sub, index) => (
                    <TableHead key={`${squad}-${sub}`} className={`text-center text-xs font-medium border-r ${index === subHeaders.length - 1 ? 'border-r-2 border-slate-400' : 'border-slate-200'}`}>
                      {sub}
                    </TableHead>
                  )))}
                  {subHeaders.map(sub => (
                    <TableHead key={`platoon-total-${sub}`} className="text-center text-xs font-semibold text-slate-300 bg-slate-800 border-r">
                      {sub}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipmentTypes.map(type => (
                  <TableRow key={type} className="hover:bg-slate-50">
                    <TableCell className={`sticky ${isHe ? 'right-0' : 'left-0'} bg-white hover:bg-slate-50 z-10 font-medium border-l-2 border-slate-300 ${isHe ? 'text-right' : 'text-left'}`}>
                      {type}
                    </TableCell>
                    {squads.map(squad => (
                      <React.Fragment key={`${type}-${squad}`}>
                        {subHeaders.map((sub, index) => (
                          <TableCell key={`${type}-${squad}-${sub}`} className={`text-center border-r ${index === subHeaders.length - 1 ? 'border-r-2 border-slate-400' : 'border-slate-200'}`}>
                            {tableData[type]?.bySquad[squad]?.[dataKeys[index]] || 0}
                          </TableCell>
                        ))}
                      </React.Fragment>
                    ))}
                    {subHeaders.map((sub, index) => (
                      <TableCell key={`${type}-platoon-total-${sub}`} className="text-center font-semibold bg-slate-100 border-r">
                        {tableData[type]?.platoonTotal?.[dataKeys[index]] || 0}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-slate-200 font-bold text-slate-900 border-t-2 border-slate-400">
                  <TableCell className={`sticky ${isHe ? 'right-0' : 'left-0'} bg-slate-200 z-10 border-l-2 border-slate-300 ${isHe ? 'text-right' : 'text-left'}`}>
                    {strings.totalRow}
                  </TableCell>
                  {squads.map(squad => (
                    <React.Fragment key={`total-${squad}`}>
                      {subHeaders.map((sub, index) => (
                        <TableCell key={`total-${squad}-${sub}`} className={`text-center font-bold border-r ${index === subHeaders.length - 1 ? 'border-r-2 border-slate-400' : 'border-slate-200'}`}>
                          {totalsBySquad[squad]?.[dataKeys[index]] || 0}
                        </TableCell>
                      ))}
                    </React.Fragment>
                  ))}
                  {subHeaders.map((sub, index) => (
                    <TableCell key={`total-platoon-total-${sub}`} className="text-center bg-slate-900 text-white border-r">
                      {platoonTotal?.[dataKeys[index]] || 0}
                    </TableCell>
                  ))}
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        ) : (
          <div className="w-full rounded-lg overflow-x-auto p-4">
            <h3 className="text-lg font-semibold mb-4 text-center">{strings.platoonSummaryTitle} {singlePlatoonName}</h3>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100">
                  <TableHead className={`${isHe ? 'text-right' : 'text-left'} font-bold text-slate-800`}>{strings.equipmentCol}</TableHead>
                  {subHeaders.map(h => <TableHead key={h} className="text-center">{h}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipmentTypes.map(type => (
                  <TableRow key={type}>
                    <TableCell className={isHe ? 'text-right font-medium' : 'text-left font-medium'}>{type}</TableCell>
                    {dataKeys.map(key => (
                      <TableCell key={key} className="text-center">{tableData[type].platoonTotal[key]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-slate-200 font-bold">
                  <TableCell className={isHe ? 'text-right' : 'text-left'}>{strings.totalRow}</TableCell>
                  {dataKeys.map(key => (
                    <TableCell key={key} className="text-center">{platoonTotal[key]}</TableCell>
                  ))}
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </div>
    );
  }

  // Multi-Platoon View
  const { tableData, platoons, equipmentTypes, totalsByPlatoon, grandTotal } = data;

  if (!equipmentTypes || equipmentTypes.length === 0) {
    return <p className="text-center text-slate-500 py-10">{strings.noData}</p>;
  }

  return (
    <div className="w-full border rounded-lg overflow-x-auto" dir={dir}>
      <Table className="min-w-full divide-y divide-slate-200">
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead rowSpan={2} className={`sticky ${isHe ? 'right-0' : 'left-0'} bg-slate-100 z-10 font-bold text-slate-800 border-l-2 border-slate-300 w-48 ${isHe ? 'text-right' : 'text-left'}`}>
              {strings.equipmentCol}
            </TableHead>
            {platoons.map(platoon => (
              <TableHead key={platoon} colSpan={subHeaders.length} className="text-center font-semibold text-slate-700">
                {platoon}
              </TableHead>
            ))}
            <TableHead colSpan={subHeaders.length} className={`text-center font-bold text-white bg-slate-800 border-r-2 border-slate-400 ${!isHe ? 'sticky right-0 z-10' : 'sticky left-0 z-10'}`}>
              {strings.grandTotalHeader}
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
            {subHeaders.map((sub, index) => (
              <TableHead key={`grand-total-${sub}`} className={`text-center text-xs font-semibold text-slate-300 bg-slate-800 border-l ${!isHe ? 'sticky right-0 z-10' : 'sticky left-0 z-10'} ${index === 0 ? 'border-l-2 border-slate-400' : ''}`}>
                {sub}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipmentTypes.map(type => (
            <TableRow key={type} className="hover:bg-slate-50">
              <TableCell className={`sticky ${isHe ? 'right-0' : 'left-0'} bg-white hover:bg-slate-50 z-10 font-medium border-l-2 border-slate-300 ${isHe ? 'text-right' : 'text-left'}`}>
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
                      {tableData[type]?.byPlatoon[platoon]?.[dataKeys[index]] || 0}
                    </TableCell>
                  ))}
                </React.Fragment>
              ))}
              {subHeaders.map((sub, index) => (
                <TableCell key={`${type}-grand-total-${sub}`} className={`text-center font-semibold bg-slate-100 border-l ${!isHe ? 'sticky right-0 z-10' : 'sticky left-0 z-10'} ${index === 0 ? 'border-l-2 border-slate-400' : ''}`}>
                  {tableData[type]?.grandTotal?.[dataKeys[index]] || 0}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-slate-200 font-bold text-slate-900 border-t-2 border-slate-400">
            <TableCell className={`sticky ${isHe ? 'right-0' : 'left-0'} bg-slate-200 z-10 border-l-2 border-slate-300 ${isHe ? 'text-right' : 'text-left'}`}>
              {strings.totalRow}
            </TableCell>
            {platoons.map(platoon => (
              <React.Fragment key={`total-${platoon}`}>
                {subHeaders.map((sub, index) => (
                  <TableCell
                    key={`total-${platoon}-${sub}`}
                    className={`text-center font-bold ${
                      index === 0 ? 'border-l-2 border-slate-400' : 'border-l border-slate-200'
                    }`}
                  >
                    {totalsByPlatoon[platoon]?.[dataKeys[index]] || 0}
                  </TableCell>
                ))}
              </React.Fragment>
            ))}
            {subHeaders.map((sub, index) => (
              <TableCell key={`total-grand-total-${sub}`} className={`text-center bg-slate-900 text-white border-l ${!isHe ? 'sticky right-0 z-10' : 'sticky left-0 z-10'} ${index === 0 ? 'border-l-2 border-slate-400' : ''}`}>
                {grandTotal?.[dataKeys[index]] || 0}
              </TableCell>
            ))}
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}