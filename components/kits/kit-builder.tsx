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
import { Checkbox } from "@/components/ui/checkbox"
import { Package, MapPin, Plus, Trash2, Search } from "lucide-react"

export function KitBuilder() {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [kitType, setKitType] = useState("")

  const kitTemplates = [
    { id: "basic", name: "Basic/72-Hour Kit", description: "Essential supplies for 3 days" },
    { id: "extended", name: "Extended Kit", description: "Supplies for 1-2 weeks" },
    { id: "vehicle", name: "Vehicle Emergency Kit", description: "Car breakdown and emergency supplies" },
    { id: "shelter", name: "Shelter-in-Place Kit", description: "Home emergency supplies" },
    { id: "office", name: "Office Emergency Kit", description: "Workplace emergency supplies" },
    { id: "evacuation", name: "Evacuation/Go Bag", description: "Portable emergency supplies" },
    { id: "tactical", name: "Tactical Vest", description: "Tactical emergency gear" },
    { id: "specialized", name: "Specialized Kit", description: "Custom emergency kit" },
  ]

  const inventoryItems = [
    { id: "1", name: "Water Bottles (24-pack)", category: "Water", quantity: 5, location: "Pantry" },
    { id: "2", name: "MRE Meals", category: "Food", quantity: 12, location: "Storage Room" },
    { id: "3", name: "First Aid Kit", category: "Medical", quantity: 2, location: "Medicine Cabinet" },
    { id: "4", name: "Flashlight", category: "Tools", quantity: 3, location: "Garage" },
    { id: "5", name: "Emergency Radio", category: "Communication", quantity: 1, location: "Living Room" },
    { id: "6", name: "Batteries (AA)", category: "Power", quantity: 20, location: "Utility Drawer" },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kit Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kit-name">Kit Name</Label>
                <Input id="kit-name" placeholder="Enter kit name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kit-type">Kit Type</Label>
                <Select value={kitType} onValueChange={setKitType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select kit type" />
                  </SelectTrigger>
                  <SelectContent>
                    {kitTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe this emergency kit" />
              </div>
            </CardContent>
          </Card>

          {kitType && (
            <Card>
              <CardHeader>
                <CardTitle>Kit Template</CardTitle>
              </CardHeader>
              <CardContent>
                {kitTemplates.find((t) => t.id === kitType) && (
                  <div className="space-y-2">
                    <Badge variant="secondary">{kitTemplates.find((t) => t.id === kitType)?.name}</Badge>
                    <p className="text-sm text-muted-foreground">
                      {kitTemplates.find((t) => t.id === kitType)?.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="location" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Kit Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location-name">Location Name</Label>
                <Input id="location-name" placeholder="e.g., Main Bedroom Closet" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input id="latitude" placeholder="40.7128" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input id="longitude" placeholder="-74.0060" />
                </div>
              </div>

              <Button variant="outline" className="w-full bg-transparent">
                <MapPin className="h-4 w-4 mr-2" />
                Get Current Location
              </Button>

              <div className="space-y-2">
                <Label htmlFor="access-notes">Access Notes</Label>
                <Textarea id="access-notes" placeholder="Special instructions for accessing this kit" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Kit Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search inventory items..." className="pl-9" />
                </div>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Item
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Available Inventory Items</Label>
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  {inventoryItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2 p-3 border-b last:border-b-0">
                      <Checkbox
                        id={item.id}
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedItems([...selectedItems, item.id])
                          } else {
                            setSelectedItems(selectedItems.filter((id) => id !== item.id))
                          }
                        }}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.category} • Qty: {item.quantity} • {item.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedItems.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Items ({selectedItems.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedItems.map((itemId) => {
                      const item = inventoryItems.find((i) => i.id === itemId)
                      return item ? (
                        <Badge key={itemId} variant="secondary" className="flex items-center gap-1">
                          {item.name}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => setSelectedItems(selectedItems.filter((id) => id !== itemId))}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kit Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Kit Name</Label>
                  <p className="text-sm text-muted-foreground">Home 72-Hour Kit</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Kit Type</Label>
                  <p className="text-sm text-muted-foreground">Basic/72-Hour Kit</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p className="text-sm text-muted-foreground">Main Bedroom Closet</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">GPS Coordinates</Label>
                  <p className="text-sm text-muted-foreground">40.7128, -74.0060</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Selected Items ({selectedItems.length})</Label>
                <div className="mt-2 space-y-1">
                  {selectedItems.map((itemId) => {
                    const item = inventoryItems.find((i) => i.id === itemId)
                    return item ? (
                      <div key={itemId} className="text-sm text-muted-foreground">
                        • {item.name} ({item.category})
                      </div>
                    ) : null
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1">
                  <Package className="h-4 w-4 mr-2" />
                  Create Kit
                </Button>
                <Button variant="outline">Save as Template</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
