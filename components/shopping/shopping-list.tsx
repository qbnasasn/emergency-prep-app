"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Trash2, Plus, Check, ExternalLink, Repeat } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"

export interface ShoppingItem {
  id: string;
  shopping_list_id: string;
  item_name: string;
  quantity: number;
  is_purchased: boolean;
  inventory_item_id: string | null;
  category?: string;
  estimated_cost?: number;
  preferred_store?: string;
  upc?: string;
  image?: string;
  reason?: string;
}

interface ShoppingListProps {
  shoppingListId: string;
  items: ShoppingItem[];
  onListUpdate: () => void;
}

export function ShoppingList({ shoppingListId, items, onListUpdate }: ShoppingListProps) {
  const getReasonColor = (reason: string) => "bg-gray-100 text-gray-800"
  const getReasonText = (reason: string) => "Manual Add"

  const formatCurrency = (amount: number) => {
    if (amount === null || amount === undefined) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await fetch(`/api/shopping-lists/${shoppingListId}/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      onListUpdate();
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  }

  const markAsPurchased = async (itemId: string) => {
    try {
      await fetch(`/api/shopping-lists/${shoppingListId}/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_purchased: true }),
      });
      onListUpdate();
    } catch (error) {
      console.error("Error marking item as purchased:", error);
    }
  }

  const handleMoveToInventory = async (itemId: string) => {
    try {
      await fetch(`/api/inventory/from-shopping-list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shoppingListItemId: itemId }),
      });
      onListUpdate();
    } catch (error) {
      console.error("Error moving item to inventory:", error);
    }
  }

  const handleRestock = async (itemId: string) => {
    try {
      await fetch(`/api/inventory/restock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shoppingListItemId: itemId }),
      });
      onListUpdate();
    } catch (error) {
      console.error("Error restocking item:", error);
    }
  }

  const buyNowAmazon = (itemName: string) => {
    const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(itemName)}`;
    window.open(searchUrl, "_blank");
  }

  const buyNowWalmart = (itemName: string) => {
    const searchUrl = `https://www.walmart.com/search?q=${encodeURIComponent(itemName)}`;
    window.open(searchUrl, "_blank");
  }

  const removeItem = async (itemId: string) => {
    try {
      await fetch(`/api/shopping-lists/${shoppingListId}/items/${itemId}`, {
        method: "DELETE",
      });
      onListUpdate();
    } catch (error) {
      console.error("Error removing item:", error);
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
                <TableRow key={item.id} className={item.is_purchased ? "bg-green-50" : ""}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {item.image ? (
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.item_name}
                            width={40}
                            height={40}
                            className="rounded-lg"
                          />
                        ) : (
                          <span className="text-gray-400 text-xs font-body">IMG</span>
                        )}
                      </div>
                      <div>
                        <div className="font-body font-medium text-gray-900">{item.item_name}</div>
                        {item.inventory_item_id && <Badge variant="secondary">Restock</Badge>}
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
                        defaultValue={item.quantity}
                        onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                        className="w-16 h-8 text-sm font-body"
                        min="1"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-body text-sm font-medium">{formatCurrency(item.estimated_cost)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-body text-sm text-gray-600">{item.preferred_store}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {!item.is_purchased ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => buyNowAmazon(item.item_name)}
                            className="font-body text-xs bg-orange-500 hover:bg-orange-600"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Amazon
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => buyNowWalmart(item.item_name)}
                            className="font-body text-xs bg-blue-500 hover:bg-blue-600"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Walmart
                          </Button>
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
                        item.inventory_item_id ? (
                          <Button
                            size="sm"
                            onClick={() => handleRestock(item.id)}
                            className="font-body text-xs bg-blue-600 hover:bg-blue-700"
                          >
                            <Repeat className="h-3 w-3 mr-1" />
                            Restock Inventory
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleMoveToInventory(item.id)}
                            className="font-body text-xs bg-green-600 hover:bg-green-700"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Move to Inventory
                          </Button>
                        )
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="font-body text-red-600" onClick={() => removeItem(item.id)}>
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
