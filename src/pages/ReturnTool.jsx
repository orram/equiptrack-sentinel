import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Equipment, Soldier, Assignment, InventoryItem } from "@/entities/all";
import { EmailService } from "../components/utils/EmailService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Package,
  ArrowLeft,
  Search,
  RotateCcw,
  CheckCircle,
  Layers,
  ShieldCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "../layout";

export default function ReturnTool() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [equipment, setEquipment] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [soldiers, setSoldiers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    platoon: "all",
    soldier: "all",
    condition: "all"
  });

  const loadData = useCallback(async (retryCount = 0) => {
    const MAX_RETRIES = 2;
    
    setIsLoading(true);
    try {
      console.log("Loading return tool data...");
      const equipmentData = await Equipment.list();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      const inventoryData = await InventoryItem.list();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      const soldierData = await Soldier.list();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      const assignmentData = await Assignment.filter({ status: "active" });

      setEquipment(equipmentData);
      setInventoryItems(inventoryData);
      setSoldiers(soldierData);
      setAssignments(assignmentData);
      console.log("Return tool data loaded successfully");
      
    } catch (error) {
      console.error("Error loading return tool data:", error);
      
      if (retryCount < MAX_RETRIES && error.message?.includes('Network Error')) {
        console.log(`Retrying return tool data load... (${retryCount + 1})`);
        setTimeout(() => loadData(retryCount + 1), 1000);
        return;
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const allIssuedItems = useMemo(() => {
    return assignments.map(assignment => {
      let itemDetails = {};
      const soldier = soldiers.find(s => s.soldier_id === assignment.soldier_id);
      
      if (assignment.assignment_type === 'inventory') {
        itemDetails = inventoryItems.find(i => i.object_name === assignment.equipment_id) || {};
        itemDetails.object_name = assignment.equipment_id; // ensure name is present
      } else {
        itemDetails = equipment.find(e => e.serial_number === assignment.equipment_id) || {};
      }
      
      return {
        assignment,
        itemDetails,
        soldier,
        type: assignment.assignment_type || 'serialized',
      };
    }).filter(item => {
        const itemSoldier = item.soldier || {};
        const searchTermLower = searchTerm.toLowerCase();

        const matchesSearch =
          item.itemDetails.object_name?.toLowerCase().includes(searchTermLower) ||
          item.itemDetails.serial_number?.toLowerCase().includes(searchTermLower) ||
          itemSoldier.full_name?.toLowerCase().includes(searchTermLower);

        const matchesPlatoon = filters.platoon === "all" || itemSoldier.platoon === filters.platoon;
        const matchesSoldier = filters.soldier === "all" || itemSoldier.soldier_id === filters.soldier;
        const matchesCondition = filters.condition === "all" || item.itemDetails.condition === filters.condition;

        return matchesSearch && matchesPlatoon && matchesSoldier && matchesCondition;
    });
  }, [assignments, equipment, inventoryItems, soldiers, searchTerm, filters]);


  const handleSelectItem = (assignmentId) => {
    setSelectedItems(prev =>
      prev.includes(assignmentId)
        ? prev.filter(id => id !== assignmentId)
        : [...prev, assignmentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === allIssuedItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(allIssuedItems.map(item => item.assignment.id));
    }
  };

  const sendReturnEmail = async (item, assignment, soldier) => {
    try {
      await EmailService.sendReturnEmail(soldier, item, assignment);
      console.log(`Return email sent to ${soldier?.email}`);
    } catch (error) {
      console.error("Error sending return email:", error);
    }
  };

  const handleReturnEquipment = async () => {
    if (selectedItems.length === 0) return;
    
    if (!confirm(t.confirmReturnNItems(selectedItems.length))) {
      return;
    }

    setIsProcessing(true);
    
    try {
      for (const assignmentId of selectedItems) {
        const issuedItem = allIssuedItems.find(i => i.assignment.id === assignmentId);
        if (!issuedItem) continue;

        const { assignment, itemDetails, soldier } = issuedItem;

        // Update the main assignment
        await Assignment.update(assignment.id, {
          status: 'returned',
          return_date: new Date().toISOString().split('T')[0],
          condition_on_return: itemDetails.condition || 'good',
          notes: 'Returned via Return Tool - CLEARED (זוכה)',
        });

        // Handle supplanting items return
        if (assignment.signature_data?.supplanting_items && assignment.signature_data.supplanting_items.length > 0) {
          console.log(`Processing return of ${assignment.signature_data.supplanting_items.length} supplanting items for ${assignment.equipment_id}`);
          
          for (const supplantingItemName of assignment.signature_data.supplanting_items) {
            // Check if this supplanting item exists in inventory
            const inventoryMatch = inventoryItems.find(item => 
              item.object_name.toLowerCase() === supplantingItemName.toLowerCase()
            );
            
            if (inventoryMatch) {
              // Return to inventory
              await InventoryItem.update(inventoryMatch.id, {
                available_quantity: (inventoryMatch.available_quantity || 0) + 1
              });
              console.log(`Returned supplanting item "${supplantingItemName}" to inventory`);
            } else {
              console.log(`Supplanting item "${supplantingItemName}" not found in inventory - may be serialized or tracked separately`);
            }
          }
        }

        // Handle main item return
        if (assignment.assignment_type === 'inventory') {
          const invItem = inventoryItems.find(i => i.object_name === assignment.equipment_id);
          if (invItem) {
            await InventoryItem.update(invItem.id, {
              available_quantity: (invItem.available_quantity || 0) + (assignment.quantity || 1)
            });
          }
        } else {
          const eqItem = equipment.find(e => e.serial_number === assignment.equipment_id);
          if (eqItem) {
            await Equipment.update(eqItem.id, {
              assignment_status: "storage",
              issued_soldier_id: null,
              issued_soldier_name: null
            });
          }
        }

        // Send return email
        if (soldier?.email) {
          await sendReturnEmail(itemDetails, assignment, soldier);
        }

        await new Promise(resolve => setTimeout(resolve, 200));
      }

      alert(t.successfullyReturnedNItems(selectedItems.length));
      setSelectedItems([]);
      loadData();
      
    } catch (error) {
      console.error("Error processing returns:", error);
      alert(t.errorProcessingReturns);
    }
    
    setIsProcessing(false);
  };

  const getPlatoons = () => {
    const platoons = [...new Set(soldiers.map(s => s.platoon).filter(Boolean))];
    return platoons.sort();
  };

  const getIssuedSoldiers = () => {
    const issuedSoldierIds = new Set(assignments.map(a => a.soldier_id));
    return soldiers
      .filter(s => s.soldier_id && issuedSoldierIds.has(s.soldier_id))
      .sort((a, b) => a.full_name.localeCompare(b.full_name));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t.returnToolTitle}</h1>
            <p className="text-slate-600 mt-1 text-sm md:text-base">{t.returnToolSubtitle}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-4 md:mb-6">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder={t.searchEquipmentOrSoldier}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filters.platoon} onValueChange={(value) => setFilters({...filters, platoon: value})}>
                <SelectTrigger>
                  <SelectValue placeholder={t.allPlatoons} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allPlatoons}</SelectItem>
                  {getPlatoons().map(platoon => (
                    <SelectItem key={platoon} value={platoon}>{platoon}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.soldier} onValueChange={(value) => setFilters({...filters, soldier: value})}>
                <SelectTrigger>
                  <SelectValue placeholder={t.allSoldiers} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allSoldiers}</SelectItem>
                  {getIssuedSoldiers().map(soldier => (
                    <SelectItem key={soldier.id} value={soldier.soldier_id}>{soldier.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.condition} onValueChange={(value) => setFilters({...filters, condition: value})}>
                <SelectTrigger>
                  <SelectValue placeholder={t.allConditions} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allConditions}</SelectItem>
                  <SelectItem value="excellent">{t.excellent || 'Excellent'}</SelectItem>
                  <SelectItem value="good">{t.good || 'Good'}</SelectItem>
                  <SelectItem value="fair">{t.fair || 'Fair'}</SelectItem>
                  <SelectItem value="poor">{t.poor || 'Poor'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Selection Controls */}
        <Card className="mb-4 md:mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedItems.length === allIssuedItems.length && allIssuedItems.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="select-all" className="text-sm font-medium">
                    {t.selectAll} ({allIssuedItems.length} {t.items})
                  </label>
                </div>
                {selectedItems.length > 0 && (
                  <Badge variant="secondary">
                    {selectedItems.length} {t.selected}
                  </Badge>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                {selectedItems.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setSelectedItems([])}
                    className="w-full md:w-auto"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {t.clearSelection}
                  </Button>
                )}
                <Button
                  onClick={handleReturnEquipment}
                  disabled={selectedItems.length === 0 || isProcessing}
                  className="bg-green-600 hover:bg-green-700 w-full md:w-auto"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isProcessing ? t.processing : t.returnNItems(selectedItems.length || '')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equipment List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Package className="w-5 h-5" />
              {t.issuedEquipment} ({allIssuedItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allIssuedItems.map((item) => (
                <div
                  key={item.assignment.id}
                  className={`flex items-start gap-4 p-3 md:p-4 border rounded-lg transition-colors ${
                    selectedItems.includes(item.assignment.id) ? 'bg-blue-50 border-blue-300' : 'hover:bg-slate-50'
                  }`}
                >
                  <Checkbox
                    checked={selectedItems.includes(item.assignment.id)}
                    onCheckedChange={() => handleSelectItem(item.assignment.id)}
                    className="mt-1"
                  />

                  <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.type === 'inventory' ? (
                        <Layers className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
                    ) : (
                        <Package className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                      {item.type === 'serialized' && (
                        <code className="text-xs md:text-sm bg-slate-100 px-2 py-1 rounded font-mono font-semibold">
                          {item.itemDetails.serial_number}
                        </code>
                      )}
                      <h4 className="font-medium text-sm md:text-base truncate">{item.itemDetails.object_name}</h4>
                      {item.type === 'inventory' && (
                         <Badge variant="secondary">{item.assignment.quantity}x</Badge>
                      )}
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-xs md:text-sm text-slate-500">
                      <span className="truncate">{t.issuedTo}: {item.soldier?.full_name || item.assignment.soldier_name}</span>
                      <span>{t.platoon}: {item.soldier?.platoon}</span>
                      <span>{t.condition}: {item.itemDetails.condition || t.good}</span>
                    </div>

                    {item.assignment?.signature_data?.supplanting_items?.length > 0 && (
                      <div className="mt-2 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                        <div className="flex flex-wrap gap-1.5">
                          {item.assignment.signature_data.supplanting_items.map(suppItem => (
                            <Badge key={suppItem} variant="secondary" className="text-xs bg-slate-200 text-slate-700">
                              {suppItem}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs whitespace-nowrap self-center">
                    {t.issued}
                  </Badge>
                </div>
              ))}

              {allIssuedItems.length === 0 && !isLoading && (
                <div className="text-center py-8 md:py-12 text-slate-500">
                  <Package className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-lg font-medium">{t.noIssuedEquipmentFound}</p>
                  <p className="text-sm">{t.tryAdjustingFilters}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}