"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"

interface PlansHeaderProps {
  onCreate: () => void;
  plans: any[]; // Assuming plans are passed as a prop
  onSearch: (query: string) => void;
}

export function PlansHeader({ onCreate, plans, onSearch }: PlansHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
      <div>
        <h1 className="font-heading font-black text-3xl text-foreground">Emergency Plans</h1>
        <p className="font-body text-muted-foreground mt-1">NOAA All-Hazards emergency preparedness plans</p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search plans..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 w-64 font-body"
          />
        </div>

        <Button className="font-body bg-gray-900 hover:bg-gray-800" onClick={onCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Plan
        </Button>
      </div>
    </div>
  )
}
