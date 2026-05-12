import React, { useState, useEffect, useMemo } from "react";
import { Soldier, Assignment, Equipment } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, CheckSquare, Square, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { groupBy } from "lodash";
import DocumentFilters from "../components/document-generator/DocumentFilters";
import AssignmentGroupCard from "../components/document-generator/AssignmentGroupCard";
import { generateSingle1008HTML, generateSummaryHTML } from "../components/document-generator/htmlGenerator";

export default function DocumentGenerator() {
  const navigate = useNavigate();
  const [allAssignments, setAllAssignments] = useState([]);
  const [allSoldiers, setAllSoldiers] = useState([]);
  const [allEquipment, setAllEquipment] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ platoon: 'all', date: undefined, searchTerm: '', status: 'all', sortOrder: 'desc' });
  const [selectedGroupKeys, setSelectedGroupKeys] = useState([]);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [assignments, soldiers, equipment] = await Promise.all([
          Assignment.list(),
          Soldier.list(),
          Equipment.list(),
        ]);
        setAllAssignments(assignments);
        setAllSoldiers(soldiers);
        setAllEquipment(equipment);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
      setIsLoading(false);
    };
    loadInitialData();
  }, []);

  const platoons = useMemo(() => {
    return [...new Set(allSoldiers.map(s => s.platoon).filter(Boolean))].sort();
  }, [allSoldiers]);

  const filteredAssignmentGroups = useMemo(() => {
    let filtered = allAssignments.filter(a => a.signature_data); // Only show signed assignments

    // Status filter (cleared / not cleared)
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(a => a.status === filters.status);
    }

    // Search filter
    if (filters.searchTerm) {
        const lowercasedFilter = filters.searchTerm.toLowerCase();
        const soldierMap = new Map(allSoldiers.map(s => [s.soldier_id, s]));
        
        filtered = filtered.filter(a => {
            const soldier = soldierMap.get(a.soldier_id);
            if (!soldier) return false;

            return (
                soldier.full_name?.toLowerCase().includes(lowercasedFilter) ||
                soldier.soldier_id?.toLowerCase().includes(lowercasedFilter)
            );
        });
    }

    // Date filter
    if (filters.date?.from) {
      filtered = filtered.filter(a => new Date(a.assignment_date) >= filters.date.from);
    }
    if (filters.date?.to) {
      filtered = filtered.filter(a => new Date(a.assignment_date) <= filters.date.to);
    }

    const soldierPlatoons = Object.fromEntries(allSoldiers.map(s => [s.soldier_id, s.platoon]));

    // Platoon filter
    if (filters.platoon !== 'all') {
      filtered = filtered.filter(a => soldierPlatoons[a.soldier_id] === filters.platoon);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.assignment_date || 0).getTime();
      const dateB = new Date(b.assignment_date || 0).getTime();
      return filters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    // Group by soldier, then by assignment details
    return groupBy(filtered, 'soldier_id');
  }, [allAssignments, allSoldiers, filters]);

  // New sorted groups for display
  const sortedAssignmentGroups = useMemo(() => {
    if (!filteredAssignmentGroups || Object.keys(filteredAssignmentGroups).length === 0) {
      return {};
    }

    // Create array of [soldierId, soldierData, assignments] for sorting
    const groupsArray = Object.entries(filteredAssignmentGroups).map(([soldierId, assignments]) => {
      const soldier = allSoldiers.find(s => s.soldier_id === soldierId);
      return {
        soldierId,
        soldier,
        assignments,
        platoon: soldier?.platoon || 'Unknown',
        squad: soldier?.squad || 'Unknown'
      };
    });

    // Sort by platoon, then squad, then soldier name
    groupsArray.sort((a, b) => {
      // First by platoon
      if (a.platoon !== b.platoon) {
        return a.platoon.localeCompare(b.platoon);
      }
      // Then by squad (numeric comparison)
      if (a.squad !== b.squad) {
        return a.squad.localeCompare(b.squad, undefined, { numeric: true });
      }
      // Finally by soldier name
      return (a.soldier?.full_name || '').localeCompare(b.soldier?.full_name || '');
    });

    // Convert back to object format
    const sortedGroups = {};
    groupsArray.forEach(({ soldierId, assignments }) => {
      sortedGroups[soldierId] = assignments;
    });

    return sortedGroups;
  }, [filteredAssignmentGroups, allSoldiers]);

  const handleToggleSelection = (groupKey) => {
    setSelectedGroupKeys(prev =>
      prev.includes(groupKey) ? prev.filter(k => k !== groupKey) : [...prev, groupKey]
    );
  };

  const handleSelectAll = (keysToSelect) => {
    if (selectedGroupKeys.length === keysToSelect.length) {
      setSelectedGroupKeys([]);
    } else {
      setSelectedGroupKeys(keysToSelect);
    }
  };

  const handleBulkGenerate = () => {
    // Create array for sorting documents
    const documentsToGenerate = [];
    
    selectedGroupKeys.forEach(key => {
      const [soldierId, groupIdentifier] = key.split('||');
      const soldier = allSoldiers.find(s => s.soldier_id === soldierId);
      const soldierAssignments = sortedAssignmentGroups[soldierId];
      
      const targetGroup = Object.values(groupBy(soldierAssignments, a => `${new Date(a.assignment_date).toISOString().split('T')[0]}-${a.status}`)).find(g => {
         const representative = g[0];
         return `${new Date(representative.assignment_date).toISOString().split('T')[0]}-${representative.status}` === groupIdentifier;
      });

      if (soldier && targetGroup) {
        const assignmentDate = new Date(targetGroup[0].assignment_date);
        documentsToGenerate.push({
          soldier,
          assignmentGroup: targetGroup,
          platoon: soldier.platoon || 'Unknown',
          squad: soldier.squad || 'Unknown',
          date: assignmentDate,
          html: generateSingle1008HTML({ soldier, assignmentGroup: targetGroup, allEquipment })
        });
      }
    });

    // Sort documents by platoon, then squad, then date
    documentsToGenerate.sort((a, b) => {
      // First by platoon
      if (a.platoon !== b.platoon) {
        return a.platoon.localeCompare(b.platoon);
      }
      // Then by squad (numeric comparison)
      if (a.squad !== b.squad) {
        return a.squad.localeCompare(b.squad, undefined, { numeric: true });
      }
      // Finally by date
      return filters.sortOrder === 'asc'
        ? a.date.getTime() - b.date.getTime()
        : b.date.getTime() - a.date.getTime();
    });

    // Combine HTML in sorted order
    const combinedHtml = documentsToGenerate.map(doc => doc.html).join('');
    
    const blob = new Blob([combinedHtml], { type: 'text/html; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk_1008_export_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleGenerateSummary = () => {
    // 1. Get all the selected assignments
    const selectedAssignments = [];
    selectedGroupKeys.forEach(key => {
        const [soldierId, groupIdentifier] = key.split('||');
        // Use sortedAssignmentGroups to consistently get assignments based on the displayed data
        const soldierAssignments = sortedAssignmentGroups[soldierId];
        
        const targetGroup = Object.values(groupBy(soldierAssignments, a => `${new Date(a.assignment_date).toISOString().split('T')[0]}-${a.status}`)).find(g => {
            const representative = g[0];
            return `${new Date(representative.assignment_date).toISOString().split('T')[0]}-${representative.status}` === groupIdentifier;
        });

        if (targetGroup) {
            selectedAssignments.push(...targetGroup);
        }
    });

    // 2. Call the HTML generator
    const summaryHtml = generateSummaryHTML({
        assignments: selectedAssignments,
        allSoldiers,
        allEquipment,
        filters
    });

    // 3. Trigger download
    const blob = new Blob([summaryHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equipment_summary_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const allVisibleGroupKeys = useMemo(() => {
    // Ensure this uses the sorted groups to reflect the current display order
    return Object.entries(sortedAssignmentGroups).flatMap(([soldierId, assignments]) => {
      const groupsByDate = groupBy(assignments, a => `${new Date(a.assignment_date).toISOString().split('T')[0]}-${a.status}`);
      return Object.keys(groupsByDate).map(groupDate => `${soldierId}||${groupDate}`);
    });
  }, [sortedAssignmentGroups]);


  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("Dashboard"))}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Document Generator</h1>
            <p className="text-slate-600 mt-1">Generate historical equipment assignment forms (1008)</p>
          </div>
        </div>
        
        <DocumentFilters platoons={platoons} onFilterChange={setFilters} currentFilters={filters} />
        
        <div className="bg-white p-4 rounded-lg border shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <Button variant="outline" onClick={() => handleSelectAll(allVisibleGroupKeys)}>
                {selectedGroupKeys.length === allVisibleGroupKeys.length ? <CheckSquare className="w-4 h-4 mr-2"/> : <Square className="w-4 h-4 mr-2"/>}
                {selectedGroupKeys.length === allVisibleGroupKeys.length ? "Deselect All" : "Select All"} ({allVisibleGroupKeys.length})
            </Button>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleBulkGenerate} disabled={selectedGroupKeys.length === 0}>
                  <Download className="w-4 h-4 mr-2" />
                  Generate 1008s ({selectedGroupKeys.length} selected)
              </Button>
              <Button onClick={handleGenerateSummary} disabled={selectedGroupKeys.length === 0} variant="secondary">
                  <List className="w-4 h-4 mr-2" />
                  Generate Summary ({selectedGroupKeys.length} selected)
              </Button>
            </div>
        </div>

        {isLoading ? (
          <p>Loading records...</p>
        ) : (
          <div className="space-y-8">
            {/* Iterate over sortedAssignmentGroups for display */}
            {Object.keys(sortedAssignmentGroups).map(soldierId => {
              const soldier = allSoldiers.find(s => s.soldier_id === soldierId);
              if (!soldier) return null;
              
              const soldierAssignmentGroups = groupBy(sortedAssignmentGroups[soldierId], a => `${new Date(a.assignment_date).toISOString().split('T')[0]}-${a.status}`);
              const sortedSoldierAssignmentEntries = Object.entries(soldierAssignmentGroups).sort(([keyA], [keyB]) => {
                const dateA = new Date(keyA.split('-').slice(0, 3).join('-')).getTime();
                const dateB = new Date(keyB.split('-').slice(0, 3).join('-')).getTime();
                return filters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
              });

              return (
                <div key={soldierId}>
                  <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                    {soldier.full_name} 
                    <span className="text-sm text-slate-500 font-normal">
                      ({soldier.platoon}{soldier.squad ? ` - Squad ${soldier.squad}` : ''})
                    </span>
                  </h2>
                  <div className="space-y-4">
                    {sortedSoldierAssignmentEntries.map(([key, group]) => {
                       const groupKey = `${soldierId}||${key}`;
                       return (
                          <AssignmentGroupCard 
                            key={groupKey}
                            soldier={soldier} 
                            assignmentGroup={group}
                            allEquipment={allEquipment}
                            isSelected={selectedGroupKeys.includes(groupKey)}
                            onSelectionChange={() => handleToggleSelection(groupKey)}
                          />
                       )
                    })}
                  </div>
                </div>
              );
            })}
             {allVisibleGroupKeys.length === 0 && !isLoading && (
              <div className="text-center py-10 border-2 border-dashed rounded-lg">
                <p>No signed assignment records found for the selected filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}