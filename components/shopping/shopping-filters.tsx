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

const stores = ["Amazon", "Walmart", "Local Grocery", "Hardware Store", "Medical Supply Co"]

export function ShoppingFilters() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
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
          <Label className="font-body font-medium">Preferred Store</Label>
          <Select>
            <SelectTrigger className="font-body">
              <SelectValue placeholder="All stores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stores</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store} value={store.toLowerCase().replace(/\s+/g, "-")}>
                  {store}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="font-body font-medium">Priority</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="urgent" />
              <Label htmlFor="urgent" className="font-body text-sm">
                Urgent (Out of Stock)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="low-stock" />
              <Label htmlFor="low-stock" className="font-body text-sm">
                Low Stock
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="expiring" />
              <Label htmlFor="expiring" className="font-body text-sm">
                Expiring Soon
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="manual" />
              <Label htmlFor="manual" className="font-body text-sm">
                Manually Added
              </Label>
            </div>
          </div>
        </div>

        <Button className="w-full font-body bg-gray-900 hover:bg-gray-800">Apply Filters</Button>
      </CardContent>
    </Card>
  )
}
