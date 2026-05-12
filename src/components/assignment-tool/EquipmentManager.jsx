import React, { useState, useEffect, useMemo } from "react";
import { Equipment, Soldier, Assignment, InventoryItem, SupplantingItem } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ArrowLeft,
  Plus,
  RotateCcw,
  Wrench,
  FileSignature,
  Search,
  X,
  Layers,
  AlertTriangle,
  PackagePlus
} from "lucide-react";

import DigitalSignature from "@/components/assignment-tool/DigitalSignature";
import SupplantingItemsInput from "@/components/assignment-tool/SupplantingItemsInput";
import { EmailService } from "../utils/EmailService";

export default function EquipmentManager({ soldier, equipment = [], inventoryItems = [], assignments = [], onUpdate, onComplete, onBack, t = {} }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [supplantingSearchTerm, setSupplantingSearchTerm] = useState("");
  const [showAddBySerial, setShowAddBySerial] = useState(false);
  const [newSerialNumber, setNewSerialNumber] = useState("");
  const [newObjectName, setNewObjectName] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [allAssignments, setAllAssignments] = useState([]);
  const [allSoldiers, setAllSoldiers] = useState([]);
  const [supplantingItems, setSupplantingItems] = useState([]);
  const [selectedSupplantingItems, setSelectedSupplantingItems] = useState({});
  const [inventoryQuantities, setInventoryQuantities] = useState({});

  useEffect(() => {
    loadAllAssignments();
    loadAllSoldiers();
    loadSupplantingItems();
  }, []);

  const loadAllAssignments = async () => {
    try {
      const allAssignmentData = await Assignment.list();
      setAllAssignments(allAssignmentData);
    } catch (error) {
      console.error("Error loading all assignments:", error);
    }
  };

  const loadAllSoldiers = async () => {
    try {
      const allSoldiersData = await Soldier.list();
      setAllSoldiers(allSoldiersData);
    } catch (error) {
      console.error("Error loading all soldiers:", error);
    }
  };

  const loadSupplantingItems = async () => {
    try {
      const supplantingData = await SupplantingItem.list();
      setSupplantingItems(supplantingData);
    } catch (error) {
      console.error("Error loading supplanting items:", error);
    }
  };

  const activeAssignments = useMemo(() => assignments.filter(a => a?.status === 'active' && a?.soldier_id === soldier?.soldier_id), [assignments, soldier]);

  const issuedToSoldier = useMemo(() => {
    const activeEquipmentIds = new Set(activeAssignments.filter(a => !a.assignment_type || a.assignment_type === 'serialized').map(a => a.equipment_id));
    return equipment.filter(e => e?.serial_number && activeEquipmentIds.has(e.serial_number));
  }, [equipment, activeAssignments]);

  const issuedInventory = useMemo(() => {
    return activeAssignments
      .filter(a => a?.assignment_type === 'inventory')
      .map(assignment => {
        const itemDetails = inventoryItems.find(item => item?.object_name === assignment?.equipment_id);
        return { ...assignment, ...itemDetails };
      })
      .filter(Boolean);
  }, [activeAssignments, inventoryItems]);

  const allIssuedItems = useMemo(() => {
    const serialized = issuedToSoldier.map(item => {
      const assignment = activeAssignments.find(a => a?.equipment_id === item?.serial_number && (!a.assignment_type || a.assignment_type === 'serialized'));
      return {
        ...item,
        assignment_type: 'serialized',
        assignment_id: assignment?.id,
        assignment_date: assignment?.assignment_date
      };
    });
    const inventory = issuedInventory.map(item => ({
      ...item,
      assignment_type: 'inventory',
      assignment_id: item?.id
    }));
    return [...serialized, ...inventory];
  }, [issuedToSoldier, issuedInventory, activeAssignments]);

  const soldierHistoricalEquipmentIds = useMemo(() => {
    if (!allAssignments.length || !soldier?.soldier_id) return [];
    const historicalIds = allAssignments
      .filter(a => a?.soldier_id === soldier.soldier_id && (!a.assignment_type || a.assignment_type === 'serialized'))
      .map(a => a?.equipment_id)
      .filter(Boolean);
    return [...new Set(historicalIds)];
  }, [allAssignments, soldier]);

  const suggestionsInStorage = useMemo(() => {
    if (!soldierHistoricalEquipmentIds.length) return [];
    // Only check if assignment_status is 'storage', ignore issued_soldier_id/issued_soldier_name
    return equipment.filter(e =>
      e?.serial_number &&
      soldierHistoricalEquipmentIds.includes(e.serial_number) &&
      e.assignment_status === 'storage'
    );
  }, [equipment, soldierHistoricalEquipmentIds]);

  const availableEquipment = useMemo(() => {
    const currentlyIssuedIds = new Set(allIssuedItems.map(item => item?.serial_number).filter(Boolean));
    const suggestedIds = new Set(suggestionsInStorage.map(item => item?.serial_number).filter(Boolean));

    return equipment.filter(e => {
      if (!e?.serial_number || !e?.object_name) return false;
      return !currentlyIssuedIds.has(e.serial_number) && !suggestedIds.has(e.serial_number);
    });
  }, [equipment, allIssuedItems, suggestionsInStorage]);

  const availableInventory = useMemo(() => {
    const pendingInventoryQuantities = pendingAssignments
      .filter(item => item?.assignment_type === 'inventory')
      .reduce((totals, item) => {
        totals[item.object_name] = (totals[item.object_name] || 0) + (item.quantity || 1);
        return totals;
      }, {});

    return inventoryItems
      .map(item => ({
        ...item,
        available_quantity: Math.max(0, (item.available_quantity || 0) - (pendingInventoryQuantities[item.object_name] || 0))
      }))
      .filter(item => {
        if (!item?.object_name) return false;
        const hasAvailableQuantity = (item.available_quantity || 0) > 0;
        return hasAvailableQuantity;
      });
  }, [inventoryItems, pendingAssignments]);

  const filteredPreviouslyUsedEquipment = useMemo(() => {
    return suggestionsInStorage.filter(item => {
      const matchesSearch = searchTerm === "" ||
        item.object_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serial_number.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [suggestionsInStorage, searchTerm]);

  const filteredOtherAvailableEquipment = useMemo(() => {
    return availableEquipment.filter(item => {
      const matchesSearch = searchTerm === "" ||
        item.object_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serial_number.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    }).sort((a, b) => (a.object_name || '').localeCompare(b.object_name || ''));
  }, [availableEquipment, searchTerm]);

  const filteredAvailableInventory = useMemo(() => {
    return availableInventory.filter(item => {
      const matchesSearch = searchTerm === "" ||
        item.object_name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    }).sort((a, b) => (a.object_name || '').localeCompare(b.object_name || ''));
  }, [availableInventory, searchTerm]);

  const handleStatusChange = async (equipmentItem, newStatus) => {
    setIsProcessing(true);
    try {
      const activeAssignment = activeAssignments.find(a => a?.equipment_id === equipmentItem?.serial_number && (!a.assignment_type || a.assignment_type === 'serialized'));
      if (activeAssignment && (newStatus === 'storage' || newStatus === 'repair')) {
        await Assignment.update(activeAssignment.id, {
          status: 'returned',
          return_date: new Date().toISOString().split('T')[0],
          condition_on_return: equipmentItem?.condition || 'good',
          notes: `Returned via Equipment Manager (${newStatus})`
        });
      }

      await Equipment.update(equipmentItem.id, {
        assignment_status: newStatus,
        issued_soldier_id: newStatus === 'storage' || newStatus === 'repair' ? null : equipmentItem.issued_soldier_id,
        issued_soldier_name: newStatus === 'storage' || newStatus === 'repair' ? null : equipmentItem.issued_soldier_name
      });

      // Refresh allAssignments so activeAssignments (derived from it) reflects the change immediately
      await loadAllAssignments();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error updating equipment status:", error);
    }
    setIsProcessing(false);
  };

  const handleReturnInventoryItem = async (inventoryItem, assignmentId) => {
    setIsProcessing(true);
    try {
      // Mark assignment as returned
      await Assignment.update(assignmentId, {
        status: 'returned',
        return_date: new Date().toISOString().split('T')[0],
        notes: 'Returned via Equipment Manager'
      });

      // Increase available quantity
      const invItem = inventoryItems.find(i => i.object_name === inventoryItem.object_name);
      if (invItem) {
        await InventoryItem.update(invItem.id, {
          available_quantity: (invItem.available_quantity || 0) + (inventoryItem.quantity || 1)
        });
      }

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error returning inventory item:", error);
    }
    setIsProcessing(false);
  };

  const handleAssignEquipment = async (equipmentItem) => {
    if (pendingAssignments.some(p => p.serial_number === equipmentItem.serial_number)) {
        alert(t.itemAlreadyPending || "This item is already pending assignment.");
        return;
    }

    if (!equipmentItem?.serial_number || !soldier?.soldier_id) return;

    setIsProcessing(true);
    try {
      let previousAssignmentToReturn = null;
      let previousSoldierToNotify = null;

      if (equipmentItem.assignment_status === 'issued') {
        const currentHolder = equipmentItem.issued_soldier_name || 'Unknown';
        const newHolder = soldier.full_name || 'Unknown';

        const confirmMessage = typeof t.warningItemIssued === 'function'
          ? t.warningItemIssued(currentHolder, newHolder)
          : `Warning: This item is currently issued to ${currentHolder}. Are you sure you want to issue it to ${newHolder}? This will automatically return the item from the previous holder.`;

        const confirmReissue = window.confirm(confirmMessage);
        if (!confirmReissue) {
          setIsProcessing(false);
          return;
        }

        const currentAssignment = allAssignments.find(a =>
          a?.equipment_id === equipmentItem.serial_number &&
          (!a.assignment_type || a.assignment_type === 'serialized') &&
          a?.status === 'active'
        );

        if (currentAssignment) {
          previousAssignmentToReturn = currentAssignment;
          previousSoldierToNotify = allSoldiers.find(s => s.soldier_id === currentAssignment.soldier_id);
        }
      }

      if (equipmentItem.assignment_status === 'repair') {
        const newHolder = soldier.full_name || 'Unknown';
        const confirmMessage = typeof t.warningItemRepair === 'function'
          ? t.warningItemRepair(newHolder)
          : `Warning: This item is in repair. Are you sure you want to issue it to ${newHolder}?`;

        const confirmFromRepair = window.confirm(confirmMessage);
        if (!confirmFromRepair) {
          setIsProcessing(false);
          return;
        }
      }

      const availableSupplanting = supplantingItems.filter(item => 
        item.equipment_name === equipmentItem.object_name
      );

      const equipmentWithSupplanting = { 
        ...equipmentItem, 
        assignment_type: 'serialized',
        availableSupplantingItems: availableSupplanting,
        previous_assignment: previousAssignmentToReturn,
        previous_soldier: previousSoldierToNotify
      };
      setPendingAssignments(prev => [...prev, equipmentWithSupplanting]);

      const defaultSupplanting = availableSupplanting.filter(item => item.is_default);
      if (defaultSupplanting.length > 0) {
        setSelectedSupplantingItems(prev => ({
          ...prev,
          [equipmentItem.serial_number]: defaultSupplanting.map(item => item.supplanting_item_name)
        }));
      }

    } catch (error) {
      console.error("Error processing equipment reassignment:", error);
      alert(t.errorProcessingReassignment || "Error processing reassignment. Please try again.");
    }
    setIsProcessing(false);
  };

  const handleSupplantingItemsChange = (equipmentSerial, newSelectedItems) => {
    setSelectedSupplantingItems(prev => ({
      ...prev,
      [equipmentSerial]: newSelectedItems
    }));
  };

  const handleAssignInventoryItem = (inventoryItem, quantity = 1) => {
    if (!inventoryItem?.object_name || !soldier?.soldier_id) return;

    const quantityToAdd = Math.max(1, Math.min(Number(quantity) || 1, inventoryItem.available_quantity || 0));
    if (quantityToAdd <= 0) return;

    setPendingAssignments(prev => {
      const existingPending = prev.find(p => p.assignment_type === 'inventory' && p.object_name === inventoryItem.object_name);
      if (existingPending) {
        return prev.map(item =>
          item.serial_number === existingPending.serial_number
            ? { ...item, quantity: (item.quantity || 0) + quantityToAdd }
            : item
        );
      }

      return [
        ...prev,
        {
          ...inventoryItem,
          assignment_type: 'inventory',
          quantity: quantityToAdd,
          serial_number: `INV-PENDING-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
        }
      ];
    });
  };

  const removePendingAssignment = (idToRemove) => {
    const removedItem = pendingAssignments.find(p => p.serial_number === idToRemove);
    setPendingAssignments(prev => prev.filter(p => p.serial_number !== idToRemove));
    if (removedItem?.serial_number) {
      setSelectedSupplantingItems(prev => {
        const newState = { ...prev };
        delete newState[removedItem.serial_number];
        return newState;
      });
    }
  };

  const handleGetSignature = () => {
    if (pendingAssignments.length === 0) {
      alert(t.issueEquipmentToSign || "Issue equipment to get a signature.");
      return;
    }
    setShowSignature(true);
  };

  const handleSignatureComplete = async (itemsToAssign, signatureData) => {
    setIsProcessing(true);
    try {
      // Reload active assignments to get latest data before checking for duplicates
      const freshAssignments = await Assignment.filter({ status: "active" });
      
      for (const item of itemsToAssign) {
        const equipmentId = item.assignment_type === 'inventory' ? item.object_name : item.serial_number;
        const todayDate = new Date().toISOString().split('T')[0];

        // Check for duplicate assignment created on the same day for same equipment/soldier
        const existingDuplicate = freshAssignments.find(a =>
          a.equipment_id === equipmentId &&
          a.soldier_id === soldier.soldier_id &&
          a.assignment_date === todayDate &&
          a.status === 'active'
        );

        if (existingDuplicate) {
          console.warn(`Duplicate assignment detected for ${equipmentId} to ${soldier.full_name}. Skipping.`);
          continue; // Skip this item to prevent duplicate
        }

        const assignmentData = {
          assignment_type: item.assignment_type || 'serialized',
          equipment_id: equipmentId,
          soldier_id: soldier.soldier_id,
          soldier_name: soldier.full_name,
          assignment_date: todayDate,
          status: "active",
          quantity: item.quantity || 1,
          condition_on_assignment: item.condition || "good",
          location_platoon: soldier.platoon,
          assigned_by: "System",
          signature_data: {
            ...signatureData,
            supplanting_items: selectedSupplantingItems[item.serial_number] || []
          }
        };

        await Assignment.create(assignmentData);

        if (item.previous_assignment?.id) {
          await Assignment.update(item.previous_assignment.id, {
            status: 'returned',
            return_date: new Date().toISOString().split('T')[0],
            condition_on_return: item.condition || 'good',
            notes: `Auto-returned due to reassignment to ${soldier.full_name} (${soldier.soldier_id})`
          });

          if (item.previous_soldier?.email && EmailService) {
            await EmailService.sendReturnEmail(item.previous_soldier, item, item.previous_assignment);
          }
        }

        if (item.assignment_type === 'inventory') {
          const invItem = inventoryItems.find(i => i.object_name === item.object_name);
          if (invItem) {
            await InventoryItem.update(invItem.id, {
              available_quantity: Math.max(0, (invItem.available_quantity || 0) - (item.quantity || 1))
            });
          }
        } else {
          await Equipment.update(item.id, {
            assignment_status: "issued",
            issued_soldier_id: soldier.soldier_id,
            issued_soldier_name: soldier.full_name,
            platoon: soldier.platoon,
            squad: soldier.squad
          });
        }
      }

      setPendingAssignments([]);
      setSelectedSupplantingItems({});
      setShowSignature(false);
      onUpdate();

      if (onComplete) {
        await onComplete(itemsToAssign, signatureData);
      }
    } catch (error) {
      console.error("Error completing assignments:", error);
      alert(t.errorCompletingAssignments || "Error completing assignments. Please try again.");
    }
    setIsProcessing(false);
  };

  const handleAddNewEquipment = async () => {
    if (!newSerialNumber.trim() || !newObjectName.trim()) {
      alert(t.enterSerialAndName || "Please enter both a serial number and equipment name.");
      return;
    }
    const exists = equipment.find(e => e.serial_number === newSerialNumber.trim());
    if (exists) {
      alert(t.serialAlreadyExists || "Equipment with this serial number already exists.");
      return;
    }
    setIsAddingNew(true);
    try {
      const createdName = newObjectName.trim();
      const newItem = await Equipment.create({
        serial_number: newSerialNumber.trim(),
        object_name: createdName,
        assignment_status: "storage",
        platoon: soldier.platoon || "",
        squad: soldier.squad || "",
      });
      setNewSerialNumber("");
      setNewObjectName("");
      setShowAddBySerial(false);
      onUpdate();
      // Add to pending after creation — use newItem.serial_number from DB response
      const availableSupplanting = supplantingItems.filter(item => item.equipment_name === createdName);
      setPendingAssignments(prev => [...prev, {
        ...newItem,
        serial_number: newItem.serial_number,
        object_name: newItem.object_name,
        assignment_type: 'serialized',
        assignment_status: 'storage',
        availableSupplantingItems: availableSupplanting
      }]);
    } catch (error) {
      console.error("Error creating equipment:", error);
      alert(t.errorCreatingEquipment || "Error creating equipment. Please try again.");
    }
    setIsAddingNew(false);
  };

  const handleBack = () => {
    if (pendingAssignments.length > 0) {
      const count = pendingAssignments.length;
      const confirmMessage = typeof t.confirmRevert === 'function'
        ? t.confirmRevert(count)
        : `You have ${count} unsigned assignments. Leaving this screen will revert the changes. Are you sure?`;

      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) return;
    }
    if (onBack) onBack();
  };

  if (!soldier) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-slate-500">
          <p>{t.noSoldierSelected || "No soldier selected"}</p>
        </CardContent>
      </Card>
    );
  }

  if (showSignature) {
    return (
      <DigitalSignature
        soldier={soldier}
        pendingAssignments={pendingAssignments.map(item => ({
          ...item,
          selectedSupplantingItems: selectedSupplantingItems[item.serial_number] || [],
        }))}
        supplantingItems={selectedSupplantingItems}
        onComplete={(signatureData) => handleSignatureComplete(pendingAssignments, signatureData)}
        onCancel={() => setShowSignature(false)}
        t={t}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {(t.issuedEquipmentTitle || "Issued Equipment for")} {soldier.full_name || "Unknown Soldier"}
          </h2>
        </div>
      </div>

      {/* Currently Issued Equipment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {t.currentlyIssued || "Currently Issued"} ({allIssuedItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-96 overflow-y-auto">
          {allIssuedItems.length === 0 ? (
            <p className="text-slate-500 text-center py-8">{t.noEquipmentIssued}</p>
          ) : (
            <div className="space-y-3">
              {allIssuedItems.map((item, index) => (
                <div key={item?.assignment_id || item?.serial_number || index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {item?.assignment_type === 'inventory' ? (
                      <Layers className="w-5 h-5 text-slate-500" />
                    ) : (
                      <Package className="w-5 h-5 text-slate-500" />
                    )}
                    <div>
                      <h4 className="font-medium">{item?.object_name || "Unknown Item"}</h4>
                      {item?.assignment_type === 'inventory' ? (
                        <p className="text-sm text-slate-500">
                          {t.quantity}: {item?.quantity || 0}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-500">
                          {t.serialNumber || "Serial"}: {item?.serial_number || "N/A"}
                        </p>
                      )}
                      {item?.assignment_date && (
                        <p className="text-xs text-slate-400">
                          {t.from || "From"}: {item.assignment_date}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item?.assignment_type === 'serialized' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(item, 'storage')}
                          disabled={isProcessing}
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          {t.returnToStorage || "Return"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(item, 'repair')}
                          disabled={isProcessing}
                        >
                          <Wrench className="w-4 h-4 mr-1" />
                          {t.sendForRepair || "Repair"}
                        </Button>
                      </>
                    )}
                    {item?.assignment_type === 'inventory' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReturnInventoryItem(item, item?.assignment_id)}
                        disabled={isProcessing}
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        {t.returnToStorage || "Return"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Assignments */}
      {pendingAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {t.pendingAssignments} ({pendingAssignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {pendingAssignments.map((item, index) => {
                const availableSupplanting = supplantingItems.filter(si => 
                  si.equipment_name === item.object_name
                );
                const selectedForThisItem = selectedSupplantingItems[item.serial_number] || [];

                return (
                  <div key={item?.serial_number || index} className="border-2 border-amber-300 rounded-lg bg-amber-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {item?.assignment_type === 'inventory' ? (
                          <Layers className="w-5 h-5 text-amber-600" />
                        ) : (
                          <Package className="w-5 h-5 text-amber-600" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            {item?.assignment_type === 'serialized' && (
                              <code className="text-xs bg-white px-2 py-1 rounded font-mono font-semibold">
                                {item.serial_number}
                              </code>
                            )}
                            <h4 className="font-semibold">{item.object_name}</h4>
                            {item?.assignment_type === 'inventory' && (
                              <Badge variant="secondary">{item.quantity}x</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePendingAssignment(item.serial_number || item.object_name)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Supplanting Items Section */}
                    {item?.assignment_type === 'serialized' && (
                      <SupplantingItemsInput
                        equipmentName={item.object_name}
                        availableItems={availableSupplanting}
                        selectedItems={selectedForThisItem}
                        onSelectionChange={(newItems) => handleSupplantingItemsChange(item.serial_number, newItems)}
                        placeholder="Search or add supplanting items..."
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center mt-6">
              <Button
                onClick={handleGetSignature}
                className="bg-green-600 hover:bg-green-700"
                disabled={isProcessing}
              >
                <FileSignature className="w-4 h-4 mr-2" />
                {isProcessing ? (t.processing || "Processing...") : (t.getSignatureAndComplete || "Get Signature & Complete")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Equipment & Inventory Search */}
      <Card>
        <CardHeader>
          <CardTitle>{t.issueNewOrReissue || "Issue New or Re-issue"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder={(t.searchAllOtherEquipment || "Search all available items...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-96 overflow-y-auto border rounded-lg">
              <div className="space-y-2 p-2">
                {/* Previously Used Equipment */}
                {filteredPreviouslyUsedEquipment.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-700 mb-2 px-2">{t.previouslyUsedEquipment || "Previously Used Equipment"}</h4>
                    {filteredPreviouslyUsedEquipment.map((item, index) => (
                      <div key={item?.id || item?.serial_number || index} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium">{item?.object_name || "Unknown Item"}</h4>
                            <p className="text-sm text-slate-500">{t.serialNumber || "Serial"}: {item?.serial_number || "N/A"}</p>
                            <p className="text-xs text-blue-600">
                              {typeof t.previouslyAssignedTo === 'function'
                                ? t.previouslyAssignedTo(soldier.full_name || "Unknown")
                                : `This equipment was previously assigned to ${soldier.full_name || "Unknown"} and is now in storage.`
                              }
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleAssignEquipment(item)}
                          disabled={isProcessing}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          {t.reIssue || "Re-issue"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Other Available Equipment */}
                {filteredOtherAvailableEquipment.length > 0 && (
                  <div>
                    {filteredPreviouslyUsedEquipment.length > 0 && <div className="h-4" />}
                    <h4 className="font-medium text-slate-700 mb-2 px-2">{t.otherAvailableEquipment}</h4>
                    {filteredOtherAvailableEquipment.map((item, index) => (
                      <div key={item?.id || item?.serial_number || index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-slate-500" />
                          <div>
                            <h4 className="font-medium">{item?.object_name || "Unknown Item"}</h4>
                            <p className="text-sm text-slate-500">{t.serialNumber || "Serial"}: {item?.serial_number || "N/A"}</p>
                            {item?.assignment_status === 'issued' && (
                              <p className="text-xs text-orange-600">
                                {t.currentlyIssuedTo}: {item?.issued_soldier_name || "Unknown"}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleAssignEquipment(item)}
                          disabled={isProcessing}
                          variant={item?.assignment_status === 'issued' ? 'destructive' : 'default'}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          {t.issue || "Issue"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Available Inventory Items */}
                {filteredAvailableInventory.length > 0 && (
                  <div>
                    {(filteredOtherAvailableEquipment.length > 0 || filteredPreviouslyUsedEquipment.length > 0) && <div className="h-4" />}
                    <h4 className="font-medium text-slate-700 mb-2 px-2">{t.availableInventory}</h4>
                    {filteredAvailableInventory.map((item, index) => (
                      <div key={item?.id || item?.object_name || index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <Layers className="w-5 h-5 text-slate-500" />
                          <div>
                            <h4 className="font-medium">{item?.object_name || "Unknown Item"}</h4>
                            <p className="text-sm text-slate-500">
                              {t.available}: {item?.available_quantity || 0} / {item?.total_quantity || 0}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            max={item?.available_quantity || 1}
                            value={inventoryQuantities[item.object_name] || 1}
                            onChange={(e) => setInventoryQuantities(prev => ({
                              ...prev,
                              [item.object_name]: Math.max(1, Math.min(Number(e.target.value) || 1, item?.available_quantity || 1))
                            }))}
                            className="w-20"
                          />
                          <Button
                            onClick={() => handleAssignInventoryItem(item, inventoryQuantities[item.object_name] || 1)}
                            disabled={isProcessing || (item?.available_quantity || 0) <= 0}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            {t.issue || "Issue"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No Equipment Available */}
                {filteredPreviouslyUsedEquipment.length === 0 &&
                  filteredOtherAvailableEquipment.length === 0 &&
                  filteredAvailableInventory.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>{searchTerm ? (t.noOtherEquipmentMatch || "No items match your search.") : (t.noOtherEquipmentAvailable || "No other items available to issue.")}</p>
                    </div>
                  )}
              </div>
            </div>

            {/* Add Missing Equipment by Serial */}
            <div className="mt-4 border-t pt-4">
              {!showAddBySerial ? (
                <Button variant="outline" className="w-full" onClick={() => setShowAddBySerial(true)}>
                  <PackagePlus className="w-4 h-4 mr-2" />
                  {t.addMissingEquipmentBySerial || "Add Missing Equipment by Serial Number"}
                </Button>
              ) : (
                <div className="space-y-3 p-4 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
                  <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                    <PackagePlus className="w-4 h-4" />
                    {t.addNewEquipmentLabel || "Add New Equipment"}
                  </h4>
                  <Input
                    placeholder={t.serialNumberPlaceholder || "Serial Number *"}
                    value={newSerialNumber}
                    onChange={(e) => setNewSerialNumber(e.target.value)}
                  />
                  <Input
                    placeholder={t.equipmentNamePlaceholder || "Equipment Name *"}
                    value={newObjectName}
                    onChange={(e) => setNewObjectName(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddNewEquipment}
                      disabled={isAddingNew || !newSerialNumber.trim() || !newObjectName.trim()}
                      className="flex-1"
                    >
                      {isAddingNew ? (t.addingEquipment || "Adding...") : (t.addAndIssue || "Add & Issue")}
                    </Button>
                    <Button variant="outline" onClick={() => { setShowAddBySerial(false); setNewSerialNumber(""); setNewObjectName(""); }}>
                      {t.cancel || "Cancel"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}