"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Trash2, Plus, Check, ExternalLink } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"

interface ShoppingItem {
  id: string
  name: string
  category: string
  reason: "out-of-stock" | "low-stock" | "expiring" | "manual"
  quantity: number
  estimatedCost: number
  preferredStore: string
  upc?: string
  image?: string
  amazonUrl?: string
  walmartUrl?: string
  purchased: boolean
}

const mockShoppingData: ShoppingItem[] = [
  {
    id: "1",
    name: "Canned Beans (Black)",
    category: "Food & Water",
    reason: "low-stock",
    quantity: 12,
    estimatedCost: 15.48,
    preferredStore: "Amazon",
    upc: "123456789012",
    amazonUrl: "https://amazon.com/example",
    walmartUrl: "https://walmart.com/example",
    purchased: false,
  },
  {
    id: "2",
    name: "First Aid Bandages",
    category: "Medical Supplies",
    reason: "out-of-stock",
    quantity: 2,
    estimatedCost: 12.99,
    preferredStore: "Walmart",
    amazonUrl: "https://amazon.com/example",
    walmartUrl: "https://walmart.com/example",
    purchased: false,
  },
  {
    id: "3",
    name: "Flashlight Batteries (AA)",
    category: "Power & Lighting",
    reason: "out-of-stock",
    quantity: 8,
    estimatedCost: 9.99,
    preferredStore: "Amazon",
    amazonUrl: "https://amazon.com/example",
    walmartUrl: "https://walmart.com/example",
    purchased: false,
  },
  {
    id: "4",
    name: "Water Bottles (24-pack)",
    category: "Food & Water",
    reason: "expiring",
    quantity: 3,
    estimatedCost: 14.97,
    preferredStore: "Local Grocery",
    purchased: true,
  },
  {
    id: "5",
    name: "Emergency Radio Batteries",
    category: "Communication",
    reason: "manual",
    quantity: 4,
    estimatedCost: 7.99,
    preferredStore: "Amazon",
    amazonUrl: "https://amazon.com/example",
    purchased: false,
  },
]

export function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>(mockShoppingData)

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case "out-of-stock":
        return "bg-red-100 text-red-800"
      case "low-stock":
        return "bg-orange-100 text-orange-800"
      case "expiring":
        return "bg-yellow-100 text-yellow-800"
      case "manual":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getReasonText = (reason: string) => {
    switch (reason) {
      case "out-of-stock":
        return "Out of Stock"
      case "low-stock":
        return "Low Stock"
      case "expiring":
        return "Expiring Soon"
      case "manual":
        return "Manual Add"
      default:
        return reason
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return // Prevent negative or zero quantities
    setItems(items.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))
  }

  const markAsPurchased = (itemId: string) => {
    setItems(items.map((item) => (item.id === itemId ? { ...item, purchased: true } : item)))
  }

  const addToInventory = (itemId: string) => {
    // TODO: Add purchased item back to inventory
    console.log("Adding item to inventory:", itemId)
  }

  const buyNowAmazon = (item: ShoppingItem) => {
    if (item.amazonUrl) {
      window.open(item.amazonUrl, "_blank")
    }
  }

  const buyNowWalmart = (item: ShoppingItem) => {
    if (item.walmartUrl) {
      window.open(item.walmartUrl, "_blank")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl">Shopping Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-body font-semibold">Item</TableHead>
                <TableHead className="font-body font-semibold">Category</TableHead>
                <TableHead className="font-body font-semibold">Reason</TableHead>
                <TableHead className="font-body font-semibold">Quantity</TableHead>
                <TableHead className="font-body font-semibold">Est. Cost</TableHead>
                <TableHead className="font-body font-semibold">Store</TableHead>
                <TableHead className="font-body font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className={item.purchased ? "bg-green-50" : ""}>
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
                    <Badge className={getReasonColor(item.reason)}>{getReasonText(item.reason)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                        className="w-16 h-8 text-sm font-body"
                        min="1"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-body text-sm font-medium">{formatCurrency(item.estimatedCost)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-body text-sm text-gray-600">{item.preferredStore}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {!item.purchased ? (
                        <>
                          {item.amazonUrl && (
                            <Button
                              size="sm"
                              onClick={() => buyNowAmazon(item)}
                              className="font-body text-xs bg-orange-500 hover:bg-orange-600"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Amazon
                            </Button>
                          )}
                          {item.walmartUrl && (
                            <Button
                              size="sm"
                              onClick={() => buyNowWalmart(item)}
                              className="font-body text-xs bg-blue-500 hover:bg-blue-600"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Walmart
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsPurchased(item.id)}
                            className="font-body text-xs bg-transparent"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Bought
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => addToInventory(item.id)}
                          className="font-body text-xs bg-green-600 hover:bg-green-700"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add to Inventory
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="font-body text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
