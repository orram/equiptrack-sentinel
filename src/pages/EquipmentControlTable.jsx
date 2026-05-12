import React, { useState, useEffect, useMemo } from "react";
import { Equipment, EquipmentControlItem, Soldier } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "@/lib/language";
import EquipmentSummaryTable from "../components/management-view/EquipmentSummaryTable";
import ControlTableFilters from "../components/management-view/ControlTableFilters";
import ControlTableAddEquipment from "../components/management-view/ControlTableAddEquipment";


export default function EquipmentControlTable() {
  const navigate = useNavigate();
  const { t, isRTL, language } = useLanguage();
  const [equipment, setEquipment] = useState([]);
  const [equipmentControlItems, setEquipmentControlItems] = useState([]);
  const [soldiers, setSoldiers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlatoons, setSelectedPlatoons] = useState([]);
  const [isDetailedView, setIsDetailedView] = useState(false); // Track view mode for CSV export

  const pageTranslations = {
    en: {
      title: "Equipment Control Table", 
      subtitle: "Equipment status summary by platoons",
      refreshData: "Refresh Data",
      tryAgain: "Try Again",
      equipmentInventory: "Equipment Inventory Summary",
      filterPlatoons: "Filter Platoons",
      downloadCsv: "Download CSV"
    },
    he: {
      title: "טבלת שליטה אמצעים",
      subtitle: "סיכום מצב אמצעים לפי פלוגות", 
      refreshData: "רענן נתונים",
      tryAgain: "נסה שוב",
      equipmentInventory: "סיכום מלאי אמצעים",
      filterPlatoons: "סינון פלוגות",
      downloadCsv: "הורד CSV"
    }
  };
  const pt = pageTranslations[language];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const equipmentData = await Equipment.list();
      const equipmentItemsData = await EquipmentControlItem.list();
      const soldierData = await Soldier.list();

      setEquipment(equipmentData);
      setEquipmentControlItems(equipmentItemsData.sort((a, b) => a.display_order - b.display_order));
      setSoldiers(soldierData);

      const allPlatoons = [...new Set(equipmentData.map(e => String(e.platoon || '').trim()).filter(Boolean))].sort();
      setSelectedPlatoons(allPlatoons);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load data. Please try again.");
    }
    setIsLoading(false);
  };
  
  const allPlatoons = useMemo(() => {
    return [...new Set(equipment.map(e => String(e.platoon || '').trim()).filter(Boolean))].sort();
  }, [equipment]);

  const processedData = useMemo(() => {
     if (equipment.length === 0 || equipmentControlItems.length === 0 || selectedPlatoons.length === 0 || soldiers.length === 0) {
      return { isEmpty: true };
    }

    const equipmentTypes = equipmentControlItems.map(item => String(item.name).trim()).filter(Boolean);
    const isSinglePlatoonView = selectedPlatoons.length === 1;

    if (isSinglePlatoonView) {
      const platoon = selectedPlatoons[0];
      const platoonEquipment = equipment.filter(e => String(e.platoon || '').trim() === platoon);
      const UNASSIGNED_SQUAD_LABEL = language === 'he' ? 'ללא מחלקה' : 'Unassigned';
      
      const relevantPlatoonEquipment = platoonEquipment.filter(e => equipmentTypes.includes(String(e.object_name || '').trim()));
      const squadsFromEquipment = [...new Set(
        relevantPlatoonEquipment
          .filter(e => e.squad)
          .map(e => e.squad)
      )];

      const hasUnassignedEquipment = relevantPlatoonEquipment.some(e => !e.squad);
      
      const allSquadsInPlatoon = [...squadsFromEquipment];
      if (hasUnassignedEquipment && !allSquadsInPlatoon.includes(UNASSIGNED_SQUAD_LABEL)) {
          allSquadsInPlatoon.push(UNASSIGNED_SQUAD_LABEL);
      }

      const squadOrder = ["מפקדה", "1", "2", "3"];
      const squads = squadOrder.filter(s => allSquadsInPlatoon.includes(s))
          .concat(allSquadsInPlatoon.filter(s => !squadOrder.includes(s)).sort((a,b) => a.localeCompare(b, undefined, {numeric: true})));
      
      const tableData = {};
      const totalsBySquad = {};
      const platoonTotal = { total: 0, issued: 0, storage: 0, repair: 0 };
      squads.forEach(s => { totalsBySquad[s] = { total: 0, issued: 0, storage: 0, repair: 0 }; });
      equipmentTypes.forEach(type => {
          tableData[type] = { bySquad: {}, platoonTotal: { total: 0, issued: 0, storage: 0, repair: 0 }};
          squads.forEach(s => { tableData[type].bySquad[s] = { total: 0, issued: 0, storage: 0, repair: 0 }; });
      });

      platoonEquipment.forEach(item => {
          const type = String(item.object_name).trim();
          const squad = item.squad || UNASSIGNED_SQUAD_LABEL;
          if (type && squad && equipmentTypes.includes(type) && squads.includes(squad)) {
              tableData[type].bySquad[squad].total++;
              totalsBySquad[squad].total++;
              if (item.assignment_status === 'issued') { tableData[type].bySquad[squad].issued++; totalsBySquad[squad].issued++; }
              else if (item.assignment_status === 'storage') { tableData[type].bySquad[squad].storage++; totalsBySquad[squad].storage++; }
              else if (item.assignment_status === 'repair') { tableData[type].bySquad[squad].repair++; totalsBySquad[squad].repair++; }
          }
      });
      equipmentTypes.forEach(type => {
          squads.forEach(squad => {
              const data = tableData[type].bySquad[squad];
              tableData[type].platoonTotal.total += data.total;
              tableData[type].platoonTotal.issued += data.issued;
              tableData[type].platoonTotal.storage += data.storage;
              tableData[type].platoonTotal.repair += data.repair;
          });
      });
      squads.forEach(squad => {
          platoonTotal.total += totalsBySquad[squad].total;
          platoonTotal.issued += totalsBySquad[squad].issued;
          platoonTotal.storage += totalsBySquad[squad].storage;
          platoonTotal.repair += totalsBySquad[squad].repair;
      });
      return { isSinglePlatoonView, singlePlatoonName: platoon, tableData, squads, equipmentTypes, totalsBySquad, platoonTotal };

    } else {
      const platoonOrder = ["א", "ב", "ג", "מסייעת", "דרג", "פלסם"];
      const platoons = platoonOrder.filter(p => selectedPlatoons.includes(p))
          .concat(selectedPlatoons.filter(p => !platoonOrder.includes(p)).sort());
      const tableData = {};
      const totalsByPlatoon = {};
      const grandTotal = { total: 0, issued: 0, storage: 0, repair: 0 };
      platoons.forEach(p => { totalsByPlatoon[p] = { total: 0, issued: 0, storage: 0, repair: 0 }; });
      equipmentTypes.forEach(type => {
          tableData[type] = { byPlatoon: {}, grandTotal: { total: 0, issued: 0, storage: 0, repair: 0 }};
          platoons.forEach(p => { tableData[type].byPlatoon[p] = { total: 0, issued: 0, storage: 0, repair: 0 }; });
      });

      equipment.forEach(item => {
          const type = String(item.object_name).trim();
          const platoon = String(item.platoon).trim();
          if (type && platoon && equipmentTypes.includes(type) && platoons.includes(platoon)) {
              tableData[type].byPlatoon[platoon].total++;
              totalsByPlatoon[platoon].total++;
              if (item.assignment_status === 'issued') { tableData[type].byPlatoon[platoon].issued++; totalsByPlatoon[platoon].issued++; }
              else if (item.assignment_status === 'storage') { tableData[type].byPlatoon[platoon].storage++; totalsByPlatoon[platoon].storage++; }
              else if (item.assignment_status === 'repair') { tableData[type].byPlatoon[platoon].repair++; totalsByPlatoon[platoon].repair++; }
          }
      });
      equipmentTypes.forEach(type => {
          platoons.forEach(platoon => {
              const data = tableData[type].byPlatoon[platoon];
              tableData[type].grandTotal.total += data.total;
              tableData[type].grandTotal.issued += data.issued;
              tableData[type].grandTotal.storage += data.storage;
              tableData[type].grandTotal.repair += data.repair;
          });
      });
      platoons.forEach(platoon => {
          grandTotal.total += totalsByPlatoon[platoon].total;
          grandTotal.issued += totalsByPlatoon[platoon].issued;
          grandTotal.storage += totalsByPlatoon[platoon].storage;
          grandTotal.repair += totalsByPlatoon[platoon].repair;
      });
      return { isSinglePlatoonView: false, tableData, platoons, equipmentTypes, totalsByPlatoon, grandTotal };
    }
  }, [equipment, equipmentControlItems, selectedPlatoons, soldiers, language]);

  const handleRefresh = async () => {
    if (isLoading) return;
    await loadData();
  };

  const handleDownloadCSV = () => {
    if (!processedData || processedData.isEmpty) {
      alert("No data to download.");
      return;
    }

    const escapeCsvCell = (cell) => {
      if (cell === undefined || cell === null) return '';
      const str = String(cell);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const toCsvRow = (arr) => arr.map(escapeCsvCell).join(',');

    let csvRows = [];
    const subHeaders = ["Total", "Issued", "Storage", "Repair"];
    const subHeadersHe = ["סה\"כ", "הוצא", "במחסן", "תיקון"];
    const currentSubHeaders = language === 'he' ? subHeadersHe : subHeaders;

    if (processedData.isSinglePlatoonView) {
      const { squads, equipmentTypes, tableData, totalsBySquad, platoonTotal, singlePlatoonName } = processedData;
      
      // Check if we should export detailed view or summary view
      if (isDetailedView) {
        // Export detailed squad breakdown
        const csvHeader = ["Equipment", ...squads.flatMap(s => currentSubHeaders.map(sub => `Squad ${s} - ${sub}`)), ...currentSubHeaders.map(sub => `Platoon Total - ${sub}`)];
        csvRows.push(toCsvRow(csvHeader));

        equipmentTypes.forEach(type => {
          const row = [type];
          squads.forEach(squad => {
              const data = tableData[type]?.bySquad[squad] || { total: 0, issued: 0, storage: 0, repair: 0 };
              row.push(data.total, data.issued, data.storage, data.repair);
          });
          const totalData = tableData[type]?.platoonTotal || { total: 0, issued: 0, storage: 0, repair: 0 };
          row.push(totalData.total, totalData.issued, totalData.storage, totalData.repair);
          csvRows.push(toCsvRow(row));
        });

        const footer = [language === 'he' ? 'סה"כ' : 'Total'];
        squads.forEach(squad => {
            const data = totalsBySquad[squad] || { total: 0, issued: 0, storage: 0, repair: 0 };
            footer.push(data.total, data.issued, data.storage, data.repair);
        });
        const totalFooterData = platoonTotal || { total: 0, issued: 0, storage: 0, repair: 0 };
        footer.push(totalFooterData.total, totalFooterData.issued, totalFooterData.storage, totalFooterData.repair);
        csvRows.push(toCsvRow(footer));
      } else {
        // Export platoon summary only
        const csvHeader = ["Equipment", ...currentSubHeaders];
        csvRows.push(toCsvRow(csvHeader));

        equipmentTypes.forEach(type => {
          const data = tableData[type]?.platoonTotal || { total: 0, issued: 0, storage: 0, repair: 0 };
          const row = [type, data.total, data.issued, data.storage, data.repair];
          csvRows.push(toCsvRow(row));
        });

        const footer = [language === 'he' ? 'סה"כ' : 'Total', platoonTotal.total, platoonTotal.issued, platoonTotal.storage, platoonTotal.repair];
        csvRows.push(toCsvRow(footer));
      }
    } else {
      // Multi-platoon view remains the same
      const { platoons, equipmentTypes, tableData, totalsByPlatoon, grandTotal } = processedData;
      const csvHeader = ["Equipment", ...platoons.flatMap(p => currentSubHeaders.map(sub => `${p} - ${sub}`)), ...currentSubHeaders.map(sub => `${pt.title.replace("Table", "Total")} - ${sub}`)];
      csvRows.push(toCsvRow(csvHeader));

      equipmentTypes.forEach(type => {
          const row = [type];
          platoons.forEach(platoon => {
              const data = tableData[type]?.byPlatoon[platoon] || { total: 0, issued: 0, storage: 0, repair: 0 };
              row.push(data.total, data.issued, data.storage, data.repair);
          });
          const totalData = tableData[type]?.grandTotal || { total: 0, issued: 0, storage: 0, repair: 0 };
          row.push(totalData.total, totalData.issued, totalData.storage, totalData.repair);
          csvRows.push(toCsvRow(row));
      });

      const footer = [language === 'he' ? 'סה"כ' : 'Total'];
      platoons.forEach(platoon => {
          const data = totalsByPlatoon[platoon] || { total: 0, issued: 0, storage: 0, repair: 0 };
          footer.push(data.total, data.issued, data.storage, data.repair);
      });
      const totalFooterData = grandTotal || { total: 0, issued: 0, storage: 0, repair: 0 };
      footer.push(totalFooterData.total, totalFooterData.issued, totalFooterData.storage, totalFooterData.repair);
      csvRows.push(toCsvRow(footer));
    }

    const csvString = csvRows.join('\r\n');
    const BOM = "\uFEFF"; // Byte Order Mark for UTF-8 files
    const blob = new Blob([BOM + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileName = `${pt.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen bg-slate-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("Dashboard"))}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{pt.title}</h1>
              <p className="text-slate-600 mt-1 text-sm md:text-base">{pt.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-slate-600 mb-1">{pt.filterPlatoons}</span>
                <ControlTableFilters
                    allPlatoons={allPlatoons}
                    selectedPlatoons={selectedPlatoons}
                    onSelectionChange={setSelectedPlatoons}
                    lang={language}
                />
            </div>
            <ControlTableAddEquipment
              equipment={equipment}
              controlItems={equipmentControlItems}
              controlEntity={EquipmentControlItem}
              onItemsChange={setEquipmentControlItems}
              language={language}
            />
            <Button onClick={handleDownloadCSV} variant="outline" disabled={isLoading || !processedData || processedData.isEmpty}>
                <Download className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {pt.downloadCsv}
            </Button>
            <Button onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} ${isLoading ? 'animate-spin' : ''}`} />
                {pt.refreshData}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2" disabled={isLoading}>{pt.tryAgain}</Button>
          </div>
        )}

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{pt.equipmentInventory}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 md:p-2">
            <EquipmentSummaryTable 
              data={processedData}
              isLoading={isLoading}
              onViewModeChange={setIsDetailedView}
              language={language}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}