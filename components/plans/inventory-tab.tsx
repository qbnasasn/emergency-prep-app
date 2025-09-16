"use client"

import { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface InventoryItem {
  id: string
  name: string
  category: string | null
}

interface Kit {
  id: string
  name: string
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
  const [searchQuery, setSearchQuery] = useState("")
  const [showSelectedOnly, setShowSelectedOnly] = useState(false)

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

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = !showSelectedOnly || selectedItemIds.has(item.id)
      return matchesSearch && matchesFilter
    })
  }, [allItems, searchQuery, showSelectedOnly, selectedItemIds])

  const groupedItems = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      const category = item.category || "Uncategorized"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(item)
      return acc
    }, {} as Record<string, InventoryItem[]>)
  }, [filteredItems])

  const filteredKits = useMemo(() => {
    return allKits.filter(kit => {
      const matchesSearch = kit.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = !showSelectedOnly || selectedKitIds.has(kit.id)
      return matchesSearch && matchesFilter
    })
  }, [allKits, searchQuery, showSelectedOnly, selectedKitIds])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search items and kits..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="show-selected"
            checked={showSelectedOnly}
            onCheckedChange={setShowSelectedOnly}
          />
          <Label htmlFor="show-selected">Show Selected Only</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-heading text-lg mb-4">Available Inventory Items</h3>
          <ScrollArea className="h-72 rounded-md border p-4">
            {Object.keys(groupedItems).length > 0 ? (
              Object.entries(groupedItems).map(([category, items]) => (
                <Collapsible key={category} defaultOpen>
                  <CollapsibleTrigger className="w-full text-left font-semibold py-2">{category}</CollapsibleTrigger>
                  <CollapsibleContent className="pl-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={selectedItemIds.has(item.id)}
                          onCheckedChange={() => onItemSelectionChange(item.id)}
                        />
                        <Label htmlFor={`item-${item.id}`} className="font-body text-sm">
                          {item.name}
                        </Label>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))
            ) : (
              <p className="text-muted-foreground text-center">No matching items found.</p>
            )}
          </ScrollArea>
        </div>
        <div>
          <h3 className="font-heading text-lg mb-4">Available Kits</h3>
          <ScrollArea className="h-72 rounded-md border p-4">
            {filteredKits.length > 0 ? (
              filteredKits.map((kit) => (
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
              <p className="text-muted-foreground text-center">No matching kits found.</p>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
