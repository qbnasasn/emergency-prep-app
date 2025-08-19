"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit, Trash2, Eye, AlertTriangle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"

interface InventoryItem {
  id: string
  name: string
  category: string
  location: string
  quantity: number
  minStock: number
  costPerUnit: number
  purchaseDate: string
  expirationDate: string
  calories?: number
  supplier: string
  upc?: string
  image?: string
}

const mockInventoryData: InventoryItem[] = [
  {
    id: "1",
    name: "Canned Beans (Black)",
    category: "Food & Water",
    location: "Home - Kitchen",
    quantity: 24,
    minStock: 12,
    costPerUnit: 1.29,
    purchaseDate: "2024-12-15",
    expirationDate: "2026-12-15",
    calories: 245,
    supplier: "Local Grocery",
    upc: "123456789012",
  },
  {
    id: "2",
    name: "First Aid Kit",
    category: "Medical Supplies",
    location: "Home - Bathroom",
    quantity: 2,
    minStock: 1,
    costPerUnit: 29.99,
    purchaseDate: "2024-11-20",
    expirationDate: "2027-11-20",
    supplier: "Medical Supply Co",
  },
  {
    id: "3",
    name: "Flashlight (LED)",
    category: "Power & Lighting",
    location: "Home - Garage",
    quantity: 0,
    minStock: 2,
    costPerUnit: 15.99,
    purchaseDate: "2024-10-05",
    expirationDate: "2029-10-05",
    supplier: "Hardware Store",
  },
  {
    id: "4",
    name: "Water Bottles (24-pack)",
    category: "Food & Water",
    location: "Home - Basement",
    quantity: 8,
    minStock: 5,
    costPerUnit: 4.99,
    purchaseDate: "2024-12-01",
    expirationDate: "2025-02-15",
    supplier: "Wholesale Club",
  },
  {
    id: "5",
    name: "Emergency Radio",
    category: "Communication",
    location: "Vehicle",
    quantity: 1,
    minStock: 1,
    costPerUnit: 39.99,
    purchaseDate: "2024-09-15",
    expirationDate: "2029-09-15",
    supplier: "Electronics Store",
  },
]

export function InventoryTable() {
  const [items] = useState<InventoryItem[]>(mockInventoryData)

  const getStockStatus = (item: InventoryItem) => {
    const today = new Date()
    const expiration = new Date(item.expirationDate)
    const daysUntilExpiration = Math.ceil((expiration.getTime() - today.getTime()) / (1000 * 3600 * 24))

    if (item.quantity === 0) {
      return { status: "Out of Stock", variant: "destructive" as const, color: "bg-red-100 text-red-800" }
    }
    if (item.quantity <= item.minStock) {
      return { status: "Low Stock", variant: "secondary" as const, color: "bg-orange-100 text-orange-800" }
    }
    if (daysUntilExpiration <= 0) {
      return { status: "Expired", variant: "destructive" as const, color: "bg-red-100 text-red-800" }
    }
    if (daysUntilExpiration <= 30) {
      return { status: "Expiring Soon", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" }
    }
    return { status: "In Stock", variant: "default" as const, color: "bg-green-100 text-green-800" }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl">Inventory Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-body font-semibold">Item</TableHead>
                <TableHead className="font-body font-semibold">Category</TableHead>
                <TableHead className="font-body font-semibold">Location</TableHead>
                <TableHead className="font-body font-semibold">Quantity</TableHead>
                <TableHead className="font-body font-semibold">Status</TableHead>
                <TableHead className="font-body font-semibold">Cost/Unit</TableHead>
                <TableHead className="font-body font-semibold">Expires</TableHead>
                <TableHead className="font-body font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const stockStatus = getStockStatus(item)
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {item.image ? (
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              width={40}
                              height={40}
                              className="rounded-lg"
                            />
                          ) : (
                            <span className="text-gray-400 text-xs font-body">IMG</span>
                          )}
                        </div>
                        <div>
                          <div className="font-body font-medium text-gray-900">{item.name}</div>
                          {item.upc && <div className="font-body text-xs text-gray-500">UPC: {item.upc}</div>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-body text-sm text-gray-600">{item.category}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-body text-sm text-gray-600">{item.location}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-body font-medium">{item.quantity}</span>
                        {(item.quantity <= item.minStock || item.quantity === 0) && (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                      <div className="font-body text-xs text-gray-500">Min: {item.minStock}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={stockStatus.color}>{stockStatus.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-body text-sm">{formatCurrency(item.costPerUnit)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-body text-sm">{formatDate(item.expirationDate)}</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="font-body">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="font-body">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Item
                          </DropdownMenuItem>
                          <DropdownMenuItem className="font-body text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
