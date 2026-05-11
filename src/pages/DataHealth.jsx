import React, { useState } from "react";
import { Equipment, Assignment, Soldier } from "@/entities/all";
import { RefreshCw } from "lucide-react";
import { useLanguage } from "@/lib/language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, DatabaseZap, AlertCircle, Trash2, Check, Users } from "lucide-react";
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
    const { language } = useLanguage();
    const isHe = language === 'he';
    const dh = {
        title: isHe ? "תקינות נתונים וכלים" : "Data Health & Tools",
        subtitle: isHe ? "הפעל משימות תחזוקה והגירת נתונים." : "Run maintenance and migration tasks.",
        unknownHolderTitle: isHe ? "בדיקת מזהה מחזיק לא מוכר" : "Unknown Holder ID Check",
        unknownHolderDesc: isHe ? "מצא ציוד מנופק שמזהה המחזיק שלו לא תואם לאף רשומת חייל. מציע התאמות לפי שם." : "Find issued equipment whose holder ID doesn't match any soldier record. Suggests matches by name.",
        scanUnknownHolders: isHe ? "סרוק מחזיקים לא מוכרים" : "Scan for Unknown Holders",
        scanning: isHe ? "סורק... אנא המתן." : "Scanning... Please wait.",
        allHolderIdsValid: isHe ? "✓ כל מזהי המחזיקים תקינים!" : "✓ All holder IDs are valid!",
        itemsUnrecognizedHolder: (n) => isHe ? `${n} פריטים עם מזהה מחזיק לא מוכר:` : `${n} item(s) have an unrecognized holder ID:`,
        possibleMatchesByName: isHe ? "התאמות אפשריות לפי שם:" : "Possible matches by name:",
        useThisSoldier: isHe ? "השתמש בחייל זה" : "Use This Soldier",
        updating: isHe ? "מעדכן..." : "Updating...",
        noNameMatches: isHe ? "לא נמצאו התאמות שם. עדכן ידנית בדף הציוד." : "No name matches found. Update manually in the Equipment page.",
        rescan: isHe ? "סרוק מחדש" : "Rescan",
        errorOccurred: isHe ? "אירעה שגיאה. בדוק את הקונסול." : "An error occurred. Check the console.",
        soldierSyncTitle: isHe ? "סנכרון פרטי חייל" : "Soldier Info Sync",
        soldierSyncDesc: isHe ? "בדוק את כל הציוד המנופק ועדכן שם חייל, פלוגה ומחלקה אם אינם תואמים לפרטי החייל הנוכחיים." : "Check all issued equipment and update soldier name, platoon, and squad if they don't match the soldier's current info.",
        checkAndUpdate: isHe ? "בדוק ועדכן ציוד" : "Check & Update Equipment",
        scanningAndUpdating: isHe ? "סורק ומעדכן... אנא המתן." : "Scanning and updating... Please wait.",
        checked: isHe ? "נבדק" : "Checked",
        updated: isHe ? "עודכן" : "Updated",
        allUpToDate: isHe ? "✓ כל פרטי הציוד מעודכנים!" : "✓ All equipment info is up to date!",
        runAgain: isHe ? "הפעל שוב" : "Run Again",
        lastWeekTitle: isHe ? "סנכרון הנפקות נשק מהשבוע האחרון" : "Last Week Weapon Assignment Sync",
        lastWeekDesc: isHe ? "מצא חיילים שהונפק להם ציוד ב-7 הימים האחרונים עם נשק שעדיין במחסן, והנפק אותם בכמות." : "Find soldiers assigned equipment in the last 7 days with weapons still in storage, and bulk issue those weapons.",
        scanLastWeek: isHe ? "סרוק הנפקות השבוע האחרון" : "Scan Last Week's Assignments",
        noConflictsFound: isHe ? "✓ לא נמצאו קונפליקטים!" : "✓ No conflicts found!",
        weaponsLastWeekStorage: (n) => isHe ? `${n} נשק/ים הוקצו ב-7 הימים האחרונים אך עדיין מסומנים כמחסן:` : `${n} weapon(s) assigned in last 7 days but still marked as storage:`,
        assignSelected: (n) => isHe ? `הנפק ${n} נשק/ים נבחרים` : `Assign Selected ${n} Weapon(s)`,
        todayTitle: isHe ? "סנכרון הנפקות נשק היום" : "Today's Weapon Assignment Sync",
        todayDesc: isHe ? "מצא חיילים שהונפק להם ציוד היום עם נשק שעדיין במחסן, והנפק אותם בכמות." : "Find soldiers assigned equipment today with weapons still in storage, and bulk issue those weapons.",
        scanToday: isHe ? "סרוק הנפקות היום" : "Scan Today's Assignments",
        weaponsTodayStorage: (n) => isHe ? `${n} נשק/ים הוקצו היום אך עדיין מסומנים כמחסן:` : `${n} weapon(s) assigned today but still marked as storage:`,
        conflictTitle: isHe ? "זיהוי קונפליקט מחסן מול פעיל" : "Storage vs Active Conflict Detection",
        conflictDesc: isHe ? 'מצא ציוד המסומן כ"מחסן" אך מוקצה לחיילים פעילים.' : 'Find equipment marked as "storage" but assigned to active soldiers.',
        scanConflicts: isHe ? "סרוק קונפליקטים" : "Scan for Conflicts",
        itemsStorageButAssigned: (n) => isHe ? `${n} פריטים מסומנים כמחסן אך מוקצים באופן פעיל:` : `${n} item(s) marked as storage but actively assigned:`,
        assignedTo: isHe ? "מוקצה ל" : "Assigned to",
        markAsReturned: isHe ? "סמן כהוחזר" : "Mark as Returned",
        duplicateTitle: isHe ? "זיהוי הנפקות כפולות" : "Duplicate Assignment Detection",
        duplicateDesc: isHe ? "סרוק ציוד המנופק לכמה חיילים בו-זמנית." : "Scan for equipment assigned to multiple soldiers simultaneously.",
        scanDuplicates: isHe ? "סרוק כפולות" : "Scan for Duplicates",
        noDuplicatesFound: isHe ? "✓ לא נמצאו כפולות!" : "✓ No duplicates found!",
        duplicateSoldierTitle: isHe ? "זיהוי מספר אישי כפול" : "Duplicate Soldier ID Detection",
        duplicateSoldierDesc: isHe ? "מצא חיילים עם אותו מ.א, אמת ומזג אותם לרשומה אחת." : "Find soldiers sharing the same ID, validate, and merge them into one record.",
        scanDuplicateSoldiers: isHe ? "סרוק חיילים כפולים" : "Scan for Duplicate Soldiers",
        noDuplicateSoldiers: isHe ? "✓ לא נמצאו מ.א כפולים!" : "✓ No duplicate soldier IDs found!",
        duplicateGroupsFound: (n) => isHe ? `נמצאו ${n} קבוצות כפולות:` : `${n} duplicate group(s) found:`,
        mergeAll: isHe ? "מזג את כל הקבוצות (שמור את הישנה בכל קבוצה)" : "Merge All Groups (keep oldest record in each)",
        merging: isHe ? "ממזג רשומות... אנא המתן." : "Merging records... Please wait.",
        keepPrimary: isHe ? "שמור (ראשי)" : "Keep (Primary)",
        mergeKeepSelected: isHe ? "מזג ← שמור ראשי נבחר" : "Merge → Keep Selected Primary",
        confirmMergeTitle: isHe ? "אישור מיזוג חיילים" : "Confirm Soldier Merge",
        confirmMergeDesc: isHe ? "כל ההנפקות והציוד המקושרים לרשומות הכפולות יועברו לחייל הראשי. הרשומות הכפולות יימחקו. לא ניתן לבטל פעולה זו." : "All assignments and equipment linked to the duplicate record(s) will be re-pointed to the primary soldier. Duplicate records will be deleted. This cannot be undone.",
        mergeAllWillMerge: (n) => isHe ? `ימזג ${n} קבוצות, ישמור את הרשומה הישנה בכל:` : `Will merge all ${n} group(s), keeping the oldest record in each:`,
        keep: isHe ? "שמור" : "Keep",
        delete: isHe ? "מחק" : "Delete",
        confirmMerge: isHe ? "אשר מיזוג" : "Confirm Merge",
        migrationTitle: isHe ? "הגירת נתונים חד-פעמית" : "One-Time Data Migration",
        migrationDesc: isHe ? "עדכן נתוני ציוד מסטטוס 'assigned' ל-'issued' ושדות נלווים. הפעל פעם אחת בלבד לאחר עדכון." : "Update equipment data from 'assigned' to 'issued' status and fields. Run this only once after an update.",
        runMigration: isHe ? "הפעל הגירת נתוני ציוד" : "Run Equipment Data Migration",
        migrationComplete: isHe ? "הגירה הושלמה!" : "Migration Complete!",
        itemsScanned: isHe ? "פריטים שנסרקו" : "Items Scanned",
        itemsUpdated: isHe ? "פריטים שעודכנו" : "Items Updated",
        errors: isHe ? "שגיאות" : "Errors",
        removeAssignment: isHe ? "הסר הנפקה כפולה" : "Remove Duplicate Assignment",
        removeAssignmentDesc: isHe ? "סמן הנפקה זו כהוחזרה כדי לפתור את הכפילות. הציוד יישאר במלאי." : "Mark this assignment as returned to resolve the duplicate. The equipment will remain in inventory.",
        removeAssignmentBtn: isHe ? "הסר הנפקה" : "Remove Assignment",
        cancelBtn: isHe ? "ביטול" : "Cancel",
        idNotFoundMsg: (id) => isHe ? `מזהה מחזיק ${id} לא נמצא` : `Holder ID ${id} not found`,
        idMismatchMsg: (id, soldierName, recordName) => isHe ? `מזהה ${id} שייך ל${soldierName} אך השם ברשומה הוא ${recordName} — ככל הנראה מזהה ישן.` : `ID ${id} belongs to ${soldierName}, but name on record is ${recordName} — likely a stale ID.`,
        nameOnRecord: isHe ? "שם ברשומה" : "Name on record",
        assignedDate: isHe ? "הוקצה" : "Assigned",
        activeAssignments: isHe ? "הנפקות פעילות" : "active assignments",
        showDetails: isHe ? "הצג פרטים" : "Show Details",
        hideDetails: isHe ? "הסתר פרטים" : "Hide Details",
        latest: isHe ? "(אחרון)" : "(Latest)",
        remove: isHe ? "הסר" : "Remove",
        bulkRemove: (n) => isHe ? `הסרה בכמות (${n} פריטים)` : `Bulk Remove (${n} items)`,
        removing: isHe ? "מסיר..." : "Removing...",
        sameSoldierDups: (n) => isHe ? `נמצאו ${n} מקרים עם אותו חייל מנופק באותו יום:` : `Found ${n} case(s) with same soldier assigned on same day:`,
        itemsStorageConflict: (n) => isHe ? `${n} נשק/ים הוקצו אך עדיין מסומנים כמחסן:` : `${n} weapon(s) assigned but still marked as storage:`,
    };

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
    const [soldierSyncStatus, setSoldierSyncStatus] = useState('idle'); // idle, scanning, complete, error
    const [soldierSyncResults, setSoldierSyncResults] = useState({ checked: 0, updated: 0, mismatches: [] });

    // Unknown Holder ID detection
    const [unknownHolderStatus, setUnknownHolderStatus] = useState('idle'); // idle, scanning, complete, error
    const [unknownHolderItems, setUnknownHolderItems] = useState([]); // [{equipment, suggestions}]
    const [applyingFix, setApplyingFix] = useState(null); // equipmentId being fixed

    const scanForUnknownHolders = async () => {
        setUnknownHolderStatus('scanning');
        setUnknownHolderItems([]);
        try {
            const [allEquipment, allSoldiers] = await Promise.all([
                Equipment.filter({ assignment_status: 'issued' }),
                Soldier.list(),
            ]);
            const soldierById = {};
            const soldierByName = {};
            allSoldiers.forEach(s => {
                if (s.soldier_id) soldierById[s.soldier_id] = s;
                if (s.full_name) soldierByName[s.full_name.toLowerCase().trim()] = s;
            });

            const results = [];

            for (const item of allEquipment) {
                if (!item.issued_soldier_id) continue;

                const soldierByIdMatch = soldierById[item.issued_soldier_id];

                // Case 1: ID not found at all
                // Case 2: ID found but name doesn't match (stale/wrong ID)
                const idMissing = !soldierByIdMatch;
                const idMismatch = soldierByIdMatch &&
                    item.issued_soldier_name &&
                    soldierByIdMatch.full_name?.toLowerCase().trim() !== item.issued_soldier_name.toLowerCase().trim();

                if (!idMissing && !idMismatch) continue;

                // Build suggestions by name
                const name = (item.issued_soldier_name || '').toLowerCase().trim();
                const suggestions = name
                    ? allSoldiers.filter(s =>
                        s.full_name?.toLowerCase().includes(name) ||
                        name.includes(s.full_name?.toLowerCase())
                      )
                    : [];

                // For mismatch, also include the soldier the name actually resolves to (if different)
                if (idMismatch && soldierByName[name] && !suggestions.find(s => s.id === soldierByName[name].id)) {
                    suggestions.unshift(soldierByName[name]);
                }

                results.push({
                    equipment: item,
                    suggestions,
                    issueType: idMissing ? 'id_not_found' : 'id_name_mismatch',
                    currentSoldier: idMismatch ? soldierByIdMatch : null,
                });
            }

            setUnknownHolderItems(results);
            setUnknownHolderStatus('complete');
        } catch (error) {
            console.error("Error scanning for unknown holders:", error);
            setUnknownHolderStatus('error');
        }
    };

    const applyHolderFix = async (equipment, soldier) => {
        setApplyingFix(equipment.id);
        try {
            await Equipment.update(equipment.id, {
                issued_soldier_id: soldier.soldier_id,
                issued_soldier_name: soldier.full_name,
                platoon: soldier.platoon,
                squad: soldier.squad,
            });
            setUnknownHolderItems(prev => prev.filter(i => i.equipment.id !== equipment.id));
        } catch (error) {
            console.error("Error fixing holder:", error);
            alert("Failed to update equipment. Please try again.");
        }
        setApplyingFix(null);
    };

    // Duplicate soldier ID detection & merge
    const [dupSoldierStatus, setDupSoldierStatus] = useState('idle'); // idle, scanning, complete, merging
    const [dupSoldierGroups, setDupSoldierGroups] = useState([]); // [{soldier_id, soldiers: [...]}]
    const [mergeSelections, setMergeSelections] = useState({}); // {soldier_id: primaryDbId}
    const [mergeDialogGroup, setMergeDialogGroup] = useState(null);

    const scanForDuplicateSoldiers = async () => {
        setDupSoldierStatus('scanning');
        setDupSoldierGroups([]);
        try {
            const allSoldiers = await Soldier.list();
            const grouped = {};
            allSoldiers.forEach(s => {
                if (!s.soldier_id) return;
                if (!grouped[s.soldier_id]) grouped[s.soldier_id] = [];
                grouped[s.soldier_id].push(s);
            });
            const groups = Object.entries(grouped)
                .filter(([_, soldiers]) => soldiers.length > 1)
                .map(([soldier_id, soldiers]) => ({ soldier_id, soldiers }));
            setDupSoldierGroups(groups);
            // Default selection: pick the oldest record (first created) as primary
            const defaults = {};
            groups.forEach(g => {
                const sorted = [...g.soldiers].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
                defaults[g.soldier_id] = sorted[0].id;
            });
            setMergeSelections(defaults);
            setDupSoldierStatus('complete');
        } catch (error) {
            console.error("Error scanning for duplicate soldiers:", error);
            setDupSoldierStatus('error');
        }
    };

    const mergeSoldiers = async (group) => {
        const primaryId = mergeSelections[group.soldier_id];
        if (!primaryId) return;
        const primary = group.soldiers.find(s => s.id === primaryId);
        const duplicates = group.soldiers.filter(s => s.id !== primaryId);

        setDupSoldierStatus('merging');
        try {
            const [allAssignments, allEquipment] = await Promise.all([
                Assignment.list(),
                Equipment.list(),
            ]);

            for (const dup of duplicates) {
                // Re-point assignments
                const dupAssignments = allAssignments.filter(a => a.soldier_id === dup.soldier_id && a.created_by === dup.id || a.soldier_id === dup.soldier_id);
                for (const a of dupAssignments) {
                    await Assignment.update(a.id, {
                        soldier_id: primary.soldier_id,
                        soldier_name: primary.full_name,
                    });
                }
                // Re-point equipment
                const dupEquipment = allEquipment.filter(e => e.issued_soldier_id === dup.soldier_id);
                for (const e of dupEquipment) {
                    await Equipment.update(e.id, {
                        issued_soldier_id: primary.soldier_id,
                        issued_soldier_name: primary.full_name,
                    });
                }
                // Delete the duplicate soldier record
                await Soldier.delete(dup.id);
            }

            alert(`Merged ${duplicates.length} duplicate(s) into "${primary.full_name}" (ID: ${primary.soldier_id}).`);
            setMergeDialogGroup(null);
            await scanForDuplicateSoldiers();
        } catch (error) {
            console.error("Error merging soldiers:", error);
            alert("An error occurred during merge. Check console for details.");
            setDupSoldierStatus('complete');
        }
    };

    const runSoldierInfoSync = async () => {
        setSoldierSyncStatus('scanning');
        setSoldierSyncResults({ checked: 0, updated: 0, mismatches: [] });
        try {
            const allEquipment = await Equipment.filter({ assignment_status: 'issued' });
            const allSoldiers = await Soldier.list();
            const soldierMap = {};
            allSoldiers.forEach(s => { soldierMap[s.soldier_id] = s; });

            let updated = 0;
            const mismatches = [];

            for (const item of allEquipment) {
                if (!item.issued_soldier_id) continue;
                const soldier = soldierMap[item.issued_soldier_id];
                if (!soldier) continue;

                const updatePayload = {};
                if (item.issued_soldier_name !== soldier.full_name) updatePayload.issued_soldier_name = soldier.full_name;
                if (item.platoon !== soldier.platoon) updatePayload.platoon = soldier.platoon;
                if (item.squad !== soldier.squad) updatePayload.squad = soldier.squad;

                if (Object.keys(updatePayload).length > 0) {
                    mismatches.push({
                        serial: item.serial_number,
                        name: item.object_name,
                        soldierName: soldier.full_name,
                        changes: Object.keys(updatePayload).join(', ')
                    });
                    await Equipment.update(item.id, updatePayload);
                    updated++;
                }
            }

            setSoldierSyncResults({ checked: allEquipment.length, updated, mismatches });
            setSoldierSyncStatus('complete');
        } catch (error) {
            console.error("Error syncing soldier info:", error);
            setSoldierSyncStatus('error');
        }
    };

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
                            equipmentDbId: item.id,
                            equipmentName: item.object_name,
                            markedAs: 'storage',
                            activeSoldier: activeAssignment.soldier_name,
                            activeSoldierId: activeAssignment.soldier_id,
                            assignmentId: activeAssignment.id,
                            equipment_id: item.serial_number,
                            soldier_name: activeAssignment.soldier_name,
                            assignment_date: activeAssignment.assignment_date
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
            await Assignment.update(assignmentToDelete.assignmentId || assignmentToDelete.id, {
                status: 'returned',
                return_date: new Date().toISOString().split('T')[0]
            });
            setDeleteDialogOpen(false);
            setAssignmentToDelete(null);
            await Promise.all([scanForDuplicates(), scanForConflicts()]);
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
                        <h1 className="text-3xl font-bold text-slate-900">{dh.title}</h1>
                        <p className="text-slate-600 mt-1">{dh.subtitle}</p>
                    </div>
                </div>

                {/* Unknown Holder ID Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-rose-600"/>
                            {dh.unknownHolderTitle}
                        </CardTitle>
                        <CardDescription>{dh.unknownHolderDesc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {(unknownHolderStatus === 'idle' || unknownHolderStatus === 'error') && (
                            <div className="space-y-2">
                                <Button onClick={scanForUnknownHolders} variant="outline">{dh.scanUnknownHolders}</Button>
                                {unknownHolderStatus === 'error' && <p className="text-red-600 text-sm font-semibold">{dh.errorOccurred}</p>}
                            </div>
                        )}
                        {unknownHolderStatus === 'scanning' && <p className="text-slate-600">{dh.scanning}</p>}
                        {unknownHolderStatus === 'complete' && (
                            <div className="space-y-4">
                                {unknownHolderItems.length === 0 ? (
                                    <p className="text-green-600 font-semibold">{dh.allHolderIdsValid}</p>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-rose-600 font-semibold">{dh.itemsUnrecognizedHolder(unknownHolderItems.length)}</p>
                                        {unknownHolderItems.map(({ equipment, suggestions, issueType, currentSoldier }) => (
                                            <div key={equipment.id} className="border rounded-lg p-4 bg-rose-50">
                                                <div className="mb-2">
                                                    <p className="font-semibold text-slate-900">
                                                        <code className="bg-white px-1 rounded border text-sm">{equipment.serial_number}</code> — {equipment.object_name}
                                                    </p>
                                                    {issueType === 'id_name_mismatch' ? (
                                                        <p className="text-sm text-rose-700 mt-1">
                                                            {dh.idMismatchMsg(equipment.issued_soldier_id, currentSoldier?.full_name, equipment.issued_soldier_name)}
                                                        </p>
                                                    ) : (
                                                        <p className="text-sm text-rose-700 mt-1">
                                                            {dh.idNotFoundMsg(equipment.issued_soldier_id)}
                                                            {equipment.issued_soldier_name && <> · {dh.nameOnRecord}: <strong>{equipment.issued_soldier_name}</strong></>}
                                                        </p>
                                                    )}
                                                </div>
                                                {suggestions.length > 0 ? (
                                                <div>
                                                    <p className="text-xs text-slate-600 mb-2 font-medium">{dh.possibleMatchesByName}</p>
                                                        <div className="space-y-2">
                                                            {suggestions.map(s => (
                                                                <div key={s.id} className="flex items-center justify-between bg-white p-2 rounded border">
                                                                    <div>
                                                                        <p className="text-sm font-medium">{s.full_name}</p>
                                                                        <p className="text-xs text-slate-500">ID: {s.soldier_id} · {s.rank} · {s.platoon} / {s.squad}</p>
                                                                    </div>
                                                                    <Button
                                                                        size="sm"
                                                                        disabled={applyingFix === equipment.id}
                                                                        className="bg-rose-600 hover:bg-rose-700"
                                                                        onClick={() => applyHolderFix(equipment, s)}
                                                                    >
                                                                        {applyingFix === equipment.id ? dh.updating : dh.useThisSoldier}
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-slate-500 italic">{dh.noNameMatches}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <Button onClick={scanForUnknownHolders} variant="outline" size="sm">{dh.rescan}</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Soldier Info Sync Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 text-teal-600"/>
                            {dh.soldierSyncTitle}
                        </CardTitle>
                        <CardDescription>{dh.soldierSyncDesc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {soldierSyncStatus === 'idle' && (
                            <Button onClick={runSoldierInfoSync} variant="outline">{dh.checkAndUpdate}</Button>
                        )}
                        {soldierSyncStatus === 'scanning' && (
                            <p className="text-slate-600">{dh.scanningAndUpdating}</p>
                        )}
                        {soldierSyncStatus === 'complete' && (
                            <div className="space-y-3">
                                <div className="flex gap-4 text-sm">
                                    <span className="text-slate-600">{dh.checked}: <strong>{soldierSyncResults.checked}</strong></span>
                                    <span className={soldierSyncResults.updated > 0 ? "text-teal-700 font-semibold" : "text-green-600"}>
                                        {dh.updated}: <strong>{soldierSyncResults.updated}</strong>
                                    </span>
                                </div>
                                {soldierSyncResults.updated === 0 ? (
                                    <p className="text-green-600 font-semibold">{dh.allUpToDate}</p>
                                ) : (
                                    <div className="border rounded-lg p-3 bg-teal-50 space-y-2 max-h-48 overflow-y-auto">
                                        {soldierSyncResults.mismatches.map((m, i) => (
                                            <div key={i} className="bg-white p-2 rounded border text-sm">
                                                <p><strong>{m.serial}</strong> ({m.name}) → {m.soldierName}</p>
                                                <p className="text-xs text-slate-500">Updated: {m.changes}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <Button onClick={runSoldierInfoSync} variant="outline" size="sm">{dh.runAgain}</Button>
                            </div>
                        )}
                        {soldierSyncStatus === 'error' && (
                            <p className="font-semibold text-red-600">{dh.errorOccurred}</p>
                        )}
                    </CardContent>
                </Card>

                {/* Last Week's Weapon Conflict Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <AlertCircle className="w-5 h-5 text-purple-600"/>
                           {dh.lastWeekTitle}
                        </CardTitle>
                        <CardDescription>{dh.lastWeekDesc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {weekWeaponStatus === 'idle' && (
                            <Button onClick={scanForLastWeekWeaponConflicts} variant="outline">{dh.scanLastWeek}</Button>
                        )}
                        {weekWeaponStatus === 'scanning' && (
                           <p className="text-slate-600">{dh.scanning}</p>
                         )}
                        {weekWeaponStatus === 'complete' && (
                             <div className="space-y-4">
                                 {weekWeaponConflicts.length === 0 ? (
                                     <p className="text-green-600 font-semibold">{dh.noConflictsFound}</p>
                                 ) : (
                                     <div>
                                        <p className="text-purple-600 font-semibold mb-4">{dh.weaponsLastWeekStorage(weekWeaponConflicts.length)}</p>
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
                                                {assigningWeekWeapons ? dh.updating : dh.assignSelected(selectedWeekWeapons.size)}
                                            </Button>
                                        )}
                                     </div>
                                 )}
                            </div>
                        )}
                        {weekWeaponStatus === 'error' && (
                           <p className="font-semibold text-red-600">{dh.errorOccurred}</p>
                        )}
                    </CardContent>
                </Card>

                {/* Today's Weapon Conflict Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <AlertCircle className="w-5 h-5 text-blue-600"/>
                           {dh.todayTitle}
                        </CardTitle>
                        <CardDescription>{dh.todayDesc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {todayWeaponStatus === 'idle' && (
                            <Button onClick={scanForTodayWeaponConflicts} variant="outline">{dh.scanToday}</Button>
                        )}
                        {todayWeaponStatus === 'scanning' && (
                           <p className="text-slate-600">{dh.scanning}</p>
                         )}
                        {todayWeaponStatus === 'complete' && (
                             <div className="space-y-4">
                                 {todayWeaponConflicts.length === 0 ? (
                                     <p className="text-green-600 font-semibold">{dh.noConflictsFound}</p>
                                 ) : (
                                     <div>
                                        <p className="text-blue-600 font-semibold mb-4">{dh.weaponsTodayStorage(todayWeaponConflicts.length)}</p>
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
                                                {assigningWeapons ? dh.updating : dh.assignSelected(selectedWeapons.size)}
                                            </Button>
                                        )}
                                     </div>
                                 )}
                            </div>
                        )}
                        {todayWeaponStatus === 'error' && (
                           <p className="font-semibold text-red-600">{dh.errorOccurred}</p>
                         )}
                    </CardContent>
                </Card>

                {/* Conflict Detection Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <AlertCircle className="w-5 h-5 text-orange-600"/>
                           {dh.conflictTitle}
                        </CardTitle>
                        <CardDescription>{dh.conflictDesc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {conflictStatus === 'idle' && (
                            <Button onClick={scanForConflicts} variant="outline">{dh.scanConflicts}</Button>
                        )}
                        {conflictStatus === 'scanning' && (
                           <p className="text-slate-600">{dh.scanning}</p>
                        )}
                        {conflictStatus === 'complete' && (
                             <div className="space-y-4">
                                 {conflicts.length === 0 ? (
                                     <p className="text-green-600 font-semibold">{dh.noConflictsFound}</p>
                                 ) : (
                                     <div>
                                        <p className="text-orange-600 font-semibold mb-4">{dh.itemsStorageButAssigned(conflicts.length)}</p>
                                        <div className="space-y-3">
                                            {conflicts.map((conflict) => (
                                                <div key={conflict.equipmentId} className="border rounded-lg p-4 bg-orange-50">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-semibold text-slate-900">{conflict.equipmentId}</p>
                                                            <p className="text-sm text-slate-600">{conflict.equipmentName}</p>
                                                            <p className="text-sm text-orange-600 mt-2">{dh.assignedTo}: {conflict.activeSoldier} ({conflict.activeSoldierId})</p>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setAssignmentToDelete({...conflict, status: 'active'});
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            {dh.markAsReturned}
                                                            </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Button onClick={scanForConflicts} variant="outline" className="mt-4">{dh.rescan}</Button>
                                     </div>
                                 )}
                            </div>
                        )}
                        {conflictStatus === 'error' && (
                           <p className="font-semibold text-red-600">{dh.errorOccurred}</p>
                         )}
                    </CardContent>
                </Card>

                {/* Duplicate Detection Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <AlertCircle className="w-5 h-5 text-red-600"/>
                           {dh.duplicateTitle}
                        </CardTitle>
                        <CardDescription>{dh.duplicateDesc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {duplicateStatus === 'idle' && (
                            <Button onClick={scanForDuplicates} variant="destructive">{dh.scanDuplicates}</Button>
                        )}
                        {duplicateStatus === 'scanning' && (
                           <p className="text-slate-600">{dh.scanning}</p>
                        )}
                        {duplicateStatus === 'complete' && (
                             <div className="space-y-4">
                                 {duplicates.length === 0 ? (
                                     <p className="text-green-600 font-semibold">{dh.noDuplicatesFound}</p>
                                 ) : (
                                     <div>
                                         {sameSoldierDuplicates.length > 0 && (
                                             <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4">
                                                 <p className="font-semibold text-yellow-800 mb-3">
                                                     {dh.sameSoldierDups(sameSoldierDuplicates.length)}
                                                 </p>
                                                 <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                                                     {sameSoldierDuplicates.map((dup, idx) => (
                                                         <div key={idx} className="bg-white p-2 rounded text-sm">
                                                             <p><strong>{dup.equipmentId}</strong> → {dup.soldierName} ({dup.soldierId}) on {new Date(dup.assignmentDate).toLocaleDateString()} ({dup.assignments.length} copies)</p>
                                                         </div>
                                                     ))}
                                                 </div>
                                                 <Button onClick={handleBulkRemoveSameSoldier} disabled={bulkRemoving} className="bg-yellow-600 hover:bg-yellow-700">
                                                     {bulkRemoving ? dh.removing : dh.bulkRemove(sameSoldierDuplicates.reduce((sum, dup) => sum + (dup.assignments.length - 1), 0))}
                                                 </Button>
                                             </div>
                                         )}
                                         <div>
                                        <p className="text-red-600 font-semibold mb-4">{dh.itemsStorageConflict(duplicates.length)}</p>
                                        <div className="space-y-3">
                                            {duplicates.map((dup) => (
                                                <div key={dup.equipmentId} className="border rounded-lg p-4 bg-red-50">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <p className="font-semibold text-slate-900">{dup.equipmentId}</p>
                                                            <Badge className="bg-red-600 mt-1">{dup.count} {dh.activeAssignments}</Badge>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setSelectedDuplicate(selectedDuplicate === dup.equipmentId ? null : dup.equipmentId)}
                                                            >
                                                            {selectedDuplicate === dup.equipmentId ? dh.hideDetails : dh.showDetails}
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
                                                                            <p className="text-sm font-medium">{idx === 0 ? dh.latest + ' ' : ''}{assignment.soldier_name} ({assignment.soldier_id})</p>
                                                                                <p className="text-xs text-slate-500">{dh.assignedDate}: {new Date(assignment.assignment_date).toLocaleDateString()}</p>
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
                                                                            {dh.remove}
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
                                                 <p className="text-sm font-medium text-blue-800 mb-3">{dh.bulkRemove(selectedForRemoval.size)}</p>
                                                 <Button onClick={handleRemoveSelected} disabled={bulkRemoving} className="w-full bg-red-600 hover:bg-red-700">
                                                     <Trash2 className="w-4 h-4 mr-2" />
                                                     {bulkRemoving ? dh.removing : dh.removeAssignmentBtn}
                                                 </Button>
                                             </div>
                                         )}
                                         </div>
                                         <Button onClick={scanForDuplicates} variant="outline" className="mt-4">{dh.rescan}</Button>
                                        </div>
                                        )}
                                        </div>
                                        )}
                        {duplicateStatus === 'error' && (
                           <p className="font-semibold text-red-600">{dh.errorOccurred}</p>
                         )}
                    </CardContent>
                </Card>

                {/* Duplicate Soldier ID Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-600"/>
                            {dh.duplicateSoldierTitle}
                            </CardTitle>
                            <CardDescription>{dh.duplicateSoldierDesc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {(dupSoldierStatus === 'idle' || dupSoldierStatus === 'error') && (
                            <div className="space-y-2">
                                <Button onClick={scanForDuplicateSoldiers} variant="outline">{dh.scanDuplicateSoldiers}</Button>
                                {dupSoldierStatus === 'error' && <p className="text-red-600 text-sm font-semibold">{dh.errorOccurred}</p>}
                            </div>
                        )}
                        {dupSoldierStatus === 'scanning' && <p className="text-slate-600">{dh.scanning}</p>}
                        {dupSoldierStatus === 'merging' && <p className="text-slate-600">{dh.merging}</p>}
                        {dupSoldierStatus === 'complete' && (
                            <div className="space-y-4">
                                {dupSoldierGroups.length === 0 ? (
                                    <p className="text-green-600 font-semibold">{dh.noDuplicateSoldiers}</p>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-indigo-600 font-semibold">{dh.duplicateGroupsFound(dupSoldierGroups.length)}</p>
                                        <Button
                                            className="bg-indigo-600 hover:bg-indigo-700 w-full"
                                            onClick={() => setMergeDialogGroup('all')}
                                        >
                                            {dh.mergeAll}
                                        </Button>
                                        {dupSoldierGroups.map(group => (
                                            <div key={group.soldier_id} className="border rounded-lg p-4 bg-indigo-50">
                                                <p className="font-semibold text-slate-800 mb-2">{isHe ? 'מ.א:' : 'Soldier ID:'} <code className="bg-white px-2 py-0.5 rounded border">{group.soldier_id}</code> — {group.soldiers.length} {isHe ? 'רשומות' : 'records'}</p>
                                                <div className="space-y-2 mb-3">
                                                    {group.soldiers.map(s => (
                                                        <label key={s.id} className="flex items-center gap-3 bg-white p-3 rounded border cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name={`primary-${group.soldier_id}`}
                                                                checked={mergeSelections[group.soldier_id] === s.id}
                                                                onChange={() => setMergeSelections(prev => ({ ...prev, [group.soldier_id]: s.id }))}
                                                            />
                                                            <div className="flex-1">
                                                                <p className="font-medium text-sm">{s.full_name}</p>
                                                                <p className="text-xs text-slate-500">{s.rank} · {s.platoon} / {s.squad} · Created: {new Date(s.created_date).toLocaleDateString()}</p>
                                                            </div>
                                                            {mergeSelections[group.soldier_id] === s.id && (
                                                                <Badge className="bg-indigo-600 text-white text-xs">{dh.keepPrimary}</Badge>
                                                            )}
                                                        </label>
                                                    ))}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    className="bg-indigo-600 hover:bg-indigo-700"
                                                    onClick={() => setMergeDialogGroup(group)}
                                                >
                                                    {dh.mergeKeepSelected}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <Button onClick={scanForDuplicateSoldiers} variant="outline" size="sm">{dh.rescan}</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Merge Confirmation Dialog */}
                <Dialog open={!!mergeDialogGroup} onOpenChange={() => setMergeDialogGroup(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{dh.confirmMergeTitle}</DialogTitle>
                            <DialogDescription>
                                {dh.confirmMergeDesc}
                            </DialogDescription>
                        </DialogHeader>
                        {mergeDialogGroup === 'all' ? (
                            <div className="space-y-2 text-sm max-h-64 overflow-y-auto">
                                <p className="font-semibold text-indigo-700">{dh.mergeAllWillMerge(dupSoldierGroups.length)}</p>
                                {dupSoldierGroups.map(group => {
                                    const sorted = [...group.soldiers].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
                                    const primary = sorted[0];
                                    const dups = sorted.slice(1);
                                    return (
                                        <div key={group.soldier_id} className="bg-slate-50 p-2 rounded border text-xs">
                                            <p><span className="text-indigo-700 font-semibold">{dh.keep}:</span> {primary.full_name} ({primary.rank})</p>
                                            <p><span className="text-red-600 font-semibold">{dh.delete}:</span> {dups.map(d => d.full_name).join(', ')}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : mergeDialogGroup && (() => {
                            const primary = mergeDialogGroup.soldiers.find(s => s.id === mergeSelections[mergeDialogGroup.soldier_id]);
                            const dups = mergeDialogGroup.soldiers.filter(s => s.id !== mergeSelections[mergeDialogGroup.soldier_id]);
                            return (
                                <div className="space-y-3 text-sm">
                                    <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                                        <p className="font-semibold text-indigo-800">{isHe ? 'ראשי (שמור):' : 'Primary (keep):'}</p>
                                        <p>{primary?.full_name} · {primary?.rank} · {primary?.platoon}</p>
                                    </div>
                                    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                                        <p className="font-semibold text-red-700">{isHe ? `יימחק (${dups.length}):` : `Will be deleted (${dups.length}):`}</p>
                                        {dups.map(d => <p key={d.id}>{d.full_name} · {d.rank} · {d.platoon}</p>)}
                                    </div>
                                </div>
                            );
                        })()}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setMergeDialogGroup(null)}>{dh.cancelBtn}</Button>
                            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={async () => {
                                if (mergeDialogGroup === 'all') {
                                    setMergeDialogGroup(null);
                                    const groupsToMerge = [...dupSoldierGroups];
                                    setDupSoldierStatus('merging');
                                    let totalMerged = 0;
                                    try {
                                        const [allAssignments, allEquipment] = await Promise.all([
                                            Assignment.list(),
                                            Equipment.list(),
                                        ]);
                                        for (const group of groupsToMerge) {
                                            const primaryId = mergeSelections[group.soldier_id];
                                            const primary = group.soldiers.find(s => s.id === primaryId);
                                            const dups = group.soldiers.filter(s => s.id !== primaryId);
                                            for (const dup of dups) {
                                                const dupAssignments = allAssignments.filter(a => a.soldier_id === dup.soldier_id);
                                                for (const a of dupAssignments) {
                                                    await Assignment.update(a.id, { soldier_id: primary.soldier_id, soldier_name: primary.full_name });
                                                }
                                                const dupEquipment = allEquipment.filter(e => e.issued_soldier_id === dup.soldier_id);
                                                for (const e of dupEquipment) {
                                                    await Equipment.update(e.id, { issued_soldier_id: primary.soldier_id, issued_soldier_name: primary.full_name });
                                                }
                                                await Soldier.delete(dup.id);
                                                totalMerged++;
                                            }
                                        }
                                        alert(`Merged all groups successfully. Removed ${totalMerged} duplicate record(s).`);
                                        await scanForDuplicateSoldiers();
                                    } catch (error) {
                                        console.error("Error merging all soldiers:", error);
                                        alert("An error occurred during merge. Check console for details.");
                                        setDupSoldierStatus('complete');
                                    }
                                } else {
                                    mergeSoldiers(mergeDialogGroup);
                                }
                            }}>{dh.confirmMerge}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Migration Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <DatabaseZap className="w-5 h-5"/>
                           {dh.migrationTitle}
                        </CardTitle>
                        <CardDescription>{dh.migrationDesc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {migrationStatus === 'idle' && (
                            <Button onClick={runEquipmentMigration}>{dh.runMigration}</Button>
                        )}
                        {migrationStatus === 'processing' && (
                           <p className="text-slate-600">{dh.scanning}</p>
                        )}
                        {migrationStatus === 'complete' && (
                            <div className="space-y-1">
                                <p className="font-semibold text-green-600">{dh.migrationComplete}</p>
                                <p>{dh.itemsScanned}: {migrationResults.scanned}</p>
                                <p>{dh.itemsUpdated}: {migrationResults.updated}</p>
                                <p>{dh.errors}: {migrationResults.errors}</p>
                            </div>
                        )}
                        {migrationStatus === 'error' && (
                           <p className="font-semibold text-red-600">{dh.errorOccurred}</p>
                        )}
                    </CardContent>
                </Card>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{dh.removeAssignment}</DialogTitle>
                            <DialogDescription>
                                {dh.removeAssignmentDesc}
                            </DialogDescription>
                        </DialogHeader>
                        {assignmentToDelete && (
                            <div className="bg-slate-50 p-4 rounded-lg mb-4">
                                <p className="text-sm"><strong>{isHe ? 'ציוד' : 'Equipment'}:</strong> {assignmentToDelete.equipment_id}</p>
                                <p className="text-sm"><strong>{isHe ? 'חייל' : 'Soldier'}:</strong> {assignmentToDelete.soldier_name}</p>
                                <p className="text-sm"><strong>{dh.assignedDate}:</strong> {new Date(assignmentToDelete.assignment_date).toLocaleDateString()}</p>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>{dh.cancelBtn}</Button>
                            <Button variant="destructive" onClick={handleDeleteAssignment}>{dh.removeAssignmentBtn}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}