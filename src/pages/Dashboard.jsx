import React, { useState, useEffect, useCallback } from "react";
import { Equipment, Soldier, Assignment } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle,
  AlertCircle,
  RefreshCw 
} from "lucide-react";

import StatsOverview from "../components/dashboard/StatsOverview";
import RecentActivity from "../components/dashboard/RecentActivity";
import QuickActions from "../components/dashboard/QuickActions";

export default function Dashboard() {
  const [equipment, setEquipment] = useState([]);
  const [soldiers, setSoldiers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async (retryCount = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [equipmentData, soldierData, assignmentData] = await Promise.all([
        Equipment.list("-created_date"),
        Soldier.list("-created_date"),
        Assignment.list("-created_date", 20),
      ]);
      setEquipment(equipmentData);
      setSoldiers(soldierData);
      setAssignments(assignmentData);
      console.log("Data loaded successfully");
      
    } catch (err) {
      console.error("Error loading data:", err);
      
      if (retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`Retrying in ${delay}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        
        setError(`Loading failed, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        setTimeout(() => {
          loadData(retryCount + 1);
        }, delay);
        
        return; 
      } else {
        const errorMessage = err.message?.includes('Network Error') 
          ? "Network connection failed. Please check your internet connection and try again."
          : err.message?.includes('429') 
          ? "Too many requests. Please wait a moment before refreshing."
          : "Failed to load dashboard data. Please try again.";
        setError(errorMessage);
      }
    }
    setIsLoading(false);
  }, []); // useCallback with empty dependency array because setters are stable and constants are not dependencies

  useEffect(() => {
    loadData();
  }, [loadData]); // loadData is now stable due to useCallback

  const syncAllAssignments = async () => {
    setIsSyncing(true);
    if (!confirm("This will sync all equipment statuses with assignment records, creating new records or marking existing ones as returned to match the current state. Continue?")) {
        setIsSyncing(false);
        return;
    }

    const results = { created: 0, returned: 0, errors: 0 };

    // Helper function to add delay between operations
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    try {
        const allEquipment = await Equipment.list();
        const activeAssignments = await Assignment.filter({ status: "active" });
        const activeAssignmentsMap = new Map(activeAssignments.map(a => [a.equipment_id, a]));

        // Process equipment in smaller batches to avoid rate limiting
        const batchSize = 5;
        for (let i = 0; i < allEquipment.length; i += batchSize) {
            const batch = allEquipment.slice(i, i + batchSize);
            
            for (const item of batch) {
                try {
                    const equipmentId = item.serial_number;
                    const activeAssignment = activeAssignmentsMap.get(equipmentId);

                    // Use new 'issued' fields, with fallback to old 'assigned' fields for backwards compatibility
                    const soldierId = item.issued_soldier_id || item.assigned_soldier_id;
                    const soldierName = item.issued_soldier_name || item.assigned_soldier_name;
                    const equipmentStatus = item.assignment_status; // Use assignment_status from equipment

                    if ((equipmentStatus === 'issued' || equipmentStatus === 'assigned') && soldierId) {
                        if (activeAssignment) {
                            if (activeAssignment.soldier_id !== soldierId) {
                                // If equipment is issued to a different soldier than currently active assignment
                                // Close the old assignment
                                await Assignment.update(activeAssignment.id, {
                                    status: 'returned',
                                    return_date: new Date().toISOString().split('T')[0],
                                    notes: 'Returned due to system-wide re-issuance sync (soldier change).'
                                });
                                results.returned++;
                                
                                // Add delay between operations
                                await delay(200);

                                // Create new assignment
                                await Assignment.create({
                                    equipment_id: equipmentId,
                                    soldier_id: soldierId,
                                    soldier_name: soldierName,
                                    assignment_date: new Date().toISOString().split('T')[0],
                                    status: "active",
                                    condition_on_assignment: item.condition || "good",
                                    location_platoon: item.platoon,
                                    assigned_by: "System Sync"
                                });
                                results.created++;
                            }
                            // Else: equipment is issued to the correct soldier, no action needed for this assignment
                        } else {
                            // Equipment is issued but no active assignment record exists
                            await Assignment.create({
                                equipment_id: equipmentId,
                                soldier_id: soldierId,
                                soldier_name: soldierName,
                                assignment_date: new Date().toISOString().split('T')[0],
                                status: "active",
                                condition_on_assignment: item.condition || "good",
                                location_platoon: item.platoon,
                                assigned_by: "System Sync"
                            });
                            results.created++;
                        }
                    } 
                    else if (equipmentStatus === 'storage' || equipmentStatus === 'repair') {
                        // Equipment is in storage or repair, should not have an active assignment
                        if (activeAssignment) {
                            await Assignment.update(activeAssignment.id, {
                                status: 'returned',
                                return_date: new Date().toISOString().split('T')[0],
                                notes: `Returned via sync. Equipment status set to ${equipmentStatus}.`
                            });
                            results.returned++;
                        }
                    }

                    // Add delay between each equipment item
                    await delay(100);
                } catch (itemError) {
                    console.error(`Error processing equipment ${item.serial_number}:`, itemError);
                    results.errors++;
                }
            }

            // Add longer delay between batches
            if (i + batchSize < allEquipment.length) {
                await delay(500);
            }
        }
        
        alert(`Sync complete!\nNew Issuances: ${results.created}\nReturned Items: ${results.returned}\nErrors: ${results.errors}`);
        loadData(); // Refresh dashboard data after sync

    } catch (error) {
        results.errors++;
        console.error("Error during assignment sync:", error);
        alert(`An error occurred during sync: ${error.message}`);
    } finally {
        setIsSyncing(false);
    }
  };

  const getStats = () => {
    const totalEquipment = equipment.length;
    const issuedEquipment = equipment.filter(e => e.assignment_status === "issued").length;
    const inStorage = equipment.filter(e => e.assignment_status === "storage").length;
    const inRepair = equipment.filter(e => e.assignment_status === "repair").length;
    const activeSoldiers = soldiers.filter(s => s.status === "active").length;

    return {
      totalEquipment,
      issuedEquipment,
      inStorage,
      inRepair,
      activeSoldiers,
      issuanceRate: totalEquipment > 0 ? Math.round((issuedEquipment / totalEquipment) * 100) : 0
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Equipment Dashboard</h1>
            <p className="text-slate-600 mt-1 text-sm md:text-base">Monitor and manage military equipment assignments</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button 
              onClick={() => loadData()} 
              disabled={isLoading}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>
        
        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-red-800 font-medium">Connection Error</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <Button 
                  onClick={() => loadData()} 
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <StatsOverview stats={stats} isLoading={isLoading} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
          {/* Left Column - Recent Activity */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            
            <RecentActivity 
              assignments={assignments}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-4 md:space-y-6">
            <QuickActions 
              stats={stats}
              onDataUpdate={loadData}
              onSyncAssignments={syncAllAssignments}
              isSyncing={isSyncing}
            />
            
            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm text-slate-600">Database</span>
                    <Badge className="bg-green-100 text-green-800 text-xs">Online</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm text-slate-600">Last Sync</span>
                    {/* Placeholder for last sync time - consider adding a state variable for this */}
                    <span className="text-xs md:text-sm text-slate-500">2 min ago</span> 
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm text-slate-600">Total Records</span>
                    <span className="text-xs md:text-sm font-medium">{equipment.length + soldiers.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}