import React, { useEffect, useMemo, useState } from "react";
import { Equipment, GreenInspection } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckCircle, Eye, XCircle } from "lucide-react";
import EquipmentEvaluationTable from "../components/green-eye/EquipmentEvaluationTable";
import GreenSummaryTable from "../components/green-eye/GreenSummaryTable";
import ApprovalDialog from "../components/green-eye/ApprovalDialog";
import { generateGreenReportHtml } from "../components/green-eye/greenReportHtml";

const PLATOON_ORDER = ["א", "ב", "ג", "מסייעת", "דרג", "פלסם"];

export default function GreenEyeReport() {
  const [equipment, setEquipment] = useState([]);
  const [selectedPlatoon, setSelectedPlatoon] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("issued");
  const [squadFilter, setSquadFilter] = useState("all");
  const [wrongItemIds, setWrongItemIds] = useState(new Set());
  const [showSummaryTable, setShowSummaryTable] = useState(false);
  const [summaryBySquad, setSummaryBySquad] = useState(false);
  const [approvalDialog, setApprovalDialog] = useState(null);
  const [savedInspection, setSavedInspection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const equipmentData = await Equipment.list("object_name");
      setEquipment(equipmentData);
      const urlPlatoon = new URLSearchParams(window.location.search).get("platoon");
      const firstPlatoon = PLATOON_ORDER.find(p => equipmentData.some(e => String(e.platoon || "").trim() === p));
      setSelectedPlatoon(urlPlatoon || firstPlatoon || PLATOON_ORDER[0]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const platoons = useMemo(() => {
    const fromEquipment = [...new Set(equipment.map(e => String(e.platoon || "").trim()).filter(Boolean))];
    return PLATOON_ORDER.filter(p => fromEquipment.includes(p)).concat(fromEquipment.filter(p => !PLATOON_ORDER.includes(p)).sort());
  }, [equipment]);

  const platoonEquipment = useMemo(() => equipment.filter(item => String(item.platoon || "").trim() === selectedPlatoon), [equipment, selectedPlatoon]);

  const squads = useMemo(() => [...new Set(platoonEquipment.map(item => item.squad).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })), [platoonEquipment]);

  const filteredEquipment = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return platoonEquipment.filter(item => {
      const matchesSearch = !term || item.object_name?.toLowerCase().includes(term) || item.serial_number?.toLowerCase().includes(term) || item.issued_soldier_name?.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || item.assignment_status === statusFilter;
      const matchesSquad = squadFilter === "all" || (item.squad || "") === squadFilter;
      return matchesSearch && matchesStatus && matchesSquad;
    });
  }, [platoonEquipment, searchTerm, statusFilter, squadFilter]);

  const wrongItems = useMemo(() => equipment.filter(item => wrongItemIds.has(item.id)), [equipment, wrongItemIds]);

  const toggleWrongItem = (itemId) => {
    setWrongItemIds(prev => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  };

  const handleApprovalSubmit = async ({ name, rank, idNumber, signature }) => {
    const today = new Date().toISOString().split("T")[0];
    const inspectionData = {
      platoon: selectedPlatoon,
      status: approvalDialog,
      inspection_date: today,
      approver_name: name,
      approver_rank: rank,
      approver_id: idNumber,
      signature_data: signature,
      wrong_items: wrongItems.map(item => ({
        id: item.id,
        serial_number: item.serial_number,
        object_name: item.object_name,
        issued_soldier_name: item.issued_soldier_name,
        squad: item.squad,
        status: item.assignment_status
      })),
      total_items: platoonEquipment.length
    };
    const created = await GreenInspection.create(inspectionData);
    setSavedInspection(created);
    setApprovalDialog(null);
  };

  const viewActualReport = () => {
    const html = generateGreenReportHtml({ inspection: savedInspection, equipment: platoonEquipment, wrongItems });
    document.open();
    document.write(html);
    document.close();
  };

  if (savedInspection) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" dir="rtl">
        <Card className="max-w-xl w-full text-center">
          <CardHeader><CardTitle>הדוח נשמר בהצלחה</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600">דוח ירוק בעיניים לפלוגה {savedInspection.platoon} נשמר ויופיע בטבלת הסטטוס הראשית.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={viewActualReport}>צפה בדוח</Button>
              <Button variant="outline" onClick={() => window.location.href = "/GreenEyeTool"}>חזור לירוק בעיניים</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2"><Eye className="w-7 h-7 text-green-700" /> בדיקת פלוגה</h1>
            <p className="text-slate-600 mt-1">בחר פלוגה, סמן פריטים שגויים, אשר וחתום לשמירת הדוח</p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-green-700 hover:bg-green-800" onClick={() => setApprovalDialog("approved")} disabled={!selectedPlatoon}>
              <CheckCircle className="w-4 h-4 ml-2" /> מאושר
            </Button>
            <Button variant="destructive" onClick={() => setApprovalDialog("not_approved")} disabled={!selectedPlatoon}>
              <XCircle className="w-4 h-4 ml-2" /> לא מאושר
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle>פרטי בדיקה</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Select value={selectedPlatoon} onValueChange={(value) => { setSelectedPlatoon(value); setWrongItemIds(new Set()); }}>
                <SelectTrigger><SelectValue placeholder="בחר פלוגה" /></SelectTrigger>
                <SelectContent>{platoons.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="חיפוש ציוד / מ.ס / מחזיק" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הסטטוסים</SelectItem>
                  <SelectItem value="issued">מנופק</SelectItem>
                  <SelectItem value="storage">מחסן</SelectItem>
                  <SelectItem value="repair">תיקון</SelectItem>
                </SelectContent>
              </Select>
              <Select value={squadFilter} onValueChange={setSquadFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל המחלקות</SelectItem>
                  {squads.map(squad => <SelectItem key={squad} value={squad}>{squad}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between bg-white border rounded-lg p-3">
              <div className="text-sm text-slate-600">מוצגים {filteredEquipment.length} מתוך {platoonEquipment.length} פריטים | שגויים: {wrongItemIds.size}</div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label>הצג טבלת סיכום</Label>
                  <Switch checked={showSummaryTable} onCheckedChange={setShowSummaryTable} />
                </div>
                <div className="flex items-center gap-2">
                  <Label>סיכום לפי מחלקה</Label>
                  <Switch checked={summaryBySquad} onCheckedChange={setSummaryBySquad} disabled={!showSummaryTable} />
                </div>
              </div>
            </div>

            {isLoading ? <p className="text-center text-slate-500 py-8">טוען...</p> : (
              <>
                {showSummaryTable && <GreenSummaryTable equipment={platoonEquipment} wrongItemIds={wrongItemIds} viewMode={summaryBySquad ? "squad" : "total"} />}
                <EquipmentEvaluationTable equipment={filteredEquipment} wrongItemIds={wrongItemIds} onToggleWrong={toggleWrongItem} />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <ApprovalDialog open={!!approvalDialog} status={approvalDialog} onClose={() => setApprovalDialog(null)} onSubmit={handleApprovalSubmit} />
    </div>
  );
}