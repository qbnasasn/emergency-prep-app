"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"

// Basic types for now, can be expanded later
interface InventoryItem {
  id: string
  name: string
  category: string | null
}

interface Kit {
  id: string
  name: string
}

interface PlanInventory {
  items: { id: string }[]
  kits: { id: string }[]
}

interface InventoryTabProps {
  planId: string | undefined
  selectedItemIds: Set<string>
  onItemSelectionChange: (itemId: string) => void
  selectedKitIds: Set<string>
  onKitSelectionChange: (kitId: string) => void
}

export function InventoryTab({
  planId,
  selectedItemIds,
  onItemSelectionChange,
  selectedKitIds,
  onKitSelectionChange,
}: InventoryTabProps) {
  const [allItems, setAllItems] = useState<InventoryItem[]>([])
  const [allKits, setAllKits] = useState<Kit[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchInventoryAndKits() {
      setIsLoading(true)
      try {
        const [itemsResponse, kitsResponse] = await Promise.all([
          fetch("/api/inventory"),
          fetch("/api/kits"),
        ])

        if (!itemsResponse.ok) throw new Error("Failed to fetch inventory items.")
        if (!kitsResponse.ok) throw new Error("Failed to fetch kits.")

        const itemsData = await itemsResponse.json()
        const kitsData = await kitsResponse.json()

        setAllItems(itemsData)
        setAllKits(kitsData)
      } catch (err: any) {
        toast.error(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInventoryAndKits()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="font-heading text-lg mb-4">Available Inventory Items</h3>
        <ScrollArea className="h-72 rounded-md border p-4">
          {allItems.length > 0 ? (
            allItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id={`item-${item.id}`}
                  checked={selectedItemIds.has(item.id)}
                  onCheckedChange={() => onItemSelectionChange(item.id)}
                />
                <Label htmlFor={`item-${item.id}`} className="font-body text-sm">
                  {item.name} <span className="text-muted-foreground">({item.category})</span>
                </Label>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center">No inventory items found.</p>
          )}
        </ScrollArea>
      </div>
      <div>
        <h3 className="font-heading text-lg mb-4">Available Kits</h3>
        <ScrollArea className="h-72 rounded-md border p-4">
          {allKits.length > 0 ? (
            allKits.map((kit) => (
              <div key={kit.id} className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id={`kit-${kit.id}`}
                  checked={selectedKitIds.has(kit.id)}
                  onCheckedChange={() => onKitSelectionChange(kit.id)}
                />
                <Label htmlFor={`kit-${kit.id}`} className="font-body text-sm">
                  {kit.name}
                </Label>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center">No kits found.</p>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
