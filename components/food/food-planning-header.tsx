"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Calculator, FileText } from "lucide-react"
import { useState } from "react"

export function FoodPlanningHeader() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
      <div>
        <h1 className="font-heading font-black text-3xl text-foreground">Food Planning</h1>
        <p className="font-body text-muted-foreground mt-1">Emergency food rationing and menu planning system</p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search food items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64 font-body"
          />
        </div>

        <Button variant="outline" size="sm" className="font-body bg-transparent">
          <Calculator className="h-4 w-4 mr-2" />
          Nutrition Calculator
        </Button>

        <Button variant="outline" size="sm" className="font-body bg-transparent">
          <FileText className="h-4 w-4 mr-2" />
          Export Plan
        </Button>

        <Button className="font-body">
          <Plus className="h-4 w-4 mr-2" />
          New Menu
        </Button>
      </div>
    </div>
  )
}
