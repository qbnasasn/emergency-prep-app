"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Save, Plus, MapPin, Users, Package, Route, Heart, Pill, Phone, FileText, AlertTriangle } from "lucide-react"

const hazardTypes = [
  "Severe Weather",
  "Earthquake",
  "Wildfire",
  "Flood",
  "Hurricane",
  "Tornado",
  "Winter Storm",
  "Power Outage",
  "Chemical Spill",
  "Terrorism",
  "Pandemic",
  "Cyber Attack",
]

export function PlanBuilder() {
  const [planName, setPlanName] = useState("")
  const [hazardType, setHazardType] = useState("")
  const [activeTab, setActiveTab] = useState("basic")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-black text-3xl text-gray-900">Emergency Plan Builder</h1>
          <p className="font-body text-gray-600 mt-1">
            Create comprehensive emergency plans based on NOAA All-Hazards CONOPS
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="font-body bg-transparent">
            <FileText className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button className="font-body bg-gray-900 hover:bg-gray-800">
            <Save className="h-4 w-4 mr-2" />
            Save Plan
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">Plan Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="plan-name" className="font-body font-medium">
                Plan Name
              </Label>
              <Input
                id="plan-name"
                placeholder="Enter plan name"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="font-body"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hazard-type" className="font-body font-medium">
                Hazard Type
              </Label>
              <Select value={hazardType} onValueChange={setHazardType}>
                <SelectTrigger className="font-body">
                  <SelectValue placeholder="Select hazard type" />
                </SelectTrigger>
                <SelectContent>
                  {hazardTypes.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, "-")}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-body font-medium">
              Plan Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the purpose and scope of this emergency plan"
              className="font-body"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic" className="font-body">
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="locations" className="font-body">
            Locations
          </TabsTrigger>
          <TabsTrigger value="family" className="font-body">
            Family & Pets
          </TabsTrigger>
          <TabsTrigger value="inventory" className="font-body">
            Inventory
          </TabsTrigger>
          <TabsTrigger value="routes" className="font-body">
            Routes
          </TabsTrigger>
          <TabsTrigger value="contacts" className="font-body">
            Contacts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                Hazard Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="font-body font-medium">Risk Level</Label>
                <Select>
                  <SelectTrigger className="font-body">
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="moderate">Moderate Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="extreme">Extreme Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-body font-medium">Seasonal Considerations</Label>
                <Textarea
                  placeholder="Describe seasonal factors that affect this hazard"
                  className="font-body"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-body font-medium">Warning Signs</Label>
                <Textarea placeholder="List early warning signs and indicators" className="font-body" rows={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-lg flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                Key Locations
              </CardTitle>
              <Button size="sm" className="font-body">
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-body font-semibold">Primary Residence</h3>
                    <Badge className="bg-blue-100 text-blue-800">Home</Badge>
                  </div>
                  <div className="space-y-2">
                    <Input placeholder="Street address" className="font-body" />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="City" className="font-body" />
                      <Input placeholder="ZIP Code" className="font-body" />
                    </div>
                    <Textarea placeholder="Special considerations for this location" className="font-body" rows={2} />
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-body font-semibold">Safe Meeting Point</h3>
                    <Badge className="bg-green-100 text-green-800">Safe Zone</Badge>
                  </div>
                  <div className="space-y-2">
                    <Input placeholder="Location name or address" className="font-body" />
                    <Textarea
                      placeholder="Why this location is safe and how to get there"
                      className="font-body"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="family" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-heading text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-500" />
                  Family Members
                </CardTitle>
                <Button size="sm" className="font-body">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Full name" className="font-body" />
                    <Input placeholder="Age" className="font-body" />
                  </div>
                  <div className="mt-3 space-y-2">
                    <Input placeholder="Phone number" className="font-body" />
                    <Textarea placeholder="Special needs or medical conditions" className="font-body" rows={2} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-heading text-lg flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-500" />
                  Pets & Animals
                </CardTitle>
                <Button size="sm" className="font-body">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pet
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="Pet name" className="font-body" />
                    <Input placeholder="Species/breed" className="font-body" />
                  </div>
                  <div className="mt-3 space-y-2">
                    <Input placeholder="Microchip/ID number" className="font-body" />
                    <Textarea placeholder="Special care instructions" className="font-body" rows={2} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg flex items-center">
                <Pill className="h-5 w-5 mr-2 text-purple-500" />
                Medications & Medical Needs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4">
                  <Input placeholder="Medication name" className="font-body" />
                  <Input placeholder="Dosage" className="font-body" />
                  <Input placeholder="Frequency" className="font-body" />
                </div>
                <div className="mt-3">
                  <Textarea
                    placeholder="Special storage or administration instructions"
                    className="font-body"
                    rows={2}
                  />
                </div>
              </div>
              <Button variant="outline" size="sm" className="font-body bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-lg flex items-center">
                <Package className="h-5 w-5 mr-2 text-orange-500" />
                Required Inventory Items
              </CardTitle>
              <Button size="sm" className="font-body">
                <Plus className="h-4 w-4 mr-2" />
                Add from Inventory
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm font-body text-gray-600 mb-4">
                  Select items from your inventory that are essential for this emergency plan.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-body font-semibold">Water (1 gallon bottles)</h3>
                      <Badge className="bg-blue-100 text-blue-800">Food & Water</Badge>
                    </div>
                    <div className="text-sm font-body text-gray-600">
                      <div>Required: 12 bottles</div>
                      <div>Available: 24 bottles</div>
                      <div>Location: Home - Basement</div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-body font-semibold">First Aid Kit</h3>
                      <Badge className="bg-red-100 text-red-800">Medical</Badge>
                    </div>
                    <div className="text-sm font-body text-gray-600">
                      <div>Required: 1 kit</div>
                      <div>Available: 2 kits</div>
                      <div>Location: Home - Bathroom</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-lg flex items-center">
                <Route className="h-5 w-5 mr-2 text-blue-500" />
                Evacuation Routes
              </CardTitle>
              <Button size="sm" className="font-body">
                <Plus className="h-4 w-4 mr-2" />
                Plan Route
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm font-body text-gray-600 mb-4">
                Plan multiple evacuation routes using Google Maps integration.
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-body font-semibold">Primary Route</h3>
                  <Badge className="bg-green-100 text-green-800">Preferred</Badge>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="From address" className="font-body" />
                    <Input placeholder="To address" className="font-body" />
                  </div>
                  <Textarea placeholder="Route notes and landmarks" className="font-body" rows={2} />
                  <div className="text-sm font-body text-gray-600">
                    <div>Distance: 12.5 miles</div>
                    <div>Estimated time: 18 minutes</div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-body font-semibold">Alternate Route</h3>
                  <Badge className="bg-yellow-100 text-yellow-800">Backup</Badge>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="From address" className="font-body" />
                    <Input placeholder="To address" className="font-body" />
                  </div>
                  <Textarea placeholder="Route notes and landmarks" className="font-body" rows={2} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-heading text-lg flex items-center">
                <Phone className="h-5 w-5 mr-2 text-green-500" />
                Emergency Contacts
              </CardTitle>
              <Button size="sm" className="font-body">
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-body font-semibold">Local Emergency Services</h3>
                    <Badge className="bg-red-100 text-red-800">Critical</Badge>
                  </div>
                  <div className="space-y-2">
                    <Input placeholder="Contact name" className="font-body" />
                    <Input placeholder="Phone number" className="font-body" />
                    <Input placeholder="Relationship/role" className="font-body" />
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-body font-semibold">Out-of-State Contact</h3>
                    <Badge className="bg-blue-100 text-blue-800">Family</Badge>
                  </div>
                  <div className="space-y-2">
                    <Input placeholder="Contact name" className="font-body" />
                    <Input placeholder="Phone number" className="font-body" />
                    <Input placeholder="Address" className="font-body" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
