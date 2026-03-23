import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, Download } from "lucide-react";
import { generateSingle1008HTML } from "./htmlGenerator";

export default function AssignmentGroupCard({ soldier, assignmentGroup, allEquipment, isSelected, onSelectionChange }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const representativeAssignment = assignmentGroup[0];
  const isReturned = representativeAssignment?.status === 'returned';
  const assignmentDate = new Date(representativeAssignment?.assignment_date);
  const signatureData = representativeAssignment?.signature_data;
  
  const handleGeneratePDF = () => {
    setIsGenerating(true);
    const content = generateSingle1008HTML({ soldier, assignmentGroup, allEquipment });
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form_1008_${soldier.soldier_id}_${assignmentDate.toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsGenerating(false);
  };

  return (
    <Card className={`transition-colors ${isSelected ? "border-blue-400 bg-blue-50" : ""}`}>
      <CardContent className="p-4 flex items-center gap-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelectionChange}
          aria-label="Select assignment group for export"
        />
        <div className="flex-1">
          <h3 className="font-semibold flex items-center gap-2">
            {isReturned && <span className="text-green-600">✅ זוכה</span>}
            {isReturned ? 'Return' : 'Assignment'} Record: {
              assignmentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            }
            {isReturned && representativeAssignment?.return_date && (
              <span className="text-sm text-green-600">
                → Returned: {
                  new Date(representativeAssignment.return_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                }
              </span>
            )}
          </h3>
          <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
            <Package className="w-4 h-4" />
            {assignmentGroup.length} equipment item(s)
            {isReturned && <span className="text-green-600 font-medium">• CLEARED</span>}
            {signatureData && <span className="text-blue-600 font-medium">• SIGNED</span>}
          </p>
        </div>
        <Button onClick={handleGeneratePDF} variant="outline" size="sm" disabled={isGenerating}>
          <Download className="w-4 h-4 mr-2" />
          {isGenerating ? "Generating..." : "Generate 1008"}
        </Button>
      </CardContent>
    </Card>
  );
}