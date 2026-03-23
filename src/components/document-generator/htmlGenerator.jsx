
export const renderSoldierSignature = (signature) => {
    if (!signature) {
      return '<div class="signature-box"><p style="color: #999; padding-top: 60px;">No signature recorded</p></div>';
    }

    // Check for canvas signature
    if (signature.soldier_signature_canvas) {
      return `
        <div class="signature-box">
          <img src="${signature.soldier_signature_canvas}" style="max-width: 100%; max-height: 120px; object-fit: contain;" alt="Soldier Signature">
        </div>
        <p style="font-size: 12px; color: #555; margin-top: 5px;">(Digital signature captured on ${new Date(signature.date).toLocaleDateString()})</p>
      `;
    }

    // Fallback for typed signatures
    if (signature.soldier_name_confirmation) {
      return `
        <div class="signature-box" style="display: flex; align-items: center; justify-content: center;">
          <div>
            <p style="font-size: 18px; font-weight: bold; margin: 0; color: #333;">${signature.soldier_name_confirmation}</p>
            <p style="font-size: 10px; color: #666; margin: 5px 0 0 0;">(Digitally confirmed on ${new Date(signature.date).toLocaleDateString()})</p>
          </div>
        </div>
      `;
    }

    return '<div class="signature-box"><p style="color: #999; padding-top: 60px;">No valid signature found</p></div>';
  };

  export const renderWitnessSignature = (signature) => {
    if (!signature) {
      return '<div class="signature-box"><p style="color: #999; padding-top: 60px;">No witness signature</p></div>';
    }

    // Check for witness canvas signature
    if (signature.witness_signature_canvas) {
      return `
        <div class="signature-box">
          <img src="${signature.witness_signature_canvas}" style="max-width: 100%; max-height: 120px; object-fit: contain;" alt="Witness Signature">
        </div>
        <p style="font-size: 12px; color: #555; margin-top: 5px;">Witness: ${signature.witness_name || 'Name not provided'}</p>
      `;
    }

    // Fallback to witness name only
    if (signature.witness_name) {
      return `
        <div class="signature-box" style="display: flex; align-items: center; justify-content: center;">
          <div>
            <p style="font-size: 16px; font-weight: bold; margin: 0; color: #333;">${signature.witness_name}</p>
            <p style="font-size: 10px; color: #666; margin: 5px 0 0 0;">(Witness - ${new Date(signature.date).toLocaleDateString()})</p>
          </div>
        </div>
      `;
    }

    return '<div class="signature-box"><p style="color: #999; padding-top: 60px;">No witness signature provided</p></div>';
  };

