"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UtensilsCrossed, Plus, Calendar } from "lucide-react"
import { KnowledgeDocument } from "@/lib/actions/knowledge"
import { DocumentDialog } from "@/components/knowledge/document-dialog"

interface MenuPlannerProps {
    menus: KnowledgeDocument[]
}

export function MenuPlanner({ menus }: MenuPlannerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Use the fetched menus, or show placeholder if empty
  const hasMenus = menus && menus.length > 0

  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <UtensilsCrossed className="h-5 w-5 text-primary" />
          <CardTitle className="font-heading text-xl">Menu Planner</CardTitle>
        </div>
        <Button size="sm" className="font-body dark:bg-orange-500 dark:hover:bg-orange-600 dark:text-white" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Menu
        </Button>
      </CardHeader>
      <CardContent>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-body font-semibold text-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Saved Menus
            </h3>
          </div>

          <div className="space-y-4">
            {!hasMenus ? (
                  <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground">
                      No menus found. Click "New Menu" to add one.
                  </div>
            ) : (
                menus.map((menu) => (
                  <div key={menu.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-body font-semibold text-foreground">{menu.title}</h4>
                      <Badge variant="outline" className="bg-primary/5">{new Date(menu.created_at).toLocaleDateString()}</Badge>
                    </div>

                    <div className="font-body text-sm text-muted-foreground mb-3 line-clamp-3"
                          dangerouslySetInnerHTML={{ __html: menu.content || "" }}
                    />
                  </div>
                ))
            )}
          </div>
      </CardContent>
    </Card>

    <DocumentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {
            window.location.reload();
        }}
        // Pre-fill type as menu
        document={{ title: "", content: "", type: "menu", category: "food-water", tags: [], is_public: false } as any}
    />
    </>
  )
}
