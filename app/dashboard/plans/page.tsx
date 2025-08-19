import { PlansHeader } from "@/components/plans/plans-header"
import { PlansOverview } from "@/components/plans/plans-overview"
import { PlansList } from "@/components/plans/plans-list"

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <PlansHeader />
      <PlansOverview />
      <PlansList />
    </div>
  )
}
