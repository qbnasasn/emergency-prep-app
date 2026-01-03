"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit, Trash2, Eye, AlertTriangle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { ItemForm } from "./item-form"
import { FilterState } from "./inventory-filters"

export interface InventoryItem {
  id: string
  name: string
  description: string | null
  quantity: number
  expiry_date: string | null
  category: string | null
  location: string | null
  min_stock: number | null
  cost_per_unit: number | null
  purchase_date: string | null
  calories: number | null
  supplier: string | null
  upc: string | null
  image: string | null
  servings: number | null
  calories_per_serving: number | null
}

interface InventoryTableProps {
  filters: FilterState
  items: InventoryItem[]
  searchQuery?: string
}

export function InventoryTable({ filters, items, searchQuery = "" }: InventoryTableProps) {
  const [error, setError] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  const getStockStatus = (item: InventoryItem) => {
    const today = new Date()
    const expiration = item.expiry_date ? new Date(item.expiry_date) : null
    const daysUntilExpiration = expiration ? Math.ceil((expiration.getTime() - today.getTime()) / (1000 * 3600 * 24)) : Infinity

    if (item.quantity === 0) {
      return { status: "Out of Stock", variant: "destructive" as const, color: "bg-red-100 text-red-800" }
    }
    if (item.min_stock && item.quantity <= item.min_stock) {
      return { status: "Low Stock", variant: "secondary" as const, color: "bg-orange-100 text-orange-800" }
    }
    if (expiration && daysUntilExpiration <= 0) {
      return { status: "Expired", variant: "destructive" as const, color: "bg-red-100 text-red-800" }
    }
    if (expiration && daysUntilExpiration <= 30) {
      return { status: "Expiring Soon", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" }
    }
    return { status: "In Stock", variant: "default" as const, color: "bg-green-100 text-green-800" }
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = item.name.toLowerCase().includes(query)
        const matchesCategory = (item.category || "").toLowerCase().includes(query)
        const matchesLocation = (item.location || "").toLowerCase().includes(query)
        const matchesDescription = (item.description || "").toLowerCase().includes(query)

        if (!matchesName && !matchesCategory && !matchesLocation && !matchesDescription) {
          return false
        }
      }

      // Category filter
      if (filters.category !== "all" && item.category !== filters.category) {
        return false
      }

      // Location filter
      if (filters.location !== "all" && item.location !== filters.location) {
        return false
      }

      // Stock Status filter
      const { status } = getStockStatus(item)
      const { stockStatus } = filters
      const anyStatusChecked =
        stockStatus.inStock ||
        stockStatus.lowStock ||
        stockStatus.outOfStock ||
        stockStatus.expired ||
        stockStatus.expiringSoon
      if (anyStatusChecked) {
        if (stockStatus.inStock && status === "In Stock") return true
        if (stockStatus.lowStock && status === "Low Stock") return true
        if (stockStatus.outOfStock && status === "Out of Stock") return true
        if (stockStatus.expired && status === "Expired") return true
        if (stockStatus.expiringSoon && status === "Expiring Soon") return true
        return false
      }

      return true
    })
  }, [items, filters, searchQuery])

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedItem) return

    try {
      const response = await fetch(`/api/inventory/${selectedItem.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setIsDeleteDialogOpen(false)
        setSelectedItem(null)
        window.location.reload() // Refetch items after delete
      } else {
        console.error("Failed to delete item")
      }
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  const handleFormSubmit = () => {
    setIsEditDialogOpen(false)
    setSelectedItem(null)
    window.location.reload() // Refetch items after add/edit
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-destructive">{error}</p>}
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
                {!error && filteredItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No items match your filters.
                    </TableCell>
                  </TableRow>
                )}
                {filteredItems.map((item) => {
                  const stockStatus = getStockStatus(item)
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                            {item.image ? (
                              <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                width={40}
                                height={40}
                              className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-muted-foreground text-xs font-body">IMG</span>
                            )}
                          </div>
                          <div>
                            <div className="font-body font-medium text-foreground">{item.name}</div>
                            {item.upc && <div className="font-body text-xs text-muted-foreground">UPC: {item.upc}</div>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-body text-sm text-muted-foreground">{item.category}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-body text-sm text-muted-foreground">{item.location}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-body font-medium">{item.quantity}</span>
                          {(item.min_stock && item.quantity <= item.min_stock) ||
                            (item.quantity === 0 && <AlertTriangle className="h-4 w-4 text-primary" />)}
                        </div>
                        <div className="font-body text-xs text-muted-foreground">Min: {item.min_stock}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={stockStatus.color}>{stockStatus.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-body text-sm">{formatCurrency(item.cost_per_unit)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-body text-sm">{formatDate(item.expiry_date)}</span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="font-body" onClick={() => handleEdit(item)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Item
                            </DropdownMenuItem>
                            <DropdownMenuItem className="font-body text-destructive" onClick={() => handleDelete(item)}>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>
              Update the details of the item.
            </DialogDescription>
          </DialogHeader>
          <ItemForm onFormSubmit={handleFormSubmit} initialData={selectedItem} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item
              "{selectedItem?.name}" from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedItem(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
