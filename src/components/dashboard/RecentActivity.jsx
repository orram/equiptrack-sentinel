
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Clock, User, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecentActivity({ assignments, isLoading, searchTerm }) {

  const filteredAssignments = assignments.filter(assignment =>
    assignment.soldier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.equipment_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredAssignments.slice(0, 10).map((assignment, index) => (
            <div key={assignment.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                {assignment.status === "active" ? (
                  <Package className="w-4 h-4 text-green-600" />
                ) : (
                  <User className="w-4 h-4 text-slate-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {assignment.soldier_name} {assignment.status === "active" ? "assigned" : "returned"} equipment
                </p>
                <p className="text-xs text-slate-500">
                  {format(new Date(assignment.assignment_date), "MMM d, yyyy")} • {assignment.location_platoon}
                </p>
              </div>
              <Badge 
                variant={assignment.status === "active" ? "default" : "secondary"}
                className="text-xs"
              >
                {assignment.status}
              </Badge>
            </div>
          ))}
          {filteredAssignments.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
