"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Filter, X, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import { INVENTORY_CATEGORIES } from "@/lib/constants"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

const stores = ["Amazon", "Walmart", "Local Grocery", "Hardware Store", "Medical Supply Co"]

export interface ShoppingFilterState {
  category: string;
  store: string;
  priority: {
    urgent: boolean;
    lowStock: boolean;
    expiring: boolean;
    manual: boolean;
  };
}

export const initialShoppingFilterState: ShoppingFilterState = {
  category: "all",
  store: "all",
  priority: {
    urgent: false,
    lowStock: false,
    expiring: false,
    manual: false,
  },
};

interface ShoppingFiltersProps {
  onFilterChange: (filters: ShoppingFilterState) => void;
}

export function ShoppingFilters({ onFilterChange }: ShoppingFiltersProps) {
  const [category, setCategory] = useState(initialShoppingFilterState.category);
  const [store, setStore] = useState(initialShoppingFilterState.store);
  const [priority, setPriority] = useState(initialShoppingFilterState.priority);

  useEffect(() => {
    onFilterChange({ category, store, priority });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, store, priority]);

  const handlePriorityChange = (key: keyof ShoppingFilterState["priority"], checked: boolean) => {
    setPriority((prev) => ({ ...prev, [key]: checked }));
  };

  const handleClearFilters = () => {
    setCategory(initialShoppingFilterState.category);
    setStore(initialShoppingFilterState.store);
    setPriority(initialShoppingFilterState.priority);
  };

  const activePriorityCount = Object.values(priority).filter(Boolean).length

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center bg-card border rounded-lg p-3 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground mr-2">
        <Filter className="h-4 w-4" />
        <span className="font-medium text-sm hidden sm:inline">Filters:</span>
      </div>

      <div className="grid grid-cols-2 sm:flex sm:flex-1 gap-4 w-full sm:w-auto items-center">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-[180px] h-9">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {INVENTORY_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={store} onValueChange={setStore}>
          <SelectTrigger className="w-full sm:w-[180px] h-9">
            <SelectValue placeholder="Store" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stores</SelectItem>
            {stores.map((store) => (
              <SelectItem key={store} value={store}>
                {store}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto h-9 justify-between" size="sm">
              <span className="mr-2">Priority</span>
               {activePriorityCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 rounded-sm text-[10px] mr-2">
                    {activePriorityCount}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-2 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="urgent"
                  checked={priority.urgent}
                  onCheckedChange={(checked) => handlePriorityChange("urgent", !!checked)}
                />
                <label htmlFor="urgent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Urgent (Out of Stock)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="low-stock"
                  checked={priority.lowStock}
                  onCheckedChange={(checked) => handlePriorityChange("lowStock", !!checked)}
                />
                <label htmlFor="low-stock" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Low Stock
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="expiring"
                  checked={priority.expiring}
                  onCheckedChange={(checked) => handlePriorityChange("expiring", !!checked)}
                />
                <label htmlFor="expiring" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Expiring Soon
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="manual"
                  checked={priority.manual}
                  onCheckedChange={(checked) => handlePriorityChange("manual", !!checked)}
                />
                <label htmlFor="manual" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Manually Added
                </label>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {(category !== "all" || store !== "all" || activePriorityCount > 0) && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-9 px-2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4 mr-1" />
                Clear
            </Button>
        )}
      </div>
    </div>
  )
}
