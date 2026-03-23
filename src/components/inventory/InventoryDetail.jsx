import React, { useState, useEffect } from "react";
import { Assignment } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Calendar, Hash } from "lucide-react";

export default function InventoryDetail({ item, t }) {
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (item) {
        setIsLoading(true);
        try {
          const assignmentData = await Assignment.filter({ 
            equipment_id: item.object_name, 
            assignment_type: 'inventory' 
          }, '-assignment_date');
          setAssignments(assignmentData);
        } catch (error) {
          console.error("Error fetching assignments for inventory item:", error);
        }
        setIsLoading(false);
      }
    };
    fetchAssignments();
  }, [item]);

  if (!item) {
    return (
      <Card className="sticky top-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">{t.inventoryDetails}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-slate-500 py-10">{t.selectInventoryItemToSeeDetails}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">{item.object_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <p><strong>{t.category}:</strong> {item.category}</p>
          <p><strong>{t.totalQuantity}:</strong> {item.total_quantity}</p>
          <p><strong>{t.availableQuantity}:</strong> {item.available_quantity}</p>
          <p><strong>{t.notes}:</strong> {item.notes || 'N/A'}</p>
        </div>
        
        <h4 className="font-semibold mb-2">{t.assignmentHistory}</h4>
        <div className="max-h-60 overflow-y-auto space-y-2">
            {isLoading ? <p>{t.loadingHistory}</p> : 
                assignments.length > 0 ? (
                    assignments.map(assignment => (
                        <div key={assignment.id} className="p-2 bg-slate-50 rounded text-sm">
                            <p className="font-medium flex justify-between">
                                <span><User className="w-4 h-4 inline-block mr-1"/>{assignment.soldier_name}</span>
                                <span className="text-xs">{assignment.status}</span>
                            </p>
                            <p className="text-xs text-slate-500"><Calendar className="w-3 h-3 inline-block mr-1"/>{new Date(assignment.assignment_date).toLocaleDateString()}</p>
                            <p className="text-xs text-slate-500"><Hash className="w-3 h-3 inline-block mr-1"/>{t.quantity}: {assignment.quantity}</p>
                        </div>
                    ))
                ) : <p className="text-sm text-slate-500">{t.noAssignmentHistoryForItem}</p>
            }
        </div>
      </CardContent>
    </Card>
  );
}