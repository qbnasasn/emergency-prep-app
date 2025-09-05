"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, MapPin, Save } from "lucide-react"
import { FamilyMembers } from "./family-members"

export function UserSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center">
          <User className="h-5 w-5 mr-2 text-primary" />
          User Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FamilyMembers />
        <div className="space-y-4">
          <h3 className="font-body font-semibold text-foreground flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            NOAA Alert Locations
          </h3>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="font-body text-sm">Primary Location</Label>
              <Input placeholder="City, State or ZIP code" className="font-body" />
            </div>
            <div className="space-y-2">
              <Label className="font-body text-sm">Secondary Location</Label>
              <Input placeholder="City, State or ZIP code" className="font-body" />
            </div>
            <Button variant="outline" size="sm" className="font-body bg-transparent">
              Add Location
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-body font-semibold text-foreground">Subscription</h3>
          <div className="p-3 bg-primary/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body font-medium text-green-800">Premium Plan</p>
                <p className="font-body text-sm text-green-600">All features included</p>
              </div>
              <Button variant="outline" size="sm" className="font-body bg-transparent">
                Manage
              </Button>
            </div>
          </div>
        </div>

        <Button className="w-full font-body bg-gray-900 hover:bg-gray-800">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </CardContent>
    </Card>
  )
}
