import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X, Plus, Settings } from "lucide-react";

export default function SupplantingItemsInput({ 
  equipmentName,
  availableItems = [],
  selectedItems = [],
  onSelectionChange,
  placeholder = "Add supplanting items..."
}) {
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filter items based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = availableItems.filter(item =>
        item.supplanting_item_name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedItems.includes(item.supplanting_item_name)
      );
      setFilteredItems(filtered);
      setShowDropdown(filtered.length > 0 || inputValue.trim().length > 0);
    } else {
      setFilteredItems([]);
      setShowDropdown(false);
    }
  }, [inputValue, availableItems, selectedItems]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectItem = (itemName) => {
    if (!selectedItems.includes(itemName)) {
      onSelectionChange([...selectedItems, itemName]);
    }
    setInputValue("");
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleAddManual = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !selectedItems.includes(trimmed)) {
      onSelectionChange([...selectedItems, trimmed]);
      setInputValue("");
      setShowDropdown(false);
    }
  };

  const handleRemoveItem = (itemName) => {
    onSelectionChange(selectedItems.filter(item => item !== itemName));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // If there's a filtered item, select the first one
      if (filteredItems.length > 0) {
        handleSelectItem(filteredItems[0].supplanting_item_name);
      } 
      // Otherwise add as manual item
      else if (inputValue.trim()) {
        handleAddManual();
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setInputValue("");
    }
  };

  return (
    <div className="border-t pt-3 mt-3">
      <div className="flex items-center gap-2 mb-3">
        <Settings className="w-4 h-4 text-slate-600" />
        <Label className="font-medium text-slate-700">Supplanting Items</Label>
      </div>

      {/* Selected Items */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedItems.map((item, idx) => (
            <Badge key={idx} variant="secondary" className="flex items-center gap-1">
              {item}
              <button
                type="button"
                onClick={() => handleRemoveItem(item)}
                className="hover:bg-slate-300 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input with dropdown */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (inputValue.trim()) {
                  setShowDropdown(true);
                }
              }}
              placeholder={placeholder}
              className="h-8 text-sm"
            />
            
            {/* Dropdown */}
            {showDropdown && (
              <div 
                ref={dropdownRef}
                className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto mt-1"
              >
                {/* Existing configured items */}
                {filteredItems.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectItem(item.supplanting_item_name)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 text-sm flex items-center justify-between"
                  >
                    <span>{item.supplanting_item_name}</span>
                    {item.is_default && (
                      <Badge variant="outline" className="text-xs">default</Badge>
                    )}
                  </button>
                ))}
                
                {/* Add manual item option */}
                {inputValue.trim() && 
                 !availableItems.some(item => item.supplanting_item_name.toLowerCase() === inputValue.toLowerCase()) &&
                 !selectedItems.includes(inputValue.trim()) && (
                  <button
                    type="button"
                    onClick={handleAddManual}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 text-sm border-t flex items-center gap-2 text-blue-600"
                  >
                    <Plus className="w-3 h-3" />
                    Add "{inputValue.trim()}"
                  </button>
                )}
                
                {/* No results */}
                {filteredItems.length === 0 && inputValue.trim() && 
                 availableItems.some(item => item.supplanting_item_name.toLowerCase() === inputValue.toLowerCase()) && (
                  <div className="px-3 py-2 text-sm text-slate-500">
                    Item already selected
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Manual add button */}
          {inputValue.trim() && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddManual}
              className="h-8"
            >
              <Plus className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Helper text */}
      <p className="text-xs text-slate-500 mt-2">
        Type to search existing items or add new ones. Press Enter to add.
      </p>
    </div>
  );
}