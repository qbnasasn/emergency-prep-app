"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UtensilsCrossed, Plus, Calendar, ChefHat } from "lucide-react"
import { KnowledgeDocument } from "@/lib/actions/knowledge"
import { DocumentDialog } from "@/components/knowledge/document-dialog"
// import parse from "html-react-parser"
// import DOMPurify from "isomorphic-dompurify"

interface MenuPlannerProps {
    menus: KnowledgeDocument[]
}

export function MenuPlanner({ menus }: MenuPlannerProps) {
  const [activeTab, setActiveTab] = useState("weekly")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
        <Button size="sm" className="font-body" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Menu
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly" className="font-body">
              Favorite Menus
            </TabsTrigger>
            <TabsTrigger value="recipes" className="font-body">
              Emergency Recipes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-4">
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

                      {/* We could add a "View" button here if we wanted to open the full doc */}
                    </div>
                  ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="recipes" className="space-y-4">
            <div className="flex items-center mb-4">
              <ChefHat className="h-4 w-4 mr-2 text-primary" />
              <h3 className="font-body font-semibold text-foreground">Emergency Cooking Recipes</h3>
            </div>

            <div className="space-y-4">
              {/* Static recipes for now, or fetch from KB too if we had a 'recipe' type */}
              <div className="border border-border rounded-lg p-4">
                <h4 className="font-body font-semibold text-foreground mb-2">One-Pot Rice and Beans</h4>
                <div className="font-body text-sm text-muted-foreground mb-2">
                  High protein, filling meal using shelf-stable ingredients
                </div>
                <div className="font-body text-xs text-muted-foreground">
                  Ingredients: Rice, canned beans, onion powder, salt • Serves 4 • 320 cal/serving
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <h4 className="font-body font-semibold text-foreground mb-2">Emergency Pancakes</h4>
                <div className="font-body text-sm text-muted-foreground mb-2">Quick breakfast using basic pantry staples</div>
                <div className="font-body text-xs text-muted-foreground">
                  Ingredients: Flour, baking powder, salt, powdered milk • Serves 4 • 180 cal/serving
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <h4 className="font-body font-semibold text-foreground mb-2">Hearty Soup Mix</h4>
                <div className="font-body text-sm text-muted-foreground mb-2">
                  Nutritious soup combining multiple canned ingredients
                </div>
                <div className="font-body text-xs text-muted-foreground">
                  Ingredients: Canned vegetables, broth, pasta, herbs • Serves 6 • 150 cal/serving
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

    <DocumentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {
            // Refresh logic? Since this is a client component receiving props,
            // we'd need to refresh the page or use a router refresh.
            // window.location.reload() or router.refresh()
            window.location.reload();
        }}
        // Pre-fill type as menu
        document={{ title: "", content: "", type: "menu", category: "food-water", tags: [], is_public: false } as any}
    />
    </>
  )
}
