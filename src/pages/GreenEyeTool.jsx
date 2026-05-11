import React, { useEffect, useMemo, useState } from "react";
import { Equipment, GreenInspection } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FilePlus, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PlatoonApprovalTable from "../components/green-eye/PlatoonApprovalTable";

const PLATOON_ORDER = ["א", "ב", "ג", "מסייעת", "דרג", "פלסם"];

export default function GreenEyeTool() {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [equipmentData, inspectionData] = await Promise.all([
        Equipment.list("object_name"),
        GreenInspection.list("-inspection_date")
      ]);
      setEquipment(equipmentData);
      setInspections(inspectionData);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const platoons = useMemo(() => {
    const fromEquipment = [...new Set(equipment.map(e => String(e.platoon || "").trim()).filter(Boolean))];
    return PLATOON_ORDER.filter(p => fromEquipment.includes(p)).concat(fromEquipment.filter(p => !PLATOON_ORDER.includes(p)).sort());
  }, [equipment]);

  const latestByPlatoon = useMemo(() => {
    const latest = {};
    inspections.forEach(record => {
      if (!latest[record.platoon]) latest[record.platoon] = record;
    });
    return latest;
  }, [inspections]);

  const openReportBuilder = () => {
    navigate(createPageUrl("GreenEyeReport"));
  };

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("Dashboard"))}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2"><Eye className="w-7 h-7 text-green-700" /> ירוק בעיניים</h1>
              <p className="text-slate-600 mt-1">מעקב סטטוס בדיקות פלוגתיות ודוחות חתומים</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center text-slate-500 py-10">טוען...</div>
        ) : (
          <PlatoonApprovalTable platoons={platoons} latestByPlatoon={latestByPlatoon} />
        )}

        <div className="flex justify-center">
          <Button onClick={openReportBuilder} className="bg-green-700 hover:bg-green-800 px-8">
            <FilePlus className="w-4 h-4 ml-2" /> צור דוח
          </Button>
        </div>
      </div>
    </div>
  );
}