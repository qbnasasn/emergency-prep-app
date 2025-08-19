"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, FileText, Printer } from "lucide-react"
import { useState } from "react"

export function PlansHeader() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
      <div>
        <h1 className="font-heading font-black text-3xl text-gray-900">Emergency Plans</h1>
        <p className="font-body text-gray-600 mt-1">NOAA All-Hazards emergency preparedness plans</p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64 font-body"
          />
        </div>

        <Button variant="outline" size="sm" className="font-body bg-transparent">
          <FileText className="h-4 w-4 mr-2" />
          Templates
        </Button>

        <Button variant="outline" size="sm" className="font-body bg-transparent">
          <Printer className="h-4 w-4 mr-2" />
          Print All
        </Button>

        <Button className="font-body bg-gray-900 hover:bg-gray-800">
          <Plus className="h-4 w-4 mr-2" />
          New Plan
        </Button>
      </div>
    </div>
  )
}
