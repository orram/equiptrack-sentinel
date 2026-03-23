
import React, { useState, useEffect } from "react";
import { Equipment, Soldier, Assignment, InventoryItem } from "@/entities/all";
import { EmailService } from "@/components/utils/EmailService";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, Package, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "../layout";

import SoldierSearch from "@/components/assignment-tool/SoldierSearch";
import EquipmentManager from "@/components/assignment-tool/EquipmentManager";
import SoldierDetailsEdit from "@/components/assignment-tool/SoldierDetailsEdit";
import AddSoldierModal from "@/components/soldiers/AddSoldierModal";

export default function AssignmentTool() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1); // 1: search, 2: edit, 3: equipment
  const [selectedSoldier, setSelectedSoldier] = useState(null);
  const [soldiers, setSoldiers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Effect for initial data loading, runs only once on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch data sequentially to avoid rate limiting
      const soldierData = await Soldier.list();
      await new Promise(resolve => setTimeout(resolve, 200));
      const equipmentData = await Equipment.list();
      await new Promise(resolve => setTimeout(resolve, 200));
      const inventoryData = await InventoryItem.list();
      await new Promise(resolve => setTimeout(resolve, 200));
      const assignmentData = await Assignment.list();
      
      setSoldiers(soldierData);
      setEquipment(equipmentData);
      setInventoryItems(inventoryData);
      setAssignments(assignmentData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const generateAndSendDocuments = async (soldier, signedEquipment, signatureData) => {
    try {
      // Send email using the new external email service
      await EmailService.sendAssignmentEmail(soldier, signedEquipment, signatureData);
      console.log(`Assignment email sent to ${soldier.email}`);
    } catch (error) {
      console.error("Error sending assignment email:", error);
      // Don't fail the assignment process if email fails
    }
  };

  const handleAssignmentComplete = async (signedEquipment, signatureData) => {
    // Call the document generation function if soldier, signedEquipment, and signatureData are available
    if (selectedSoldier && signedEquipment && signatureData) {
        await generateAndSendDocuments(selectedSoldier, signedEquipment, signatureData);
    }

    // Original logic from handleComplete:
    setCurrentStep(1);
    setSelectedSoldier(null);
    await loadData(); // Reload data to reflect all changes, including assignments and equipment status
  };

  const handleSoldierSelect = (soldier) => {
    setSelectedSoldier(soldier);
    setCurrentStep(2);
  };

  const handleDetailsSave = (updatedSoldier) => {
    setSelectedSoldier(prev => ({ ...prev, ...updatedSoldier }));
    setCurrentStep(3);
    loadData(); // Refresh soldier list in case of name changes etc.
  };

  const handleEquipmentUpdate = () => {
    loadData();
  };
  
  const handleSoldierAdded = async (newSoldierData) => {
    setShowAddModal(false);
    setIsLoading(true);
    
    try {
      // Wait a moment for the database to process (e.g., if there's replication lag)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const freshSoldiers = await Soldier.list();
      setSoldiers(freshSoldiers);
      
      const createdSoldier = freshSoldiers.find(s => s.soldier_id === newSoldierData.soldier_id);
      
      if (createdSoldier) {
        console.log("Auto-selecting new soldier:", createdSoldier);
        setSelectedSoldier(createdSoldier);
        setCurrentStep(3); // Skip to equipment management
      } else {
        console.error("New soldier not found after create:", newSoldierData.soldier_id);
        setCurrentStep(1);
        setSelectedSoldier(null);
      }
    } catch (error) {
      console.error("Error handling new soldier:", error);
      setCurrentStep(1);
      setSelectedSoldier(null);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (currentStep === 1) {
                navigate(createPageUrl("Dashboard"));
              } else if (currentStep === 2) {
                setCurrentStep(1);
                setSelectedSoldier(null);
              } else {
                 setCurrentStep(currentStep - 1);
              }
            }}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{t.assignmentToolTitle}</h1>
            <p className="text-slate-600 mt-1">{t.assignmentToolSubtitle}</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[
              { step: 1, title: t.stepFindSoldier, icon: Search },
              { step: 2, title: t.stepEditDetails, icon: UserCog },
              { step: 3, title: t.stepEquipmentManagement, icon: Package }
            ].map((item, index, arr) => (
              <div key={item.step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  currentStep >= item.step 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className={`ml-2 font-medium transition-colors ${
                  currentStep >= item.step ? 'text-slate-900' : 'text-slate-500'
                }`}>
                  {item.title}
                </span>
                {index < arr.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 transition-colors ${
                    currentStep > item.step ? 'bg-slate-900' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 1 && (
          <SoldierSearch 
            soldiers={soldiers}
            onSoldierSelect={handleSoldierSelect}
            isLoading={isLoading}
            onAddNewSoldier={() => setShowAddModal(true)}
            t={t}
          />
        )}
        
        {currentStep === 2 && selectedSoldier && (
          <SoldierDetailsEdit
            soldier={selectedSoldier}
            onSave={handleDetailsSave}
            onBack={() => {
              setCurrentStep(1);
              setSelectedSoldier(null);
            }}
            t={t}
          />
        )}

        {currentStep === 3 && selectedSoldier && (
          <EquipmentManager
            soldier={selectedSoldier}
            equipment={equipment}
            inventoryItems={inventoryItems}
            assignments={assignments.filter(a => a.soldier_id === selectedSoldier.soldier_id)}
            onUpdate={handleEquipmentUpdate}
            onComplete={handleAssignmentComplete}
            onBack={() => setCurrentStep(2)}
            t={t}
          />
        )}

        {showAddModal && (
          <AddSoldierModal
            onComplete={handleSoldierAdded}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </div>
    </div>
  );
}
