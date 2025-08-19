"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"

const categories = [
  "Food & Water",
  "Medical Supplies",
  "Tools & Equipment",
  "Clothing & Shelter",
  "Communication",
  "Power & Lighting",
  "Personal Care",
  "Documents",
]

const locations = ["Home - Kitchen", "Home - Basement", "Home - Garage", "Vehicle", "Office", "Storage Unit"]

export function InventoryFilters() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <CardTitle className="font-heading text-lg">Filters</CardTitle>
        </div>
        <Button variant="ghost" size="sm">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="font-body font-medium">Category</Label>
          <Select>
            <SelectTrigger className="font-body">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category.toLowerCase().replace(/\s+/g, "-")}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="font-body font-medium">Location</Label>
          <Select>
            <SelectTrigger className="font-body">
              <SelectValue placeholder="All locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location.toLowerCase().replace(/\s+/g, "-")}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="font-body font-medium">Stock Status</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="in-stock" />
              <Label htmlFor="in-stock" className="font-body text-sm">
                In Stock
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="low-stock" />
              <Label htmlFor="low-stock" className="font-body text-sm">
                Low Stock
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="out-of-stock" />
              <Label htmlFor="out-of-stock" className="font-body text-sm">
                Out of Stock
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="expired" />
              <Label htmlFor="expired" className="font-body text-sm">
                Expired
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="expiring-soon" />
              <Label htmlFor="expiring-soon" className="font-body text-sm">
                Expiring Soon
              </Label>
            </div>
          </div>
        </div>

        <Button className="w-full font-body bg-gray-900 hover:bg-gray-800">Apply Filters</Button>
      </CardContent>
    </Card>
  )
}
