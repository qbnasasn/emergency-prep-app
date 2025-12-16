"use client"

import { useState, useEffect, useCallback } from "react"
import { InventoryHeader } from "@/components/inventory/inventory-header"
import { InventoryStats } from "@/components/inventory/inventory-stats"
import { InventoryTable, InventoryItem } from "@/components/inventory/inventory-table"
import { InventoryFilters, FilterState, initialFilterState } from "@/components/inventory/inventory-filters"
import { INVENTORY_CATEGORIES } from "@/lib/constants"

export default function InventoryPage() {
  const [filters, setFilters] = useState<FilterState>(initialFilterState)
  const [searchQuery, setSearchQuery] = useState("")
  const [items, setItems] = useState<InventoryItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    try {
      const response = await fetch("/api/inventory")
      if (!response.ok) {
        throw new Error("Failed to fetch inventory items")
      }
      const data: InventoryItem[] = await response.json()

      // Sort items by name to ensure consistent order
      data.sort((a, b) => a.name.localeCompare(b.name));

      setItems(data)

      // Extract unique categories and locations, merging with standard categories
      const uniqueCategories = [...new Set([
        ...INVENTORY_CATEGORIES,
        ...data.map((item) => item.category).filter(Boolean) as string[]
      ])].sort();

      const uniqueLocations = [...new Set(data.map((item) => item.location).filter(Boolean) as string[])].sort();

      setCategories(uniqueCategories)
      setLocations(uniqueLocations)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  return (
    <div className="space-y-6">
      <InventoryHeader fetchItems={fetchItems} onSearch={setSearchQuery} />
      <InventoryStats items={items} />
      <div className="flex flex-col gap-6">
        <InventoryFilters onFilterChange={setFilters} categories={categories} locations={locations} />
        <InventoryTable filters={filters} items={items} searchQuery={searchQuery} />
      </div>
    </div>
  )
}
