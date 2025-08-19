"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Download, Upload } from "lucide-react"
import { useState } from "react"

export function InventoryHeader() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
      <div>
        <h1 className="font-heading font-black text-3xl text-gray-900">Inventory Management</h1>
        <p className="font-body text-gray-600 mt-1">Track and manage your emergency supplies</p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64 font-body"
          />
        </div>

        <Button variant="outline" size="sm" className="font-body bg-transparent">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>

        <Button variant="outline" size="sm" className="font-body bg-transparent">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>

        <Button className="font-body bg-gray-900 hover:bg-gray-800">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>
    </div>
  )
}
