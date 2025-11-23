import { FoodPlanningHeader } from "@/components/food/food-planning-header"
import { FoodPlanningOverview } from "@/components/food/food-planning-overview"
import { RationingCalculator } from "@/components/food/rationing-calculator"
import { FoodInventoryAnalysis } from "@/components/food/food-inventory-analysis"
import { MenuPlanner } from "@/components/food/menu-planner"
import { getFoodPageData, getMenus } from "@/lib/actions/food"

export default async function FoodPlanningPage() {
  const { familyMembers, totalCalories, foodAnalysis } = await getFoodPageData()
  const menus = await getMenus()

  return (
    <div className="space-y-6">
      <FoodPlanningHeader />
      <FoodPlanningOverview />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <RationingCalculator
            initialFamilyMembers={familyMembers}
            initialTotalCalories={totalCalories}
          />
          <MenuPlanner menus={menus} />
        </div>
        <div>
          <FoodInventoryAnalysis categories={foodAnalysis} />
        </div>
      </div>
    </div>
  )
}
