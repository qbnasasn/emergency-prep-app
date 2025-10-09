"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"
import { useState, useEffect } from "react"

const categories = [
  "Food & Water",
  "Medical Supplies",
  "Tools & Equipment",
  "Clothing & Shelter",
  "Communication",
  "Power & Lighting",
  "Personal Care",
  "Documents",
]

const locations = ["Home - Kitchen", "Home - Basement", "Home - Garage", "Vehicle", "Office", "Storage Unit"]

export interface FilterState {
  category: string
  location: string
  stockStatus: {
    inStock: boolean
    lowStock: boolean
    outOfStock: boolean
    expired: boolean
    expiringSoon: boolean
  }
}

interface InventoryFiltersProps {
  onFilterChange: (filters: FilterState) => void
}

export const initialFilterState: FilterState = {
  category: "all",
  location: "all",
  stockStatus: {
    inStock: false,
    lowStock: false,
    outOfStock: false,
    expired: false,
    expiringSoon: false,
  },
}

export function InventoryFilters({ onFilterChange }: InventoryFiltersProps) {
  const [category, setCategory] = useState(initialFilterState.category)
  const [location, setLocation] = useState(initialFilterState.location)
  const [stockStatus, setStockStatus] = useState(initialFilterState.stockStatus)

  useEffect(() => {
    onFilterChange({ category, location, stockStatus })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, location, stockStatus])

  const handleStatusChange = (status: keyof FilterState["stockStatus"], checked: boolean) => {
    setStockStatus((prev) => ({ ...prev, [status]: checked }))
  }

  const handleClearFilters = () => {
    setCategory(initialFilterState.category)
    setLocation(initialFilterState.location)
    setStockStatus(initialFilterState.stockStatus)
  }

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
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="font-body font-medium">Location</Label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="font-body">
              <SelectValue placeholder="All locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="font-body font-medium">Stock Status</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="in-stock"
                checked={stockStatus.inStock}
                onCheckedChange={(checked) => handleStatusChange("inStock", !!checked)}
              />
              <Label htmlFor="in-stock" className="font-body text-sm">
                In Stock
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="low-stock"
                checked={stockStatus.lowStock}
                onCheckedChange={(checked) => handleStatusChange("lowStock", !!checked)}
              />
              <Label htmlFor="low-stock" className="font-body text-sm">
                Low Stock
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="out-of-stock"
                checked={stockStatus.outOfStock}
                onCheckedChange={(checked) => handleStatusChange("outOfStock", !!checked)}
              />
              <Label htmlFor="out-of-stock" className="font-body text-sm">
                Out of Stock
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="expired"
                checked={stockStatus.expired}
                onCheckedChange={(checked) => handleStatusChange("expired", !!checked)}
              />
              <Label htmlFor="expired" className="font-body text-sm">
                Expired
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="expiring-soon"
                checked={stockStatus.expiringSoon}
                onCheckedChange={(checked) => handleStatusChange("expiringSoon", !!checked)}
              />
              <Label htmlFor="expiring-soon" className="font-body text-sm">
                Expiring Soon
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
