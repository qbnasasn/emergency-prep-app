"use client"

import { useState, useEffect, useCallback } from "react"
import { InventoryHeader } from "@/components/inventory/inventory-header"
import { InventoryStats } from "@/components/inventory/inventory-stats"
import { InventoryTable, InventoryItem } from "@/components/inventory/inventory-table"
import { InventoryFilters, FilterState, initialFilterState } from "@/components/inventory/inventory-filters"

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
      setItems(data)

      // Extract unique categories and locations
      const uniqueCategories = [...new Set(data.map((item) => item.category).filter(Boolean) as string[])]
      const uniqueLocations = [...new Set(data.map((item) => item.location).filter(Boolean) as string[])]
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <InventoryFilters onFilterChange={setFilters} categories={categories} locations={locations} />
        </div>
        <div className="lg:col-span-3">
          <InventoryTable filters={filters} items={items} searchQuery={searchQuery} />
        </div>
      </div>
    </div>
  )
}
