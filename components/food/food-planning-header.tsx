"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"
import { DocumentDialog } from "@/components/knowledge/document-dialog"

export function FoodPlanningHeader() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
      <div>
        <h1 className="font-heading font-black text-3xl text-foreground">Food Planning</h1>
        <p className="font-body text-muted-foreground mt-1">Emergency food rationing and menu planning system</p>
      </div>

      <div className="flex items-center space-x-4">
        <Button
            className="font-body bg-gray-900 hover:bg-gray-800"
            onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Menu
        </Button>
      </div>

       <DocumentDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onSuccess={() => {
                window.location.reload();
            }}
            document={{ title: "", content: "", type: "menu", category: "food-water", tags: [], is_public: false } as any}
        />
    </div>
  )
}
