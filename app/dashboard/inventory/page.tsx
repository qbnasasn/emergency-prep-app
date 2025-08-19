import { InventoryHeader } from "@/components/inventory/inventory-header"
import { InventoryStats } from "@/components/inventory/inventory-stats"
import { InventoryTable } from "@/components/inventory/inventory-table"
import { InventoryFilters } from "@/components/inventory/inventory-filters"

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <InventoryHeader />
      <InventoryStats />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <InventoryFilters />
        </div>
        <div className="lg:col-span-3">
          <InventoryTable />
        </div>
      </div>
    </div>
  )
}
