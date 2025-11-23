"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Package, TrendingUp, AlertTriangle } from "lucide-react"

interface FoodCategory {
  name: string
  items: number
  calories: number
  percentage: number
  status: "good" | "low" | "critical"
}

interface FoodInventoryAnalysisProps {
    categories: FoodCategory[]
}

export function FoodInventoryAnalysis({ categories }: FoodInventoryAnalysisProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "bg-green-100 text-green-800"
      case "low":
        return "bg-yellow-100 text-yellow-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-muted text-foreground"
    }
  }

  const totalCalories = categories.reduce((sum, cat) => sum + cat.calories, 0)
  const totalItems = categories.reduce((sum, cat) => sum + cat.items, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center">
          <Package className="h-5 w-5 mr-2 text-primary" />
          Food Inventory Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <div className="text-2xl font-heading font-bold text-blue-900">{totalItems}</div>
            <div className="font-body text-sm text-blue-700">Total Food Items</div>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <div className="text-2xl font-heading font-bold text-green-900">{totalCalories.toLocaleString()}</div>
            <div className="font-body text-sm text-green-700">Total Calories</div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-body font-semibold text-foreground flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Food Categories
          </h3>
          <div className="space-y-4">
            {categories.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                    No food inventory data found. Add items to "Food & Water" category with a "Nutrition Type" to see analysis.
                </div>
            ) : (
                categories.map((category) => (
                <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="font-body font-medium text-foreground">{category.name}</span>
                        <Badge className={getStatusColor(category.status)}>{category.status}</Badge>
                    </div>
                    <div className="text-right">
                        <div className="font-body text-sm font-medium text-foreground">{category.items} items</div>
                        <div className="font-body text-xs text-muted-foreground">{category.calories.toLocaleString()} cal</div>
                    </div>
                    </div>
                    <div className="space-y-1">
                    <Progress value={category.percentage} className="h-2" />
                    <div className="flex justify-between text-xs font-body text-muted-foreground">
                        <span>{category.percentage.toFixed(1)}% of total calories</span>
                    </div>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-body font-semibold text-foreground flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Nutritional Balance
          </h3>
          <div className="space-y-2">
            <div className="p-3 bg-primary/10 rounded-lg">
              <div className="font-body text-sm text-green-800">
                <strong>Well Stocked:</strong> Grains, proteins, and vegetables provide good foundation
              </div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="font-body text-sm text-yellow-800">
                <strong>Consider Adding:</strong> More fruits, dairy alternatives, and healthy fats
              </div>
            </div>
            <div className="p-3 bg-destructive/10 rounded-lg">
              <div className="font-body text-sm text-red-800">
                <strong>Critical Need:</strong> Cooking oils and beverages are running low
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
