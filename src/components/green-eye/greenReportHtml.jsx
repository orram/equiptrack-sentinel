const statusLabels = {
  approved: "מאושר",
  not_approved: "לא מאושר",
  issued: "מנופק",
  storage: "מחסן",
  repair: "תיקון"
};

export function generateGreenReportHtml({ inspection, equipment, wrongItems }) {
  const issuedEquipment = equipment.filter(item => item.assignment_status === "issued");
  const issuedWrongItems = wrongItems.filter(item => (item.assignment_status || item.status) === "issued");
  const statusText = statusLabels[inspection?.status] || "לא נבדק";
  const signature = inspection?.signature_data || inspection?.signature;

  return `<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>דוח ירוק בעיניים - פלוגה ${inspection?.platoon || ""}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;700&display=swap');
    body{font-family:'Assistant',Arial,sans-serif;margin:24px;direction:rtl;color:#1f2937;line-height:1.5}
    .actions{position:sticky;top:0;background:white;padding:12px 0;border-bottom:1px solid #ddd;margin-bottom:18px}
    .header{text-align:center;border-bottom:3px solid #14532d;padding-bottom:18px;margin-bottom:24px}
    .title{font-size:30px;font-weight:700;color:#14532d;margin:0}
    .status{display:inline-block;margin-top:10px;padding:8px 18px;border-radius:999px;font-weight:700;background:${inspection?.status === "approved" ? "#dcfce7" : "#fee2e2"};color:${inspection?.status === "approved" ? "#166534" : "#991b1b"}}
    .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:24px}
    .box{border:1px solid #d1d5db;border-radius:8px;padding:12px;background:#f9fafb}
    table{width:100%;border-collapse:collapse;margin-top:12px;font-size:14px}
    th,td{border:1px solid #9ca3af;padding:8px;text-align:right}
    th{background:#f3f4f6;font-weight:700}
    .bad{background:#fee2e2}
    .sig{max-width:260px;max-height:140px;border:1px solid #d1d5db;background:white;margin-top:8px}
    .section{margin-top:28px;page-break-inside:avoid}
    @media print{.actions{display:none}body{margin:12px}.section{page-break-inside:avoid}}
  </style>
</head>
<body>
  <div class="actions"><button onclick="window.print()" style="padding:10px 18px;cursor:pointer">הדפס / שמור PDF</button><button onclick="window.location.href='/GreenEyeTool'" style="padding:10px 18px;cursor:pointer;margin-right:8px">חזור לירוק בעיניים</button></div>
  <div class="header">
    <h1 class="title">דוח ירוק בעיניים</h1>
    <div>פלוגה ${inspection?.platoon || ""}</div>
    <div class="status">${statusText}</div>
  </div>
  <div class="grid">
    <div class="box"><strong>תאריך בדיקה:</strong> ${inspection?.inspection_date || ""}</div>
    <div class="box"><strong>סה״כ פריטים:</strong> ${issuedEquipment.length}</div>
    <div class="box"><strong>שם מאשר:</strong> ${inspection?.approver_name || ""}</div>
    <div class="box"><strong>דרגה ומ.א:</strong> ${inspection?.approver_rank || ""} | ${inspection?.approver_id || ""}</div>
  </div>
  ${signature ? `<div class="section"><h2>חתימה</h2><img class="sig" src="${signature}" /></div>` : ""}
  <div class="section">
    <h2>פריטים שסומנו כשגויים</h2>
    <table><thead><tr><th>מספר סידורי</th><th>ציוד</th><th>מחזיק</th><th>מחלקה</th><th>סטטוס</th></tr></thead><tbody>
      ${issuedWrongItems.length ? issuedWrongItems.map(item => `<tr class="bad"><td>${item.serial_number || ""}</td><td>${item.object_name || ""}</td><td>${item.issued_soldier_name || ""}</td><td>${item.squad || ""}</td><td>${statusLabels[item.assignment_status || item.status] || item.assignment_status || item.status || ""}</td></tr>`).join("") : `<tr><td colspan="5">לא סומנו פריטים שגויים</td></tr>`}
    </tbody></table>
  </div>
  <div class="section">
    <h2>כל ציוד הפלוגה</h2>
    <table><thead><tr><th>מספר סידורי</th><th>ציוד</th><th>מחזיק</th><th>מחלקה</th><th>סטטוס</th></tr></thead><tbody>
      ${issuedEquipment.map(item => `<tr><td>${item.serial_number || ""}</td><td>${item.object_name || ""}</td><td>${item.issued_soldier_name || ""}</td><td>${item.squad || ""}</td><td>${statusLabels[item.assignment_status] || item.assignment_status || ""}</td></tr>`).join("")}
    </tbody></table>
  </div>
</body>
</html>`;
}