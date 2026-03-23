import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Trash2, ShieldCheck, Clock, User, MapPin, Copy, ExternalLink } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DuplicateEquipmentCard({ group }) {
  const sortedGroup = [...group].sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));
  const serialNumber = sortedGroup[0].serial_number;

  const copyIdsToClipboard = () => {
    const duplicateIds = sortedGroup.slice(1).map(item => item.id).join('\n');
    navigator.clipboard.writeText(duplicateIds);
    alert('Duplicate record IDs copied to clipboard! You can now paste them in the workspace.');
  };

  const openWorkspaceTab = () => {
    const baseUrl = window.location.origin.replace('preview--', '').replace('.base44.app', '');
    const workspaceUrl = `https://base44.app/apps/${baseUrl.split('//')[1]}/data/Equipment`;
    window.open(workspaceUrl, '_blank');
  };

  return (
    <Card className="bg-slate-50 border-slate-200">
      <CardHeader>
        <CardTitle className="text-base flex justify-between items-center">
          <span className="font-mono bg-slate-200 px-2 py-1 rounded">
            {serialNumber}
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="destructive">{group.length} duplicates found</Badge>
            <div className="flex gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={copyIdsToClipboard}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy duplicate IDs to clipboard</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={openWorkspaceTab}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Open Equipment data in workspace</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedGroup.map((item, index) => (
          <div key={item.id} className={`p-3 border rounded-lg flex items-start gap-4 ${index === 0 ? 'bg-green-50 border-green-300' : 'bg-white'}`}>
            {index === 0 ? (
              <ShieldCheck className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            ) : (
              <Trash2 className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
            )}

            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">{item.object_name}</h4>
                <Badge variant={item.assignment_status === "assigned" ? "default" : "secondary"}>
                  {item.assignment_status}
                </Badge>
              </div>
              <div className="text-sm text-slate-600 mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">ID:</span>
                  <code className="text-xs bg-slate-200 px-1 py-0.5 rounded">{item.id}</code>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  <span>Platoon: {item.platoon || 'N/A'}</span>
                </div>
                {item.assigned_soldier_name && (
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3" />
                    <span>Assigned to: {item.assigned_soldier_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                  <Clock className="w-3 h-3" />
                  <span>Last updated: {formatDistanceToNow(new Date(item.updated_date))} ago</span>
                </div>
              </div>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="self-center">
                    {index === 0 ? (
                       <Badge className="bg-green-600 hover:bg-green-700">Keep</Badge>
                    ) : (
                      <Badge variant="destructive" className="cursor-help">
                        Delete
                      </Badge>
                    )}
                   </div>
                </TooltipTrigger>
                <TooltipContent>
                  {index === 0 ? (
                     <p>Recommended to keep (most recent)</p>
                  ) : (
                    <p>Recommended for deletion</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}