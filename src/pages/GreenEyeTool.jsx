import React, { useEffect, useMemo, useState } from "react";
import { Equipment, GreenInspection } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Download, Eye, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PlatoonApprovalTable from "../components/green-eye/PlatoonApprovalTable";
import EquipmentEvaluationTable from "../components/green-eye/EquipmentEvaluationTable";
import GreenSummaryTable from "../components/green-eye/GreenSummaryTable";
import ApprovalDialog from "../components/green-eye/ApprovalDialog";

const PLATOON_ORDER = ["א", "ב", "ג", "מסייעת", "דרג", "פלסם"];

export default function GreenEyeTool() {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [selectedPlatoon, setSelectedPlatoon] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [squadFilter, setSquadFilter] = useState("all");
  const [wrongItemIds, setWrongItemIds] = useState(new Set());
  const [summaryBySquad, setSummaryBySquad] = useState(false);
  const [approvalDialog, setApprovalDialog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [equipmentData, inspectionData] = await Promise.all([
      Equipment.list("object_name"),
      GreenInspection.list("-inspection_date")
    ]);
    setEquipment(equipmentData);
    setInspections(inspectionData);
    const firstPlatoon = PLATOON_ORDER.find(p => equipmentData.some(e => String(e.platoon || "").trim() === p));
    setSelectedPlatoon(prev => prev || firstPlatoon || PLATOON_ORDER[0]);
    setIsLoading(false);
  };

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

  const platoonEquipment = useMemo(() => {
    return equipment.filter(item => String(item.platoon || "").trim() === selectedPlatoon);
  }, [equipment, selectedPlatoon]);

  const squads = useMemo(() => {
    return [...new Set(platoonEquipment.map(item => item.squad).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [platoonEquipment]);

  const filteredEquipment = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return platoonEquipment.filter(item => {
      const matchesSearch = !term ||
        item.object_name?.toLowerCase().includes(term) ||
        item.serial_number?.toLowerCase().includes(term) ||
        item.issued_soldier_name?.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || item.assignment_status === statusFilter;
      const matchesSquad = squadFilter === "all" || (item.squad || "") === squadFilter;
      return matchesSearch && matchesStatus && matchesSquad;
    });
  }, [platoonEquipment, searchTerm, statusFilter, squadFilter]);

  const wrongItems = useMemo(() => {
    return equipment.filter(item => wrongItemIds.has(item.id));
  }, [equipment, wrongItemIds]);

  const toggleWrongItem = (itemId) => {
    setWrongItemIds(prev => {
      const next = new Set(prev);
      next.has(itemId) ? next.delete(itemId) : next.add(itemId);
      return next;
    });
  };

  const handleApprovalSubmit = async ({ name, rank, idNumber, signature }) => {
    const today = new Date().toISOString().split("T")[0];
    await GreenInspection.create({
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
    });
    setApprovalDialog(null);
    await loadData();
    if (confirm("האם להוריד דוח עכשיו?")) downloadReport({ name, rank, idNumber, signature, status: approvalDialog, date: today });
  };

  const downloadReport = (approval = latestByPlatoon[selectedPlatoon]) => {
    const statusText = approval?.status === "approved" ? "מאושר" : "לא מאושר";
    const reportHtml = `<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>דוח ירוק בעיניים</title><style>body{font-family:Arial;padding:24px;direction:rtl}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{border:1px solid #999;padding:8px;text-align:right}.bad{background:#fee2e2}.header{display:flex;justify-content:space-between;align-items:center}.sig{max-width:240px;border:1px solid #ccc;margin-top:8px}</style></head><body><div class="header"><h1>דוח ירוק בעיניים - פלוגה ${selectedPlatoon}</h1><h2>${statusText}</h2></div><p>תאריך: ${approval?.date || approval?.inspection_date || new Date().toISOString().split("T")[0]}</p><p>מאשר: ${approval?.rank || approval?.approver_rank || ""} ${approval?.name || approval?.approver_name || ""} | מ.א: ${approval?.idNumber || approval?.approver_id || ""}</p>${approval?.signature || approval?.signature_data ? `<img class="sig" src="${approval.signature || approval.signature_data}" />` : ""}<h2>פריטים שגויים</h2><table><thead><tr><th>מ.ס</th><th>ציוד</th><th>מחזיק</th><th>מחלקה</th><th>סטטוס</th></tr></thead><tbody>${wrongItems.map(item => `<tr class="bad"><td>${item.serial_number || ""}</td><td>${item.object_name || ""}</td><td>${item.issued_soldier_name || ""}</td><td>${item.squad || ""}</td><td>${item.assignment_status || ""}</td></tr>`).join("") || `<tr><td colspan="5">לא סומנו פריטים שגויים</td></tr>`}</tbody></table><h2>כל ציוד הפלוגה</h2><table><thead><tr><th>מ.ס</th><th>ציוד</th><th>מחזיק</th><th>מחלקה</th><th>סטטוס</th></tr></thead><tbody>${platoonEquipment.map(item => `<tr><td>${item.serial_number || ""}</td><td>${item.object_name || ""}</td><td>${item.issued_soldier_name || ""}</td><td>${item.squad || ""}</td><td>${item.assignment_status || ""}</td></tr>`).join("")}</tbody></table></body></html>`;
    const blob = new Blob([reportHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `green_eye_${selectedPlatoon}_${new Date().toISOString().split("T")[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("Dashboard"))}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2"><Eye className="w-7 h-7 text-green-700" /> ירוק בעיניים</h1>
              <p className="text-slate-600 mt-1">בדיקת ציוד לפי פלוגה, סימון חריגים והפקת דוח חתום</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="bg-green-700 hover:bg-green-800" onClick={() => setApprovalDialog("approved")} disabled={!selectedPlatoon}>
              <CheckCircle className="w-4 h-4 ml-2" /> מאושר
            </Button>
            <Button variant="destructive" onClick={() => setApprovalDialog("not_approved")} disabled={!selectedPlatoon}>
              <XCircle className="w-4 h-4 ml-2" /> לא מאושר
            </Button>
            <Button variant="outline" onClick={() => downloadReport()} disabled={!selectedPlatoon}>
              <Download className="w-4 h-4 ml-2" /> צור דוח
            </Button>
          </div>
        </div>

        <PlatoonApprovalTable platoons={platoons} latestByPlatoon={latestByPlatoon} />

        <Card>
          <CardHeader>
            <CardTitle>בדיקת פלוגה</CardTitle>
          </CardHeader>
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
              <div className="flex items-center gap-2">
                <Label>סיכום לפי מחלקה</Label>
                <Switch checked={summaryBySquad} onCheckedChange={setSummaryBySquad} />
              </div>
            </div>

            {isLoading ? <p className="text-center text-slate-500 py-8">טוען...</p> : (
              <>
                <GreenSummaryTable equipment={platoonEquipment} wrongItemIds={wrongItemIds} viewMode={summaryBySquad ? "squad" : "total"} />
                <EquipmentEvaluationTable equipment={filteredEquipment} wrongItemIds={wrongItemIds} onToggleWrong={toggleWrongItem} />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <ApprovalDialog
        open={!!approvalDialog}
        status={approvalDialog}
        onClose={() => setApprovalDialog(null)}
        onSubmit={handleApprovalSubmit}
      />
    </div>
  );
}