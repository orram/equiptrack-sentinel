import React, { useState, useEffect } from "react";
import { InventoryItem } from "@/entities/all";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import InventoryList from "../components/inventory/InventoryList";
import AddInventoryItemModal from "../components/inventory/AddInventoryItemModal";
import AdjustQuantityModal from "../components/inventory/AdjustQuantityModal";
import InventoryDetail from "../components/inventory/InventoryDetail";
import { useLanguage } from "../layout";

export default function InventoryPage() {
  const { t } = useLanguage();
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [itemToAdjust, setItemToAdjust] = useState(null);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const items = await InventoryItem.list("-created_date");
      setInventory(items);
    } catch (error) {
      console.error("Error loading inventory:", error);
    }
    setIsLoading(false);
  };

  const filteredInventory = inventory.filter(item =>
    item.object_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddComplete = () => {
    setShowAddModal(false);
    loadInventory();
  };

  const handleAdjustClick = (item) => {
    setItemToAdjust(item);
    setShowAdjustModal(true);
  };

  const handleAdjustComplete = () => {
    setShowAdjustModal(false);
    setItemToAdjust(null);
    loadInventory();
  };
  
  const handleViewDetails = (item) => {
      setSelectedItem(item);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{t.inventoryManagement}</h1>
            <p className="text-slate-600 mt-1">{t.inventoryManagementSubtitle}</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t.addNewInventoryItem}
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder={t.searchInventoryByNameOrCategory}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <InventoryList
              inventory={filteredInventory}
              isLoading={isLoading}
              onAdjustQuantity={handleAdjustClick}
              onViewDetails={handleViewDetails}
              t={t}
            />
          </div>
          
          <div className="space-y-6">
            <InventoryDetail
                item={selectedItem}
                t={t}
            />
          </div>
        </div>
      </div>
      
      {showAddModal && (
        <AddInventoryItemModal
          onComplete={handleAddComplete}
          onClose={() => setShowAddModal(false)}
          t={t}
        />
      )}
      
      {showAdjustModal && itemToAdjust && (
        <AdjustQuantityModal
          item={itemToAdjust}
          onComplete={handleAdjustComplete}
          onClose={() => setShowAdjustModal(false)}
          t={t}
        />
      )}
    </div>
  );
}