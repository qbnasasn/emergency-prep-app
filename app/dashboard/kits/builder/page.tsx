import { Suspense } from "react"
import { KitBuilder } from "@/components/kits/kit-builder"

export default function KitBuilderPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-sans">Kit Builder</h1>
        <p className="text-muted-foreground">Create and customize your emergency preparedness kits</p>
      </div>
      <Suspense fallback={<div>Loading kit builder...</div>}>
        <KitBuilder />
      </Suspense>
    </div>
  )
}
