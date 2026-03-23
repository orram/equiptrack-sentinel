import React, { useState, useEffect } from "react";
import { Soldier, Equipment, Assignment, User, InventoryItem } from "@/entities/all"; // Added InventoryItem
import { EmailService } from "../components/utils/EmailService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Mail
} from "lucide-react";

import SoldierList from "../components/soldiers/SoldierList";
import SoldierDetail from "../components/soldiers/SoldierDetail";
import AddSoldierModal from "../components/soldiers/AddSoldierModal";
import EditSoldierForm from "../components/soldiers/EditSoldierForm";
import { useLanguage } from "../layout.js";

export default function Soldiers() {
  const { t } = useLanguage();
  const [soldiers, setSoldiers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]); // New state for inventory items
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSoldier, setSelectedSoldier] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch data sequentially to avoid rate limiting
      const soldierData = await Soldier.list("-created_date");
      await new Promise(resolve => setTimeout(resolve, 200));
      const equipmentData = await Equipment.list("-created_date");
      await new Promise(resolve => setTimeout(resolve, 200));
      const inventoryData = await InventoryItem.list("-created_date"); // Fetch inventory items
      await new Promise(resolve => setTimeout(resolve, 200));
      const assignmentData = await Assignment.list("-created_date");

      setSoldiers(soldierData);
      setEquipment(equipmentData);
      setInventoryItems(inventoryData); // Set inventory items state
      setAssignments(assignmentData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const handleInviteAllSoldiers = async () => {
    setIsInviting(true);

    try {
        const allSoldiers = await Soldier.list();
        const registeredUsers = await User.list();
        const registeredEmails = new Set(registeredUsers.map(u => u.email));

        const soldiersToInvite = allSoldiers.filter(s => s.email && !registeredEmails.has(s.email));

        if (soldiersToInvite.length === 0) {
            alert(t.allSoldiersAlreadyRegistered);
            setIsInviting(false);
            return;
        }

        if (!confirm(t.confirmSendInvitations(soldiersToInvite.length))) {
            setIsInviting(false);
            return;
        }

        let sentCount = 0;
        let errorCount = 0;
        const appUrl = window.location.origin;

        for (const soldier of soldiersToInvite) {
            try {
                const subject = t.invitationSubject;
                const body = `
                    <p>${t.invitationBodyHello(soldier.full_name)}</p>
                    <p>${t.invitationBodyPart1}</p>
                    <p>${t.invitationBodyPart2}</p>
                    <p>${t.invitationBodyPart3}</p>
                    <p><a href="${appUrl}" style="display: inline-block; padding: 12px 20px; background-color: #1e293b; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">${t.joinEquipTrackSentinel}</a></p>
                    <p>${t.invitationBodyPart4}</p>
                    <br>
                    <p>${t.invitationBodyThankYou}<br>EquipTrack System</p>
                `;

                await EmailService.sendEmail({
                    to: soldier.email,
                    subject: subject,
                    body: body,
                    from_name: "EquipTrack System"
                });
                sentCount++;
            } catch (error) {
                console.error(`Failed to send invitation to ${soldier.email}:`, error);
                errorCount++;
            }
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        alert(t.invitationProcessComplete(sentCount, errorCount));

    } catch (error) {
        console.error("An error occurred during the invitation process:", error);
        alert(t.unexpectedInvitationError);
    }

    setIsInviting(false);
  };

  const filteredSoldiers = soldiers.filter(soldier => {
    const matchesSearch =
      soldier.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      soldier.soldier_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      soldier.platoon?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleAddSoldier = () => {
    setShowAddModal(true);
  };

  const handleSoldierAdded = () => {
    setShowAddModal(false);
    loadData();
  };

  const handleEditSoldier = (soldier) => {
    setSelectedSoldier(soldier);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    setSelectedSoldier(null); // Clear selected soldier after successful edit
    loadData();
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Optionally keep selectedSoldier to allow viewing details after cancelling edit
  };
  
  const selectedSoldierAssignments = selectedSoldier
    ? assignments.filter(a => a.soldier_id === selectedSoldier.soldier_id)
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{t.soldierManagement}</h1>
            <p className="text-slate-600 mt-1">{t.soldierManagementSubtitle}</p>
          </div>
          <div className="flex gap-3">
             <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleInviteAllSoldiers}
              disabled={isInviting}
            >
              <Mail className="w-4 h-4" />
              {isInviting ? t.sendingInvitations : t.inviteAllSoldiers}
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleAddSoldier}
            >
              <Plus className="w-4 h-4" />
              {t.addSoldier}
            </Button>
            <Button className="bg-slate-900 hover:bg-slate-800">
              {t.exportList}
            </Button>
          </div>
        </div>

        {isEditing && selectedSoldier ? (
          <EditSoldierForm
            soldier={selectedSoldier}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
            t={t}
          />
        ) : (
          <>
            {/* Search */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder={t.searchSoldiersByNameIdPlatoon}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Soldiers List */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SoldierList
                  soldiers={filteredSoldiers}
                  isLoading={isLoading}
                  onSelectSoldier={setSelectedSoldier}
                  onAddNewSoldier={handleAddSoldier}
                  t={t}
                />
              </div>

              {/* Soldier Details Sidebar */}
              <div className="space-y-6">
                <SoldierDetail
                  soldier={selectedSoldier}
                  assignments={selectedSoldierAssignments}
                  equipment={equipment}
                  inventoryItems={inventoryItems}
                  onEdit={handleEditSoldier}
                  t={t}
                />
              </div>
            </div>
          </>
        )}

        {/* Add Soldier Modal */}
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