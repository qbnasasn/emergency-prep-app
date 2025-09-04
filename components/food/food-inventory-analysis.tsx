"use client"

import { useState } from "react"
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

const foodCategories: FoodCategory[] = [
  {
    name: "Grains & Carbohydrates",
    items: 32,
    calories: 28450,
    percentage: 32.6,
    status: "good",
  },
  {
    name: "Proteins",
    items: 24,
    calories: 18720,
    percentage: 21.5,
    status: "good",
  },
  {
    name: "Canned Vegetables",
    items: 28,
    calories: 12880,
    percentage: 14.8,
    status: "good",
  },
  {
    name: "Fruits & Snacks",
    items: 18,
    calories: 11340,
    percentage: 13.0,
    status: "low",
  },
  {
    name: "Dairy & Alternatives",
    items: 12,
    calories: 8760,
    percentage: 10.0,
    status: "low",
  },
  {
    name: "Fats & Oils",
    items: 8,
    calories: 5280,
    percentage: 6.1,
    status: "critical",
  },
  {
    name: "Beverages",
    items: 5,
    calories: 1810,
    percentage: 2.1,
    status: "critical",
  },
]

export function FoodInventoryAnalysis() {
  const [categories] = useState<FoodCategory[]>(foodCategories)

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

  const getProgressColor = (status: string) => {
    switch (status) {
      case "good":
        return "bg-primary/100"
      case "low":
        return "bg-yellow-500"
      case "critical":
        return "bg-destructive"
      default:
        return "bg-gray-500"
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
            {categories.map((category) => (
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
                    <span>{category.percentage}% of total calories</span>
                  </div>
                </div>
              </div>
            ))}
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
