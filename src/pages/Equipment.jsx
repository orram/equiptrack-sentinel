import React, { useState, useEffect, useCallback } from "react";
import { Equipment, Soldier, OldEquipment } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Download, // Add Download icon
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from "lucide-react";

import EquipmentList from "../components/equipment/EquipmentList";
import EquipmentFilters from "../components/equipment/EquipmentFilters";
import EquipmentDetail from "../components/equipment/EquipmentDetail";
import AssignmentModal from "../components/equipment/AssignmentModal";
import AddEquipmentModal from "../components/equipment/AddEquipmentModal";
import { useLanguage } from "../layout";

export default function EquipmentPage() {
  const { t } = useLanguage();
  const [equipment, setEquipment] = useState([]);
  const [soldiers, setSoldiers] = useState([]);
  const [oldEquipment, setOldEquipment] = useState([]);
  // const [assignments, setAssignments] = useState([]); // This is no longer needed here
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDeleted, setIsLoadingDeleted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletedSearchTerm, setDeletedSearchTerm] = useState("");
  const [showDeletedSection, setShowDeletedSection] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    platoon: "all",
    squad: "all",
    condition: "all"
  });
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadData = useCallback(async (retryCount = 0) => {
    const MAX_RETRIES = 2;
    const RETRY_DELAY = 1000;
    
    setIsLoading(true);
    
    try {
      console.log("Loading equipment data...");
      const equipmentData = await Equipment.list("-created_date");
      
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log("Loading soldier data...");
      const soldierData = await Soldier.list("-created_date");

      setEquipment(equipmentData);
      setSoldiers(soldierData);
      console.log("Equipment page data loaded successfully");
      
    } catch (error) {
      console.error("Error loading data:", error);
      
      if (retryCount < MAX_RETRIES && error.message?.includes('Network Error')) {
        const delay = RETRY_DELAY * (retryCount + 1);
        console.log(`Network error, retrying in ${delay}ms...`);
        
        setTimeout(() => {
          loadData(retryCount + 1);
        }, delay);
        return; // Exit here, isLoading will be set to false after final attempt
      } else {
        // Show user-friendly error but don't break the app
        console.error("Failed to load equipment data after retries");
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadDeletedEquipment = async () => {
    if (oldEquipment.length > 0) return; // Don't load again if already loaded
    
    setIsLoadingDeleted(true);
    try {
      const deletedData = await OldEquipment.list("-deletion_date");
      setOldEquipment(deletedData);
    } catch (error) {
      console.error("Error loading deleted equipment:", error);
    }
    setIsLoadingDeleted(false);
  };

  const handleShowDeleted = () => {
    if (!showDeletedSection) {
      loadDeletedEquipment();
    }
    setShowDeletedSection(!showDeletedSection);
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch =
      item.object_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.issued_soldier_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filters.status === "all" || item.assignment_status === filters.status;
    
    // Updated platoon filtering to handle "no_platoon" option
    const matchesPlatoon = filters.platoon === "all" || 
                          (filters.platoon === "no_platoon" ? !item.platoon : item.platoon === filters.platoon);
    
    const matchesSquad = filters.squad === "all" || item.squad === filters.squad;
    const matchesCondition = filters.condition === "all" || item.condition === filters.condition;

    return matchesSearch && matchesStatus && matchesPlatoon && matchesSquad && matchesCondition;
  });

  const filteredDeletedEquipment = oldEquipment.filter(item => {
    const matchesSearch =
      item.object_name?.toLowerCase().includes(deletedSearchTerm.toLowerCase()) ||
      item.serial_number?.toLowerCase().includes(deletedSearchTerm.toLowerCase()) ||
      item.deleted_by?.toLowerCase().includes(deletedSearchTerm.toLowerCase()) ||
      item.deletion_reason?.toLowerCase().includes(deletedSearchTerm.toLowerCase());

    return matchesSearch;
  });
  
  const handleExportReport = () => {
    if (!filteredEquipment || filteredEquipment.length === 0) {
      alert("No equipment data to export based on current filters.");
      return;
    }

    const headers = [
      "Serial Number", "Object Name", "Status", "Condition", "Category", 
      "Platoon", "Squad", "Current Holder", "Holder ID", 
      "Acquisition Date", "Last Maintenance", "Notes"
    ];
    
    const csvRows = [headers.join(',')];

    const escapeCsvCell = (cell) => {
        if (cell === undefined || cell === null) return '';
        const str = String(cell);
        // If the string contains a comma, double quote, or newline, enclose it in double quotes.
        // Also, replace any double quotes within the string with two double quotes.
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    for (const item of filteredEquipment) {
      const row = [
        escapeCsvCell(item.serial_number),
        escapeCsvCell(item.object_name),
        escapeCsvCell(item.assignment_status),
        escapeCsvCell(item.condition),
        escapeCsvCell(item.category),
        escapeCsvCell(item.platoon),
        escapeCsvCell(item.squad),
        escapeCsvCell(item.issued_soldier_name),
        escapeCsvCell(item.issued_soldier_id),
        escapeCsvCell(item.acquisition_date),
        escapeCsvCell(item.last_maintenance),
        escapeCsvCell(item.notes),
      ];
      csvRows.push(row.join(','));
    }

    const csvString = csvRows.join('\r\n');
    // Add BOM for proper UTF-8 interpretation in Excel
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equipment_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleIssueEquipment = (equipmentItem) => {
    setSelectedEquipment(equipmentItem);
    setShowIssueModal(true);
  };

  const handleIssueComplete = () => {
    setShowIssueModal(false);
    setSelectedEquipment(null);
    loadData();
  };

  const handleAddEquipment = () => {
    setShowAddModal(true);
  };

  const handleAddComplete = () => {
    setShowAddModal(false);
    loadData();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{t.equipmentManagement}</h1>
            <p className="text-slate-600 mt-1">{t.equipmentManagementSubtitle}</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleAddEquipment}
            >
              <Plus className="w-4 h-4" />
              {t.addEquipment}
            </Button>
            <Button 
              className="bg-slate-900 hover:bg-slate-800 flex items-center gap-2"
              onClick={handleExportReport}
            >
              <Download className="w-4 h-4" />
              {t.exportReport}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder={t.searchEquipmentByNameSerialHolder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <EquipmentFilters
                filters={filters}
                onFilterChange={setFilters}
                equipment={equipment}
                t={t}
              />
            </div>
          </CardContent>
        </Card>

        {/* Equipment List */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EquipmentList
              equipment={filteredEquipment}
              isLoading={isLoading}
              onIssueEquipment={handleIssueEquipment}
              onViewDetails={setSelectedEquipment}
              t={t}
            />
          </div>

          {/* Equipment Details Sidebar */}
          <div className="space-y-6">
            <EquipmentDetail
              equipment={selectedEquipment}
              onUpdate={loadData}
              t={t}
            />
          </div>
        </div>

        {/* Deleted Equipment Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Trash2 className="w-5 h-5" />
                  Deleted Equipment Archive
                  {oldEquipment.length > 0 && (
                    <Badge variant="outline" className="ml-2">
                      {oldEquipment.length} items
                    </Badge>
                  )}
                </CardTitle>
                <Button 
                  variant="outline" 
                  onClick={handleShowDeleted}
                  className="flex items-center gap-2"
                >
                  {showDeletedSection ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Hide Deleted
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show Deleted
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            
            {showDeletedSection && (
              <CardContent>
                {/* Search for deleted equipment */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search deleted equipment by name, serial, deleted by, or reason..."
                      value={deletedSearchTerm}
                      onChange={(e) => setDeletedSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {isLoadingDeleted ? (
                  <div className="text-center py-8 text-slate-500">
                    Loading deleted equipment...
                  </div>
                ) : filteredDeletedEquipment.length > 0 ? (
                  <div className="space-y-3">
                    {filteredDeletedEquipment.map((item) => (
                      <div key={item.id} className="p-4 border rounded-lg bg-red-50 border-red-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <code className="text-sm bg-white px-2 py-1 rounded font-mono font-semibold border">
                                {item.serial_number}
                              </code>
                              <h3 className="font-semibold text-slate-900">{item.object_name}</h3>
                              <Badge variant="destructive" className="text-xs">
                                Deleted
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
                              <div>
                                <span className="font-medium">Deleted:</span> {item.deletion_date}
                              </div>
                              <div>
                                <span className="font-medium">By:</span> {item.deleted_by}
                              </div>
                              <div>
                                <span className="font-medium">Last Status:</span> {item.assignment_status}
                              </div>
                              {item.platoon && (
                                <div>
                                  <span className="font-medium">Platoon:</span> {item.platoon}
                                </div>
                              )}
                              {item.issued_soldier_name && (
                                <div>
                                  <span className="font-medium">Last Holder:</span> {item.issued_soldier_name}
                                </div>
                              )}
                            </div>

                            {item.deletion_reason && (
                              <div className="mt-2 p-2 bg-white rounded border text-sm">
                                <span className="font-medium text-red-700">Deletion Reason:</span>
                                <p className="text-slate-700 mt-1">{item.deletion_reason}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center text-red-600">
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    {deletedSearchTerm ? (
                      <div>
                        <Trash2 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <p className="font-medium">No deleted equipment matches your search</p>
                        <p className="text-sm">Try adjusting your search terms</p>
                      </div>
                    ) : (
                      <div>
                        <Trash2 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <p className="font-medium">No deleted equipment found</p>
                        <p className="text-sm">Equipment deletion records will appear here</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>

        {/* Issue Modal */}
        {showIssueModal && selectedEquipment && (
          <AssignmentModal
            equipment={selectedEquipment}
            soldiers={soldiers}
            onComplete={handleIssueComplete}
            onClose={() => setShowIssueModal(false)}
            t={t}
          />
        )}

        {/* Add Equipment Modal */}
        {showAddModal && (
          <AddEquipmentModal
            onComplete={handleAddComplete}
            onClose={() => setShowAddModal(false)}
            t={t}
          />
        )}
      </div>
    </div>
  );
}