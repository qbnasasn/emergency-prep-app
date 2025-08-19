import { Suspense } from "react"
import { KitsHeader } from "@/components/kits/kits-header"
import { KitsOverview } from "@/components/kits/kits-overview"
import { KitsList } from "@/components/kits/kits-list"

export default function KitsPage() {
  return (
    <div className="space-y-6">
      <KitsHeader />
      <Suspense fallback={<div>Loading kits overview...</div>}>
        <KitsOverview />
      </Suspense>
      <Suspense fallback={<div>Loading kits...</div>}>
        <KitsList />
      </Suspense>
    </div>
  )
}
