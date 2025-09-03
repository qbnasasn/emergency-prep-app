"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UtensilsCrossed, Plus, Calendar, ChefHat } from "lucide-react"

interface MealPlan {
  day: string
  breakfast: string
  lunch: string
  dinner: string
  calories: number
  ingredients: string[]
}

const sampleMealPlans: MealPlan[] = [
  {
    day: "Day 1",
    breakfast: "Oatmeal with dried fruit",
    lunch: "Canned soup with crackers",
    dinner: "Rice with canned chicken",
    calories: 1850,
    ingredients: ["Oats", "Dried fruit", "Canned soup", "Crackers", "Rice", "Canned chicken"],
  },
  {
    day: "Day 2",
    breakfast: "Granola with powdered milk",
    lunch: "Peanut butter sandwiches",
    dinner: "Pasta with canned tomatoes",
    calories: 1920,
    ingredients: ["Granola", "Powdered milk", "Bread", "Peanut butter", "Pasta", "Canned tomatoes"],
  },
  {
    day: "Day 3",
    breakfast: "Instant pancakes",
    lunch: "Tuna with crackers",
    dinner: "Beans and rice",
    calories: 1780,
    ingredients: ["Pancake mix", "Canned tuna", "Crackers", "Beans", "Rice"],
  },
]

export function MenuPlanner() {
  const [mealPlans] = useState<MealPlan[]>(sampleMealPlans)
  const [activeTab, setActiveTab] = useState("weekly")

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <UtensilsCrossed className="h-5 w-5 text-green-500" />
          <CardTitle className="font-heading text-xl">Menu Planner</CardTitle>
        </div>
        <Button size="sm" className="font-body">
          <Plus className="h-4 w-4 mr-2" />
          Generate Menu
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly" className="font-body">
              Weekly Plan
            </TabsTrigger>
            <TabsTrigger value="recipes" className="font-body">
              Emergency Recipes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-body font-semibold text-foreground flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                3-Day Emergency Menu
              </h3>
              <Badge className="bg-blue-100 text-blue-800">Auto-generated from inventory</Badge>
            </div>

            <div className="space-y-4">
              {mealPlans.map((plan) => (
                <div key={plan.day} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-body font-semibold text-foreground">{plan.day}</h4>
                    <Badge className="bg-green-100 text-green-800">{plan.calories} calories</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <div className="font-body text-sm font-medium text-muted-foreground">Breakfast</div>
                      <div className="font-body text-sm text-muted-foreground">{plan.breakfast}</div>
                    </div>
                    <div>
                      <div className="font-body text-sm font-medium text-muted-foreground">Lunch</div>
                      <div className="font-body text-sm text-muted-foreground">{plan.lunch}</div>
                    </div>
                    <div>
                      <div className="font-body text-sm font-medium text-muted-foreground">Dinner</div>
                      <div className="font-body text-sm text-muted-foreground">{plan.dinner}</div>
                    </div>
                  </div>

                  <div>
                    <div className="font-body text-xs font-medium text-muted-foreground mb-1">Required Ingredients:</div>
                    <div className="flex flex-wrap gap-1">
                      {plan.ingredients.map((ingredient, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="font-body text-sm text-blue-800">
                <strong>Menu automatically generated</strong> based on your current food inventory. Adjust portions
                based on family size and activity level.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="recipes" className="space-y-4">
            <div className="flex items-center mb-4">
              <ChefHat className="h-4 w-4 mr-2 text-orange-500" />
              <h3 className="font-body font-semibold text-foreground">Emergency Cooking Recipes</h3>
            </div>

            <div className="space-y-4">
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

            <Button variant="outline" className="w-full font-body bg-transparent">
              View All Emergency Recipes
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
