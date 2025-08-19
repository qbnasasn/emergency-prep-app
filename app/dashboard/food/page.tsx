import { FoodPlanningHeader } from "@/components/food/food-planning-header"
import { FoodPlanningOverview } from "@/components/food/food-planning-overview"
import { RationingCalculator } from "@/components/food/rationing-calculator"
import { FoodInventoryAnalysis } from "@/components/food/food-inventory-analysis"
import { MenuPlanner } from "@/components/food/menu-planner"

export default function FoodPlanningPage() {
  return (
    <div className="space-y-6">
      <FoodPlanningHeader />
      <FoodPlanningOverview />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <RationingCalculator />
          <MenuPlanner />
        </div>
        <div>
          <FoodInventoryAnalysis />
        </div>
      </div>
    </div>
  )
}
