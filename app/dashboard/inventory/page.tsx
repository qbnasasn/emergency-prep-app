"use client"

import { useState } from "react"
import { InventoryHeader } from "@/components/inventory/inventory-header"
import { InventoryStats } from "@/components/inventory/inventory-stats"
import { InventoryTable } from "@/components/inventory/inventory-table"
import { InventoryFilters, FilterState, initialFilterState } from "@/components/inventory/inventory-filters"

export default function InventoryPage() {
  const [filters, setFilters] = useState<FilterState>(initialFilterState)

  return (
    <div className="space-y-6">
      <InventoryHeader />
      <InventoryStats />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <InventoryFilters onFilterChange={setFilters} />
        </div>
        <div className="lg:col-span-3">
          <InventoryTable filters={filters} />
        </div>
      </div>
    </div>
  )
}
