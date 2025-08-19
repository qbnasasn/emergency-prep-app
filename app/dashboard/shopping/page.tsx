import { ShoppingHeader } from "@/components/shopping/shopping-header"
import { ShoppingStats } from "@/components/shopping/shopping-stats"
import { ShoppingList } from "@/components/shopping/shopping-list"
import { ShoppingFilters } from "@/components/shopping/shopping-filters"

export default function ShoppingPage() {
  return (
    <div className="space-y-6">
      <ShoppingHeader />
      <ShoppingStats />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ShoppingFilters />
        </div>
        <div className="lg:col-span-3">
          <ShoppingList />
        </div>
      </div>
    </div>
  )
}
