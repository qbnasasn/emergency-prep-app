"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Filter, X, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

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
  categories: string[]
  locations: string[]
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

export function InventoryFilters({ onFilterChange, categories, locations }: InventoryFiltersProps) {
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

  const activeStatusCount = Object.values(stockStatus).filter(Boolean).length

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
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="w-full sm:w-[180px] h-9">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto h-9 justify-between" size="sm">
              <span className="mr-2">Status</span>
              {activeStatusCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 rounded-sm text-[10px] mr-2">
                    {activeStatusCount}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-2 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-stock"
                  checked={stockStatus.inStock}
                  onCheckedChange={(checked) => handleStatusChange("inStock", !!checked)}
                />
                <label htmlFor="in-stock" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  In Stock
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="low-stock"
                  checked={stockStatus.lowStock}
                  onCheckedChange={(checked) => handleStatusChange("lowStock", !!checked)}
                />
                <label htmlFor="low-stock" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Low Stock
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="out-of-stock"
                  checked={stockStatus.outOfStock}
                  onCheckedChange={(checked) => handleStatusChange("outOfStock", !!checked)}
                />
                <label htmlFor="out-of-stock" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Out of Stock
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="expired"
                  checked={stockStatus.expired}
                  onCheckedChange={(checked) => handleStatusChange("expired", !!checked)}
                />
                <label htmlFor="expired" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Expired
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="expiring-soon"
                  checked={stockStatus.expiringSoon}
                  onCheckedChange={(checked) => handleStatusChange("expiringSoon", !!checked)}
                />
                <label htmlFor="expiring-soon" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Expiring Soon
                </label>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {(category !== "all" || location !== "all" || activeStatusCount > 0) && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-9 px-2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4 mr-1" />
                Clear
            </Button>
        )}
      </div>
    </div>
  )
}
