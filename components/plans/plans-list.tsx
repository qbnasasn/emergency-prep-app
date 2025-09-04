"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit, Trash2, Play, Printer, MapPin, Users } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface EmergencyPlan {
  id: string
  name: string
  hazardType: string
  status: "draft" | "complete" | "active"
  lastUpdated: string
  locations: number
  familyMembers: number
  pets: number
  inventoryItems: number
  routes: number
}

const mockPlansData: EmergencyPlan[] = [
  {
    id: "1",
    name: "Severe Weather Response",
    hazardType: "Weather",
    status: "complete",
    lastUpdated: "2024-12-20",
    locations: 3,
    familyMembers: 4,
    pets: 2,
    inventoryItems: 45,
    routes: 2,
  },
  {
    id: "2",
    name: "Earthquake Preparedness",
    hazardType: "Geological",
    status: "complete",
    lastUpdated: "2024-12-18",
    locations: 4,
    familyMembers: 4,
    pets: 2,
    inventoryItems: 38,
    routes: 3,
  },
  {
    id: "3",
    name: "Wildfire Evacuation",
    hazardType: "Fire",
    status: "draft",
    lastUpdated: "2024-12-15",
    locations: 2,
    familyMembers: 4,
    pets: 2,
    inventoryItems: 22,
    routes: 1,
  },
  {
    id: "4",
    name: "Flood Response",
    hazardType: "Weather",
    status: "complete",
    lastUpdated: "2024-12-10",
    locations: 3,
    familyMembers: 4,
    pets: 2,
    inventoryItems: 31,
    routes: 2,
  },
  {
    id: "5",
    name: "Power Outage Extended",
    hazardType: "Infrastructure",
    status: "active",
    lastUpdated: "2024-12-22",
    locations: 1,
    familyMembers: 4,
    pets: 2,
    inventoryItems: 28,
    routes: 0,
  },
]

export function PlansList() {
  const [plans] = useState<EmergencyPlan[]>(mockPlansData)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-muted text-foreground"
      case "complete":
        return "bg-green-100 text-green-800"
      case "active":
        return "bg-red-100 text-red-800"
      default:
        return "bg-muted text-foreground"
    }
  }

  const getHazardColor = (hazardType: string) => {
    switch (hazardType) {
      case "Weather":
        return "bg-blue-100 text-blue-800"
      case "Geological":
        return "bg-orange-100 text-orange-800"
      case "Fire":
        return "bg-red-100 text-red-800"
      case "Infrastructure":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-muted text-foreground"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const activatePlan = (planId: string) => {
    // TODO: Implement plan activation workflow
    console.log("Activating plan:", planId)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl">Emergency Plans</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="border border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="font-body font-semibold text-lg text-foreground">{plan.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={getHazardColor(plan.hazardType)}>{plan.hazardType}</Badge>
                      <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="font-body">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Plan
                      </DropdownMenuItem>
                      <DropdownMenuItem className="font-body">
                        <Printer className="mr-2 h-4 w-4" />
                        Print Plan
                      </DropdownMenuItem>
                      <DropdownMenuItem className="font-body text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Plan
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-body text-muted-foreground">{plan.locations} locations</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-body text-muted-foreground">{plan.familyMembers} members</span>
                    </div>
                  </div>

                  <div className="text-sm font-body text-muted-foreground">
                    <div>Inventory items: {plan.inventoryItems}</div>
                    <div>Evacuation routes: {plan.routes}</div>
                    <div>Pets included: {plan.pets}</div>
                  </div>

                  <div className="text-xs font-body text-muted-foreground">Last updated: {formatDate(plan.lastUpdated)}</div>

                  <div className="flex space-x-2 pt-2">
                    {plan.status === "complete" && (
                      <Button
                        size="sm"
                        onClick={() => activatePlan(plan.id)}
                        className="flex-1 font-body bg-destructive hover:bg-red-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Activate
                      </Button>
                    )}
                    {plan.status === "active" && (
                      <Button size="sm" variant="outline" className="flex-1 font-body bg-transparent">
                        <Play className="h-4 w-4 mr-2" />
                        Active
                      </Button>
                    )}
                    {plan.status === "draft" && (
                      <Button size="sm" variant="outline" className="flex-1 font-body bg-transparent">
                        <Edit className="h-4 w-4 mr-2" />
                        Continue
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
