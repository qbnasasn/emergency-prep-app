"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import { DashboardMap } from "./DashboardMap"

export function EmergencyMap() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-primary" />
          <CardTitle className="font-heading text-xl">Emergency Map</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <DashboardMap />
      </CardContent>
    </Card>
  )
}