export const generateSingle1008HTML = ({ soldier, assignmentGroup, allEquipment }) => {
    const representativeAssignment = assignmentGroup[0];
    const signatureData = representativeAssignment?.signature_data;
    const isReturned = representativeAssignment?.status === 'returned';
    // Use the `created_by` field which contains the user's email. Fallback to assigned_by if needed.
    const assignedBy = representativeAssignment?.created_by || representativeAssignment?.assigned_by || 'System'; 

    // Deduplicate assignments by equipment_id to prevent duplicate rows
    const uniqueAssignments = assignmentGroup.filter((assignment, index, self) => 
      index === self.findIndex(a => a.equipment_id === assignment.equipment_id)
    );

    const equipmentDetails = uniqueAssignments.map(assignment => {
        return allEquipment.find(e => e.serial_number === assignment.equipment_id) || { object_name: "Unknown", serial_number: assignment.equipment_id };
    });

    return `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>טופס 1008 - ${soldier.full_name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;700&display=swap');
          body { 
            font-family: 'Assistant', sans-serif; 
            margin: 20px; 
            line-height: 1.4; 
            color: #333; 
            direction: rtl; /* Ensure RTL direction */
          }
          .page-container {
            page-break-after: always;
          }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .form-number { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .form-title { font-size: 18px; font-weight: bold; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 20px; }
          .info-item { margin-bottom: 8px; }
          .label { font-weight: bold; display: inline-block; width: 120px; }
          .equipment-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; text-align: right; } /* Align table text right */
          .equipment-table th, .equipment-table td { border: 1px solid #333; padding: 8px; text-align: right; }
          .equipment-table th { background-color: #f5f5f5; font-weight: bold; }
          .signature-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; padding-top: 20px; border-top: 1px dashed #ccc; }
          .signature-box { border: 1px solid #ccc; padding: 15px; height: 150px; text-align: center; background-color: #fafafa; }
          .signature-label { margin-bottom: 10px; font-weight: bold; }
          .status-banner { padding: 10px; text-align: center; font-weight: bold; margin-bottom: 20px; border-radius: 4px; }
          .returned { background-color: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
          .active { background-color: #ffedd5; color: #9a3412; border: 1px solid #fdba74; }
        </style>
      </head>
      <body>
        <div class="page-container">
            <div class="header">
              <div class="form-number">1008</div>
              <div class="form-title">טופס השאלת ציוד</div>
            </div>
            ${isReturned ? '<div class="status-banner returned">סטטוס: הוחזר</div>' : '<div class="status-banner active">סטטוס: פעיל</div>'}
            <div class="section">
              <div class="section-title">פרטי חייל והשאלה</div>
              <div class="info-grid">
                <div>
                  <div class="info-item"><span class="label">שם:</span> ${soldier.full_name}</div>
                  <div class="info-item"><span class="label">מספר אישי:</span> ${soldier.soldier_id}</div>
                  <div class="info-item"><span class="label">פלוגה:</span> ${soldier.platoon || "N/A"}</div>
                  <div class="info-item"><span class="label">מחלקה:</span> ${soldier.squad || "N/A"}</div>
                </div>
                <div>
                  <div class="info-item"><span class="label">תאריך השאלה:</span> ${new Date(signatureData?.date || representativeAssignment?.assignment_date).toLocaleString()}</div>
                  <div class="info-item"><span class="label">הונפק ע"י:</span> ${assignedBy}</div>
                  ${isReturned ? `<div class="info-item"><span class="label">תאריך החזרה:</span> ${new Date(representativeAssignment?.return_date).toLocaleString()}</div>` : ''}
                </div>
              </div>
            </div>
            <div class="section">
              <div class="section-title">ציוד מושאל</div>
              <table class="equipment-table">
                <thead><tr><th>מספר סידורי</th><th>שם ציוד</th><th>פריטים נלווים</th></tr></thead>
                <tbody>
                  ${equipmentDetails.map(item => `
                    <tr>
                      <td>${item.serial_number}</td>
                      <td>${item.object_name}</td>
                      <td>${(signatureData?.supplanting_items?.[item.serial_number] || []).join(', ') || 'אין'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            <div class="section">
              <div class="section-title">חתימות ואישורים</div>
              <div class="signature-section">
                <div>
                  <div class="signature-label">חתימת החייל</div>
                  ${renderSoldierSignature(signatureData)}
                </div>
                <div>
                  <div class="signature-label">חתימת העד</div>
                  ${renderWitnessSignature(signatureData)}
                </div>
              </div>
            </div>
        </div>
      </body>
      </html>
    `;
};

// Helper function for grouping, assumed to be available or added here
const groupBy = (array, keyFn) => {
    return array.reduce((acc, item) => {
        const key = keyFn(item);
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {});
};

export const generateSummaryHTML = ({ assignments, allSoldiers, allEquipment, filters }) => {
    // Deduplicate assignments by id to prevent duplicate entries
    const uniqueAssignments = assignments.filter((assignment, index, self) => 
      index === self.findIndex(a => a.id === assignment.id)
    );

    // Group assignments by platoon for a structured report
    const assignmentsByPlatoon = groupBy(uniqueAssignments, assignment => {
        const soldier = allSoldiers.find(s => s.soldier_id === assignment.soldier_id);
        return soldier?.platoon || 'Unknown Platoon';
    });

    // Group assignments by equipment type
    const assignmentsByEquipmentType = groupBy(uniqueAssignments, assignment => {
        const equipment = allEquipment.find(e => e.serial_number === assignment.equipment_id);
        return equipment?.object_name || 'Unknown Equipment';
    });

    // Build a summary of the filters applied for the report header
    let filterSummary = 'All Dates';
    if (filters.date?.from) {
        filterSummary = `From: ${new Date(filters.date.from).toLocaleDateString()}`;
        if (filters.date.to) {
            filterSummary += ` To: ${new Date(filters.date.to).toLocaleDateString()}`;
        }
    }
    const platoonSummary = filters.platoon === 'all' ? 'All Platoons' : filters.platoon;

    // Calculate Overall Stats
    const totalItems = uniqueAssignments.length;
    const totalIssued = uniqueAssignments.filter(a => a.status === 'active').length;
    const totalReturned = uniqueAssignments.filter(a => a.status === 'returned').length;
    const totalOther = totalItems - totalIssued - totalReturned;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Issued Equipment Summary</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;700&display=swap');
            body { font-family: 'Assistant', sans-serif; margin: 20px; line-height: 1.4; color: #333; }
            .report-header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .report-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .report-subtitle { font-size: 16px; color: #555; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 20px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .platoon-section { margin-bottom: 30px; page-break-inside: avoid; }
            .platoon-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .equipment-type-section { margin-bottom: 25px; page-break-inside: avoid; }
            .equipment-type-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #2563eb; background-color: #eff6ff; padding: 8px 12px; border-radius: 4px; }
            .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .summary-table th, .summary-table td { border: 1px solid #ccc; padding: 10px; text-align: left; }
            .summary-table th { background-color: #f5f5f5; font-weight: bold; }
            .summary-table tr:nth-child(even) { background-color: #f9f9f9; }
            .overall-summary-table { width: 60%; margin: 0 auto 30px auto; border-collapse: collapse; text-align: center; }
            .overall-summary-table th, .overall-summary-table td { border: 1px solid #ccc; padding: 10px; }
            .overall-summary-table th { background-color: #4a5568; color: white; font-weight: bold; }
            .equipment-summary-table { width: 80%; margin: 0 auto 30px auto; border-collapse: collapse; text-align: center; }
            .equipment-summary-table th, .equipment-summary-table td { border: 1px solid #ccc; padding: 8px; }
            .equipment-summary-table th { background-color: #2563eb; color: white; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ccc; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="report-header">
            <div class="report-title">Issued Equipment Summary Report</div>
            <div class="report-subtitle">
              Generated on: ${new Date().toLocaleString()} <br/>
              Filters: Platoon - ${platoonSummary} | Date - ${filterSummary}
            </div>
          </div>

          <div class="section">
            <h2 class="section-title" style="text-align: center; border-bottom: none; margin-bottom: 15px;">Overall Summary</h2>
            <table class="overall-summary-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Issued (Active)</td>
                  <td>${totalIssued}</td>
                </tr>
                <tr>
                  <td>Total Returned</td>
                  <td>${totalReturned}</td>
                </tr>
                ${totalOther > 0 ? `<tr><td>Other Statuses</td><td>${totalOther}</td></tr>` : ''}
                <tr style="font-weight: bold; background-color: #f7fafc;">
                  <td>Grand Total Selected</td>
                  <td>${totalItems}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2 class="section-title" style="text-align: center; border-bottom: none; margin-bottom: 15px;">Summary by Equipment Type</h2>
            <table class="equipment-summary-table">
              <thead>
                <tr>
                  <th>Equipment Type</th>
                  <th>Total Items</th>
                  <th>Currently Issued</th>
                  <th>Returned</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(assignmentsByEquipmentType)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([equipmentType, typeAssignments]) => {
                    const typeIssued = typeAssignments.filter(a => a.status === 'active').length;
                    const typeReturned = typeAssignments.filter(a => a.status === 'returned').length;
                    const typeTotal = typeAssignments.length;
                    
                    return `
                      <tr>
                        <td style="font-weight: bold;">${equipmentType}</td>
                        <td>${typeTotal}</td>
                        <td>${typeIssued}</td>
                        <td>${typeReturned}</td>
                      </tr>
                    `;
                  }).join('')}
                <tr style="font-weight: bold; background-color: #f0f9ff; border-top: 2px solid #2563eb;">
                  <td>TOTAL</td>
                  <td>${totalItems}</td>
                  <td>${totalIssued}</td>
                  <td>${totalReturned}</td>
                </tr>
              </tbody>
            </table>
          </div>

          ${Object.entries(assignmentsByPlatoon).map(([platoon, platoonAssignments]) => `
            <div class="platoon-section">
              <h2 class="platoon-title">Platoon Details: ${platoon}</h2>
              
              ${Object.entries(groupBy(platoonAssignments, assignment => {
                const equipment = allEquipment.find(e => e.serial_number === assignment.equipment_id);
                return equipment?.object_name || 'Unknown Equipment';
              })).map(([equipmentType, equipmentAssignments]) => `
                <div class="equipment-type-section">
                  <h3 class="equipment-type-title">${equipmentType} (${equipmentAssignments.length} items)</h3>
                  <table class="summary-table">
                    <thead>
                      <tr>
                        <th>Soldier Name</th>
                        <th>Soldier ID</th>
                        <th>Serial Number</th>
                        <th>Assignment Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${equipmentAssignments.map(assignment => {
                        const soldier = allSoldiers.find(s => s.soldier_id === assignment.soldier_id);
                        return `
                          <tr>
                            <td>${soldier?.full_name || 'N/A'}</td>
                            <td>${assignment.soldier_id}</td>
                            <td>${assignment.equipment_id}</td>
                            <td>${new Date(assignment.assignment_date).toLocaleDateString()}</td>
                            <td style="text-transform: capitalize;">${assignment.status}</td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              `).join('')}
            </div>
          `).join('')}
          
          <div class="footer">
            Total Items in Report: ${uniqueAssignments.length} | Equipment Types: ${Object.keys(assignmentsByEquipmentType).length} | Platoons: ${Object.keys(assignmentsByPlatoon).length}
          </div>
        </body>
      </html>
    `;
};
