import React, { useState, useEffect } from "react";
import { SupplantingItem, Equipment } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Edit, Trash2, Search, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "@/layout.js";

import AddSupplantingItemModal from "../components/supplanting/AddSupplantingItemModal";
import EditSupplantingItemModal from "../components/supplanting/EditSupplantingItemModal";

export default function SupplantingItemsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [supplantingItems, setSupplantingItems] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [supplantingData, equipmentData] = await Promise.all([
        SupplantingItem.list("-created_date"),
        Equipment.list()
      ]);
      setSupplantingItems(supplantingData);
      setEquipment(equipmentData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const handleDelete = async (item) => {
    if (confirm(`Are you sure you want to delete "${item.supplanting_item_name}" for ${item.equipment_name}?`)) {
      try {
        await SupplantingItem.delete(item.id);
        loadData();
      } catch (error) {
        console.error("Error deleting supplanting item:", error);
        alert("Error deleting item. Please try again.");
      }
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleAddComplete = () => {
    setShowAddModal(false);
    loadData();
  };

  const handleEditComplete = () => {
    setShowEditModal(false);
    setSelectedItem(null);
    loadData();
  };

  // Group supplanting items by equipment
  const groupedItems = supplantingItems.reduce((acc, item) => {
    const equipmentName = item.equipment_name;
    if (!acc[equipmentName]) {
      acc[equipmentName] = [];
    }
    acc[equipmentName].push(item);
    return acc;
  }, {});

  // Filter based on search term
  const filteredGroupedItems = Object.entries(groupedItems).filter(([equipmentName, items]) => {
    const matchesEquipment = equipmentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSupplanting = items.some(item => 
      item.supplanting_item_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesEquipment || matchesSupplanting;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">Supplanting Equipment</h1>
            <p className="text-slate-600 mt-1">Manage additional items that come with main equipment</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Supplanting Item
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search equipment or supplanting items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="p-8 text-center text-slate-500">
              Loading supplanting items...
            </CardContent>
          </Card>
        )}

        {/* No Items State */}
        {!isLoading && filteredGroupedItems.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              {searchTerm ? "No items match your search." : "No supplanting items configured yet."}
              <div className="mt-4">
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Supplanting Item
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Items List */}
        <div className="space-y-6">
          {filteredGroupedItems.map(([equipmentName, items]) => (
            <Card key={equipmentName}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {equipmentName}
                  <Badge variant="secondary" className="ml-2">
                    {items.length} items
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{item.supplanting_item_name}</div>
                        {item.description && (
                          <div className="text-sm text-slate-600 mt-1">{item.description}</div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {item.is_default && (
                            <Badge className="bg-green-100 text-green-800">Default</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <AddSupplantingItemModal
            equipment={equipment}
            onComplete={handleAddComplete}
            onClose={() => setShowAddModal(false)}
          />
        )}

        {/* Edit Modal */}
        {showEditModal && selectedItem && (
          <EditSupplantingItemModal
            item={selectedItem}
            equipment={equipment}
            onComplete={handleEditComplete}
            onClose={() => setShowEditModal(false)}
          />
        )}
      </div>
    </div>
  );
}