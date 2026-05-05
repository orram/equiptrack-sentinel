import React, { useState } from "react";
import { Equipment, Assignment, Soldier } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, DatabaseZap, AlertCircle, Trash2, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function DataHealth() {
    const navigate = useNavigate();
    const [migrationStatus, setMigrationStatus] = useState('idle'); // idle, processing, complete, error
    const [migrationResults, setMigrationResults] = useState({ scanned: 0, updated: 0, errors: 0 });
    const [duplicateStatus, setDuplicateStatus] = useState('idle'); // idle, scanning, complete
    const [duplicates, setDuplicates] = useState([]);
    const [sameSoldierDuplicates, setSameSoldierDuplicates] = useState([]);
    const [selectedDuplicate, setSelectedDuplicate] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [assignmentToDelete, setAssignmentToDelete] = useState(null);
    const [bulkRemoving, setBulkRemoving] = useState(false);
    const [selectedForRemoval, setSelectedForRemoval] = useState(new Set());
    const [conflictStatus, setConflictStatus] = useState('idle'); // idle, scanning, complete
    const [conflicts, setConflicts] = useState([]);
    const [todayWeaponStatus, setTodayWeaponStatus] = useState('idle'); // idle, scanning, complete
    const [todayWeaponConflicts, setTodayWeaponConflicts] = useState([]);
    const [selectedWeapons, setSelectedWeapons] = useState(new Set());
    const [assigningWeapons, setAssigningWeapons] = useState(false);
    const [weekWeaponStatus, setWeekWeaponStatus] = useState('idle'); // idle, scanning, complete
    const [weekWeaponConflicts, setWeekWeaponConflicts] = useState([]);
    const [selectedWeekWeapons, setSelectedWeekWeapons] = useState(new Set());
    const [assigningWeekWeapons, setAssigningWeekWeapons] = useState(false);

    const scanForLastWeekWeaponConflicts = async () => {
        setWeekWeaponStatus('scanning');
        setWeekWeaponConflicts([]);
        try {
            const allEquipment = await Equipment.list();
            const allAssignments = await Assignment.list();
            const allSoldiers = await Soldier.list();
            const today = new Date();
            const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            const todayDateStr = today.toISOString().split('T')[0];
            const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

            // Find all soldiers assigned equipment in the last 7 days
            const soldiersAssignedLastWeek = new Set(
                allAssignments
                    .filter(a => 
                        a.assignment_date >= sevenDaysAgoStr && 
                        a.assignment_date <= todayDateStr && 
                        a.status === 'active'
                    )
                    .map(a => a.soldier_id)
            );

            const foundConflicts = [];

            // For each soldier assigned in last week, find their OTHER equipment that is in storage but has active assignments
            soldiersAssignedLastWeek.forEach(soldierId => {
                const soldier = allSoldiers.find(s => s.soldier_id === soldierId);
                
                // Get all active assignments for this soldier from last week
                const weekSoldierAssignments = allAssignments.filter(a => 
                    a.soldier_id === soldierId && 
                    a.assignment_date >= sevenDaysAgoStr && 
                    a.assignment_date <= todayDateStr &&
                    a.status === 'active' &&
                    (!a.assignment_type || a.assignment_type === 'serialized')
                );

                // Check each assignment to see if equipment is in storage
                weekSoldierAssignments.forEach(assignment => {
                    const equipment = allEquipment.find(e => e.serial_number === assignment.equipment_id);
                    
                    if (equipment && equipment.assignment_status === 'storage') {
                        foundConflicts.push({
                            equipmentId: equipment.serial_number,
                            equipmentName: equipment.object_name,
                            soldierId: soldierId,
                            soldierName: assignment.soldier_name,
                            platoon: soldier?.platoon || 'N/A',
                            squad: soldier?.squad || 'N/A',
                            rank: soldier?.rank || 'N/A',
                            equipmentDbId: equipment.id,
                            assignmentId: assignment.id,
                            assignmentDate: assignment.assignment_date
                        });
                    }
                });
            });

            setWeekWeaponConflicts(foundConflicts);
            setWeekWeaponStatus('complete');
        } catch (error) {
            console.error("Error scanning for last week's weapon conflicts:", error);
            setWeekWeaponStatus('error');
        }
    };

    const scanForTodayWeaponConflicts = async () => {
        setTodayWeaponStatus('scanning');
        setTodayWeaponConflicts([]);
        try {
            const allEquipment = await Equipment.list();
            const allAssignments = await Assignment.list();
            const allSoldiers = await Soldier.list();
            const today = new Date().toISOString().split('T')[0];
            
            // Find all soldiers assigned equipment today
            const soldiersAssignedToday = new Set(
                allAssignments
                    .filter(a => a.assignment_date === today && a.status === 'active')
                    .map(a => a.soldier_id)
            );
            
            const foundConflicts = [];
            
            // For each soldier assigned today, find their OTHER equipment that is in storage but has active assignments
            soldiersAssignedToday.forEach(soldierId => {
                const soldier = allSoldiers.find(s => s.soldier_id === soldierId);
                
                // Get all active assignments for this soldier
                const allSoldierAssignments = allAssignments.filter(a => 
                    a.soldier_id === soldierId && 
                    a.status === 'active' &&
                    (!a.assignment_type || a.assignment_type === 'serialized')
                );
                
                // Check each assignment to see if equipment is in storage
                allSoldierAssignments.forEach(assignment => {
                    const equipment = allEquipment.find(e => e.serial_number === assignment.equipment_id);
                    
                    if (equipment && equipment.assignment_status === 'storage') {
                        foundConflicts.push({
                            equipmentId: equipment.serial_number,
                            equipmentName: equipment.object_name,
                            soldierId: soldierId,
                            soldierName: assignment.soldier_name,
                            platoon: soldier?.platoon || 'N/A',
                            squad: soldier?.squad || 'N/A',
                            rank: soldier?.rank || 'N/A',
                            equipmentDbId: equipment.id,
                            assignmentId: assignment.id,
                            assignmentDate: assignment.assignment_date
                        });
                    }
                });
            });
            
            setTodayWeaponConflicts(foundConflicts);
            setTodayWeaponStatus('complete');
        } catch (error) {
            console.error("Error scanning for today's weapon conflicts:", error);
            setTodayWeaponStatus('error');
        }
    };

    const toggleWeaponSelection = (equipmentId) => {
        const newSelected = new Set(selectedWeapons);
        if (newSelected.has(equipmentId)) {
            newSelected.delete(equipmentId);
        } else {
            newSelected.add(equipmentId);
        }
        setSelectedWeapons(newSelected);
    };

    const toggleWeekWeaponSelection = (equipmentId) => {
        const newSelected = new Set(selectedWeekWeapons);
        if (newSelected.has(equipmentId)) {
            newSelected.delete(equipmentId);
        } else {
            newSelected.add(equipmentId);
        }
        setSelectedWeekWeapons(newSelected);
    };

    const bulkAssignWeapons = async () => {
        if (selectedWeapons.size === 0) return;
        if (!confirm(`This will mark ${selectedWeapons.size} weapon(s) as issued to their assigned soldiers and move from storage to issued. Continue?`)) {
            return;
        }

        setAssigningWeapons(true);
        let updated = 0;
        try {
            for (const equipmentId of selectedWeapons) {
                const conflict = todayWeaponConflicts.find(c => c.equipmentId === equipmentId);
                if (conflict) {
                    await Equipment.update(conflict.equipmentDbId, {
                        assignment_status: 'issued',
                        issued_soldier_id: conflict.soldierId,
                        issued_soldier_name: conflict.soldierName
                    });
                    updated++;
                }
            }
            alert(`Successfully updated ${updated} weapon(s) to issued status.`);
            setSelectedWeapons(new Set());
            await scanForTodayWeaponConflicts();
        } catch (error) {
            console.error("Error bulk assigning weapons:", error);
            alert(`Updated ${updated} weapon(s) before error. Check console.`);
            await scanForTodayWeaponConflicts();
        } finally {
            setAssigningWeapons(false);
        }
    };

    const bulkAssignWeekWeapons = async () => {
        if (selectedWeekWeapons.size === 0) return;
        if (!confirm(`This will mark ${selectedWeekWeapons.size} weapon(s) from last week as issued to their assigned soldiers and move from storage to issued. Continue?`)) {
            return;
        }

        setAssigningWeekWeapons(true);
        let updated = 0;
        try {
            for (const equipmentId of selectedWeekWeapons) {
                const conflict = weekWeaponConflicts.find(c => c.equipmentId === equipmentId);
                if (conflict) {
                    await Equipment.update(conflict.equipmentDbId, {
                        assignment_status: 'issued',
                        issued_soldier_id: conflict.soldierId,
                        issued_soldier_name: conflict.soldierName
                    });
                    updated++;
                }
            }
            alert(`Successfully updated ${updated} weapon(s) from last week to issued status.`);
            setSelectedWeekWeapons(new Set());
            await scanForLastWeekWeaponConflicts();
        } catch (error) {
            console.error("Error bulk assigning last week weapons:", error);
            alert(`Updated ${updated} weapon(s) before error. Check console.`);
            await scanForLastWeekWeaponConflicts();
        } finally {
            setAssigningWeekWeapons(false);
        }
    };

    const scanForConflicts = async () => {
        setConflictStatus('scanning');
        setConflicts([]);
        try {
            const allEquipment = await Equipment.list();
            const activeAssignments = await Assignment.filter({ status: "active" });
            
            const foundConflicts = [];
            allEquipment.forEach(item => {
                // Check if equipment is marked as 'storage' but has an active assignment
                if (item.assignment_status === 'storage') {
                    const activeAssignment = activeAssignments.find(a => 
                        a.equipment_id === item.serial_number &&
                        (!a.assignment_type || a.assignment_type === 'serialized')
                    );
                    if (activeAssignment) {
                        foundConflicts.push({
                            equipmentId: item.serial_number,
                            equipmentName: item.object_name,
                            markedAs: 'storage',
                            activeSoldier: activeAssignment.soldier_name,
                            activeSoldierId: activeAssignment.soldier_id,
                            assignmentId: activeAssignment.id,
                            equipmentId: item.id
                        });
                    }
                }
            });
            
            setConflicts(foundConflicts);
            setConflictStatus('complete');
        } catch (error) {
            console.error("Error scanning for conflicts:", error);
            setConflictStatus('error');
        }
    };

    const scanForDuplicates = async () => {
        setDuplicateStatus('scanning');
        setDuplicates([]);
        setSameSoldierDuplicates([]);
        try {
            const allAssignments = await Assignment.list();
            // Only check serialized equipment for duplicates, skip inventory items
            const serializedAssignments = allAssignments.filter(a => !a.assignment_type || a.assignment_type === 'serialized');
            const equipmentMap = {};

            // Group assignments by equipment_id (only serialized)
            serializedAssignments.forEach(assignment => {
                if (!equipmentMap[assignment.equipment_id]) {
                    equipmentMap[assignment.equipment_id] = [];
                }
                equipmentMap[assignment.equipment_id].push(assignment);
            });

            // Find equipment with multiple active assignments
            const foundDuplicates = Object.entries(equipmentMap)
                .filter(([_, assignments]) => assignments.length > 1)
                .map(([equipmentId, assignments]) => ({
                    equipmentId,
                    count: assignments.length,
                    assignments: assignments.sort((a, b) => new Date(b.assignment_date) - new Date(a.assignment_date))
                }));

            // Find duplicates where same soldier has multiple assignments (active or returned) on same day
            const sameSoldierDups = [];
            foundDuplicates.forEach(dup => {
                const groupedBySoldierDate = {};
                dup.assignments.forEach(assignment => {
                    const key = `${assignment.soldier_id}|${assignment.assignment_date}`;
                    if (!groupedBySoldierDate[key]) {
                        groupedBySoldierDate[key] = [];
                    }
                    groupedBySoldierDate[key].push(assignment);
                });

                // Find groups with more than one assignment (active or returned)
                Object.entries(groupedBySoldierDate).forEach(([key, assignments]) => {
                    if (assignments.length > 1) {
                        sameSoldierDups.push({
                            equipmentId: dup.equipmentId,
                            soldierName: assignments[0].soldier_name,
                            soldierId: assignments[0].soldier_id,
                            assignmentDate: assignments[0].assignment_date,
                            assignments: assignments.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
                        });
                    }
                });
            });

            setDuplicates(foundDuplicates);
            setSameSoldierDuplicates(sameSoldierDups);
            setDuplicateStatus('complete');
        } catch (error) {
            console.error("Error scanning for duplicates:", error);
            setDuplicateStatus('error');
        }
    };

    const handleDeleteAssignment = async () => {
        if (!assignmentToDelete) return;
        try {
            await Assignment.update(assignmentToDelete.id, { status: 'returned' });
            setDeleteDialogOpen(false);
            setAssignmentToDelete(null);
            await scanForDuplicates();
        } catch (error) {
            console.error("Error deleting assignment:", error);
            alert("Failed to mark assignment as returned. Please try again.");
        }
    };

    const handleBulkRemoveSameSoldier = async () => {
        if (sameSoldierDuplicates.length === 0) return;
        if (!confirm(`This will remove ${sameSoldierDuplicates.reduce((sum, dup) => sum + (dup.assignments.length - 1), 0)} duplicate assignments (keeping the latest for each). Continue?`)) {
            return;
        }

        setBulkRemoving(true);
        let removed = 0;
        try {
            for (const dup of sameSoldierDuplicates) {
                // Keep the latest (first) assignment, remove the rest
                for (let i = 1; i < dup.assignments.length; i++) {
                    await Assignment.update(dup.assignments[i].id, { status: 'returned' });
                    removed++;
                }
            }
            alert(`Successfully removed ${removed} duplicate assignment(s).`);
            setSelectedForRemoval(new Set());
            await scanForDuplicates();
        } catch (error) {
            console.error("Error bulk removing assignments:", error);
            alert(`Removed ${removed} duplicate(s) before error. Check console.`);
            await scanForDuplicates();
        } finally {
            setBulkRemoving(false);
        }
    };

    const handleRemoveSelected = async () => {
        if (selectedForRemoval.size === 0) return;
        if (!confirm(`Remove ${selectedForRemoval.size} selected duplicate(s)?`)) {
            return;
        }

        setBulkRemoving(true);
        let removed = 0;
        try {
            for (const assignmentId of selectedForRemoval) {
                await Assignment.update(assignmentId, { status: 'returned' });
                removed++;
            }
            alert(`Successfully removed ${removed} duplicate assignment(s).`);
            setSelectedForRemoval(new Set());
            await scanForDuplicates();
        } catch (error) {
            console.error("Error removing selected assignments:", error);
            alert(`Removed ${removed} duplicate(s) before error. Check console.`);
            await scanForDuplicates();
        } finally {
            setBulkRemoving(false);
        }
    };

    const toggleSelectAssignment = (assignmentId) => {
        const newSelected = new Set(selectedForRemoval);
        if (newSelected.has(assignmentId)) {
            newSelected.delete(assignmentId);
        } else {
            newSelected.add(assignmentId);
        }
        setSelectedForRemoval(newSelected);
    };

    const runEquipmentMigration = async () => {
        setMigrationStatus('processing');
        const results = { scanned: 0, updated: 0, errors: 0 };
        if (!confirm("This is a one-time process to update old equipment data fields to the new format ('assigned' -> 'issued'). This should only be run once. Are you sure you want to proceed?")) {
            setMigrationStatus('idle');
            return;
        }

        try {
            const allEquipment = await Equipment.list();
            results.scanned = allEquipment.length;

            for (const item of allEquipment) {
                let needsUpdate = false;
                const updatePayload = {};

                // Check for old status 'assigned' and migrate to 'issued'
                if (item.assignment_status === 'assigned') {
                    updatePayload.assignment_status = 'issued';
                    needsUpdate = true;
                }

                // Check for old field 'assigned_soldier_id' and migrate data
                if (item.assigned_soldier_id) {
                    updatePayload.issued_soldier_id = item.issued_soldier_id || item.assigned_soldier_id;
                    updatePayload.issued_soldier_name = item.issued_soldier_name || item.assigned_soldier_name;
                    updatePayload.assigned_soldier_id = null;
                    updatePayload.assigned_soldier_name = null;
                    needsUpdate = true;
                }

                if (needsUpdate) {
                    try {
                        await Equipment.update(item.id, updatePayload);
                        results.updated++;
                    } catch (e) {
                        console.error(`Failed to update item ${item.id}:`, e);
                        results.errors++;
                    }
                }
            }
            setMigrationResults(results);
            setMigrationStatus('complete');
        } catch (error) {
            console.error("Migration failed:", error);
            setMigrationStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="p-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("Dashboard"))}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Data Health & Tools</h1>
                        <p className="text-slate-600 mt-1">Run maintenance and migration tasks.</p>
                    </div>
                </div>

                {/* Last Week's Weapon Conflict Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <AlertCircle className="w-5 h-5 text-purple-600"/>
                           Last Week Weapon Assignment Sync
                        </CardTitle>
                        <CardDescription>Find soldiers assigned equipment in the last 7 days with weapons still in storage, and bulk issue those weapons.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {weekWeaponStatus === 'idle' && (
                            <Button onClick={scanForLastWeekWeaponConflicts} variant="outline">Scan Last Week's Assignments</Button>
                        )}
                        {weekWeaponStatus === 'scanning' && (
                           <p className="text-slate-600">Scanning... Please wait.</p>
                        )}
                        {weekWeaponStatus === 'complete' && (
                             <div className="space-y-4">
                                 {weekWeaponConflicts.length === 0 ? (
                                     <p className="text-green-600 font-semibold">✓ No conflicts found!</p>
                                 ) : (
                                     <div>
                                        <p className="text-purple-600 font-semibold mb-4">{weekWeaponConflicts.length} weapon(s) assigned in last 7 days but still marked as storage:</p>
                                        <div className="space-y-2 mb-4 border rounded-lg p-3 bg-purple-50">
                                            {weekWeaponConflicts.map((conflict) => (
                                                <div key={conflict.equipmentId} className="flex items-center gap-3 bg-white p-3 rounded border">
                                                    <Checkbox
                                                        checked={selectedWeekWeapons.has(conflict.equipmentId)}
                                                        onCheckedChange={() => toggleWeekWeaponSelection(conflict.equipmentId)}
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium"><strong>{conflict.equipmentId}</strong> ({conflict.equipmentName})</p>
                                                        <p className="text-xs text-slate-500">→ {conflict.soldierName} ({conflict.soldierId}) | {conflict.rank} | {conflict.platoon} / {conflict.squad}</p>
                                                        <p className="text-xs text-slate-400">Assigned: {conflict.assignmentDate}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {selectedWeekWeapons.size > 0 && (
                                            <Button 
                                                onClick={bulkAssignWeekWeapons} 
                                                disabled={assigningWeekWeapons}
                                                className="bg-purple-600 hover:bg-purple-700 w-full"
                                            >
                                                {assigningWeekWeapons ? 'Updating...' : `Assign Selected ${selectedWeekWeapons.size} Weapon(s)`}
                                            </Button>
                                        )}
                                     </div>
                                 )}
                            </div>
                        )}
                        {weekWeaponStatus === 'error' && (
                           <p className="font-semibold text-red-600">An error occurred while scanning. Check the console for details.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Today's Weapon Conflict Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <AlertCircle className="w-5 h-5 text-blue-600"/>
                           Today's Weapon Assignment Sync
                        </CardTitle>
                        <CardDescription>Find soldiers assigned equipment today with weapons still in storage, and bulk issue those weapons.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {todayWeaponStatus === 'idle' && (
                            <Button onClick={scanForTodayWeaponConflicts} variant="outline">Scan Today's Assignments</Button>
                        )}
                        {todayWeaponStatus === 'scanning' && (
                           <p className="text-slate-600">Scanning... Please wait.</p>
                        )}
                        {todayWeaponStatus === 'complete' && (
                             <div className="space-y-4">
                                 {todayWeaponConflicts.length === 0 ? (
                                     <p className="text-green-600 font-semibold">✓ No conflicts found!</p>
                                 ) : (
                                     <div>
                                        <p className="text-blue-600 font-semibold mb-4">{todayWeaponConflicts.length} weapon(s) assigned today but still marked as storage:</p>
                                        <div className="space-y-2 mb-4 border rounded-lg p-3 bg-blue-50">
                                            {todayWeaponConflicts.map((conflict) => (
                                                <div key={conflict.equipmentId} className="flex items-center gap-3 bg-white p-3 rounded border">
                                                    <Checkbox
                                                        checked={selectedWeapons.has(conflict.equipmentId)}
                                                        onCheckedChange={() => toggleWeaponSelection(conflict.equipmentId)}
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium"><strong>{conflict.equipmentId}</strong> ({conflict.equipmentName})</p>
                                                        <p className="text-xs text-slate-500">→ {conflict.soldierName} ({conflict.soldierId}) | {conflict.rank} | {conflict.platoon} / {conflict.squad}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {selectedWeapons.size > 0 && (
                                            <Button 
                                                onClick={bulkAssignWeapons} 
                                                disabled={assigningWeapons}
                                                className="bg-blue-600 hover:bg-blue-700 w-full"
                                            >
                                                {assigningWeapons ? 'Updating...' : `Assign Selected ${selectedWeapons.size} Weapon(s)`}
                                            </Button>
                                        )}
                                     </div>
                                 )}
                            </div>
                        )}
                        {todayWeaponStatus === 'error' && (
                           <p className="font-semibold text-red-600">An error occurred while scanning. Check the console for details.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Conflict Detection Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <AlertCircle className="w-5 h-5 text-orange-600"/>
                           Storage vs Active Conflict Detection
                        </CardTitle>
                        <CardDescription>Find equipment marked as "storage" but assigned to active soldiers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {conflictStatus === 'idle' && (
                            <Button onClick={scanForConflicts} variant="outline">Scan for Conflicts</Button>
                        )}
                        {conflictStatus === 'scanning' && (
                           <p className="text-slate-600">Scanning... Please wait.</p>
                        )}
                        {conflictStatus === 'complete' && (
                             <div className="space-y-4">
                                 {conflicts.length === 0 ? (
                                     <p className="text-green-600 font-semibold">✓ No conflicts found!</p>
                                 ) : (
                                     <div>
                                        <p className="text-orange-600 font-semibold mb-4">{conflicts.length} item(s) marked as storage but actively assigned:</p>
                                        <div className="space-y-3">
                                            {conflicts.map((conflict) => (
                                                <div key={conflict.equipmentId} className="border rounded-lg p-4 bg-orange-50">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-semibold text-slate-900">{conflict.equipmentId}</p>
                                                            <p className="text-sm text-slate-600">{conflict.equipmentName}</p>
                                                            <p className="text-sm text-orange-600 mt-2">Assigned to: {conflict.activeSoldier} ({conflict.activeSoldierId})</p>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setAssignmentToDelete({...conflict, status: 'active'});
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            Mark as Returned
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Button onClick={scanForConflicts} variant="outline" className="mt-4">Rescan</Button>
                                     </div>
                                 )}
                            </div>
                        )}
                        {conflictStatus === 'error' && (
                           <p className="font-semibold text-red-600">An error occurred while scanning. Check the console for details.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Duplicate Detection Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <AlertCircle className="w-5 h-5 text-red-600"/>
                           Duplicate Assignment Detection
                        </CardTitle>
                        <CardDescription>Scan for equipment assigned to multiple soldiers simultaneously.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {duplicateStatus === 'idle' && (
                            <Button onClick={scanForDuplicates} variant="destructive">Scan for Duplicates</Button>
                        )}
                        {duplicateStatus === 'scanning' && (
                           <p className="text-slate-600">Scanning... Please wait.</p>
                        )}
                        {duplicateStatus === 'complete' && (
                             <div className="space-y-4">
                                 {duplicates.length === 0 ? (
                                     <p className="text-green-600 font-semibold">✓ No duplicates found!</p>
                                 ) : (
                                     <div>
                                         {sameSoldierDuplicates.length > 0 && (
                                             <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4">
                                                 <p className="font-semibold text-yellow-800 mb-3">
                                                     Found {sameSoldierDuplicates.length} case(s) with same soldier assigned on same day:
                                                 </p>
                                                 <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                                                     {sameSoldierDuplicates.map((dup, idx) => (
                                                         <div key={idx} className="bg-white p-2 rounded text-sm">
                                                             <p><strong>{dup.equipmentId}</strong> → {dup.soldierName} ({dup.soldierId}) on {new Date(dup.assignmentDate).toLocaleDateString()} ({dup.assignments.length} copies)</p>
                                                         </div>
                                                     ))}
                                                 </div>
                                                 <Button onClick={handleBulkRemoveSameSoldier} disabled={bulkRemoving} className="bg-yellow-600 hover:bg-yellow-700">
                                                     {bulkRemoving ? 'Removing...' : `Bulk Remove (${sameSoldierDuplicates.reduce((sum, dup) => sum + (dup.assignments.length - 1), 0)} items)`}
                                                 </Button>
                                             </div>
                                         )}
                                         <div>
                                        <p className="text-red-600 font-semibold mb-4">{duplicates.length} equipment item(s) with duplicate assignments:</p>
                                        <div className="space-y-3">
                                            {duplicates.map((dup) => (
                                                <div key={dup.equipmentId} className="border rounded-lg p-4 bg-red-50">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <p className="font-semibold text-slate-900">{dup.equipmentId}</p>
                                                            <Badge className="bg-red-600 mt-1">{dup.count} active assignments</Badge>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setSelectedDuplicate(selectedDuplicate === dup.equipmentId ? null : dup.equipmentId)}
                                                        >
                                                            {selectedDuplicate === dup.equipmentId ? 'Hide' : 'Show'} Details
                                                        </Button>
                                                    </div>
                                                    
                                                    {selectedDuplicate === dup.equipmentId && (
                                                        <div className="space-y-2 pt-3 border-t">
                                                            {dup.assignments.map((assignment, idx) => (
                                                                <div key={assignment.id} className="flex justify-between items-center bg-white p-3 rounded border">
                                                                    <div className="flex items-center gap-3 flex-1">
                                                                        {idx !== 0 && (
                                                                            <Checkbox
                                                                                checked={selectedForRemoval.has(assignment.id)}
                                                                                onCheckedChange={() => toggleSelectAssignment(assignment.id)}
                                                                            />
                                                                        )}
                                                                        <div className={idx === 0 ? 'opacity-60' : ''}>
                                                                            <p className="text-sm font-medium">{idx === 0 ? '(Latest) ' : ''}{assignment.soldier_name} ({assignment.soldier_id})</p>
                                                                            <p className="text-xs text-slate-500">Assigned: {new Date(assignment.assignment_date).toLocaleDateString()}</p>
                                                                        </div>
                                                                    </div>
                                                                    {idx !== 0 && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            onClick={() => {
                                                                                setAssignmentToDelete(assignment);
                                                                                setDeleteDialogOpen(true);
                                                                            }}
                                                                        >
                                                                            <Trash2 className="w-3 h-3 mr-1" />
                                                                            Remove
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                         {selectedForRemoval.size > 0 && (
                                             <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-300">
                                                 <p className="text-sm font-medium text-blue-800 mb-3">{selectedForRemoval.size} duplicate(s) selected for removal</p>
                                                 <Button onClick={handleRemoveSelected} disabled={bulkRemoving} className="w-full bg-red-600 hover:bg-red-700">
                                                     <Trash2 className="w-4 h-4 mr-2" />
                                                     {bulkRemoving ? 'Removing...' : 'Remove Selected'}
                                                 </Button>
                                             </div>
                                         )}
                                         </div>
                                         <Button onClick={scanForDuplicates} variant="outline" className="mt-4">Rescan</Button>
                                        </div>
                                        )}
                                        </div>
                                        )}
                        {duplicateStatus === 'error' && (
                           <p className="font-semibold text-red-600">An error occurred while scanning. Check the console for details.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Migration Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <DatabaseZap className="w-5 h-5"/>
                           One-Time Data Migration
                        </CardTitle>
                        <CardDescription>Update equipment data from 'assigned' to 'issued' status and fields. Run this only once after an update.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {migrationStatus === 'idle' && (
                            <Button onClick={runEquipmentMigration}>Run Equipment Data Migration</Button>
                        )}
                        {migrationStatus === 'processing' && (
                           <p className="text-slate-600">Processing... Please wait.</p>
                        )}
                        {migrationStatus === 'complete' && (
                            <div className="space-y-1">
                                <p className="font-semibold text-green-600">Migration Complete!</p>
                                <p>Items Scanned: {migrationResults.scanned}</p>
                                <p>Items Updated: {migrationResults.updated}</p>
                                <p>Errors: {migrationResults.errors}</p>
                            </div>
                        )}
                        {migrationStatus === 'error' && (
                           <p className="font-semibold text-red-600">An error occurred during migration. Check the console for details.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Remove Duplicate Assignment</DialogTitle>
                            <DialogDescription>
                                Mark this assignment as returned to resolve the duplicate. The equipment will remain in inventory.
                            </DialogDescription>
                        </DialogHeader>
                        {assignmentToDelete && (
                            <div className="bg-slate-50 p-4 rounded-lg mb-4">
                                <p className="text-sm"><strong>Equipment:</strong> {assignmentToDelete.equipment_id}</p>
                                <p className="text-sm"><strong>Soldier:</strong> {assignmentToDelete.soldier_name}</p>
                                <p className="text-sm"><strong>Assignment Date:</strong> {new Date(assignmentToDelete.assignment_date).toLocaleDateString()}</p>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDeleteAssignment}>Remove Assignment</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}