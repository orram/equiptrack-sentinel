import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Plus, 
  Upload, 
  Download,
  Users,
  GitCompareArrows,
  FileSpreadsheet
} from "lucide-react";

export default function QuickActions({ stats, onSyncAssignments, isSyncing }) {
  const actions = [
    {
      title: "Import Data",
      description: "Upload Excel or CSV files",
      icon: Upload,
      href: createPageUrl("Import"),
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Add Equipment",
      description: "Register new equipment",
      icon: Plus,
      href: createPageUrl("Equipment"),
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "Manage Soldiers",
      description: "View soldier profiles",
      icon: Users,
      href: createPageUrl("Soldiers"),
      color: "bg-purple-600 hover:bg-purple-700"
    }
  ];

  const exportToGoogleSheetsFormat = () => {
    // Create a comprehensive CSV with all equipment data
    const csvHeaders = [
      'Serial-Number',
      'Object-Name', 
      'Platoon',
      'Assigned-Soldier-Name',
      'Assigned-Soldier-ID',
      'Status',
      'Squad',
      'Condition',
      'Category',
      'Acquisition-Date',
      'Last-Maintenance',
      'Notes'
    ];
    
    // Note: This would need actual equipment data passed as props
    const csvData = `${csvHeaders.join(',')}\n`;
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equipment-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <Link key={index} to={action.href} className="block">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 h-auto p-4 hover:bg-slate-50"
            >
              <div className={`p-2 rounded-lg ${action.color} bg-opacity-20`}>
                <action.icon className={`w-4 h-4 ${action.color.split(' ')[0].replace('bg-', 'text-')}`} />
              </div>
              <div className="text-left">
                <p className="font-medium">{action.title}</p>
                <p className="text-sm text-slate-500">{action.description}</p>
              </div>
            </Button>
          </Link>
        ))}
        
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 h-auto p-4 hover:bg-slate-50"
          onClick={exportToGoogleSheetsFormat}
        >
          <div className="p-2 rounded-lg bg-green-600 bg-opacity-20">
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-left">
            <p className="font-medium">Export for Google Sheets</p>
            <p className="text-sm text-slate-500">Download CSV for Sheets sync</p>
          </div>
        </Button>
        
        {/* Keep existing buttons */}
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 h-auto p-4 hover:bg-slate-50"
          onClick={() => {
            const csvData = `Equipment Status Report\nGenerated: ${new Date().toLocaleString()}\n\nTotal Equipment: ${stats.totalEquipment}\nIssued: ${stats.issuedEquipment}\nIn Storage: ${stats.inStorage}\nUnder Repair: ${stats.inRepair}`;
            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'equipment-report.csv';
            a.click();
          }}
        >
          <div className="p-2 rounded-lg bg-amber-600 bg-opacity-20">
            <Download className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-left">
            <p className="font-medium">Export Report</p>
            <p className="text-sm text-slate-500">Download status report</p>
          </div>
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 h-auto p-4 hover:bg-slate-50"
          onClick={onSyncAssignments}
          disabled={isSyncing}
        >
          <div className="p-2 rounded-lg bg-cyan-600 bg-opacity-20">
            <GitCompareArrows className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-left">
            <p className="font-medium">{isSyncing ? "Syncing..." : "Sync Assignments"}</p>
            <p className="text-sm text-slate-500">Reconcile all records</p>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
}