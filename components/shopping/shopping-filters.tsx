"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"
import { useState, useEffect } from "react"
import { INVENTORY_CATEGORIES } from "@/lib/constants"

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="font-heading text-lg">Filters</CardTitle>
        </div>
        <Button variant="ghost" size="sm" onClick={handleClearFilters}>
          <X className="h-4 w-4" />
          <span className="sr-only">Clear filters</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="font-body font-medium">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="font-body">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {INVENTORY_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="font-body font-medium">Preferred Store</Label>
          <Select value={store} onValueChange={setStore}>
            <SelectTrigger className="font-body">
              <SelectValue placeholder="All stores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stores</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store} value={store}>
                  {store}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="font-body font-medium">Priority</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="urgent"
                checked={priority.urgent}
                onCheckedChange={(checked) => handlePriorityChange("urgent", !!checked)}
              />
              <Label htmlFor="urgent" className="font-body text-sm">
                Urgent (Out of Stock)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="low-stock"
                checked={priority.lowStock}
                onCheckedChange={(checked) => handlePriorityChange("lowStock", !!checked)}
              />
              <Label htmlFor="low-stock" className="font-body text-sm">
                Low Stock
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="expiring"
                checked={priority.expiring}
                onCheckedChange={(checked) => handlePriorityChange("expiring", !!checked)}
              />
              <Label htmlFor="expiring" className="font-body text-sm">
                Expiring Soon
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="manual"
                checked={priority.manual}
                onCheckedChange={(checked) => handlePriorityChange("manual", !!checked)}
              />
              <Label htmlFor="manual" className="font-body text-sm">
                Manually Added
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
