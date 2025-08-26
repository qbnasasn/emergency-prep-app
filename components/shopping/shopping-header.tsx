"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, RefreshCw, Settings } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AddToListForm } from "./add-to-list-form"

interface ShoppingHeaderProps {
  shoppingListId: string;
  onListUpdate: () => void;
}

export function ShoppingHeader({ shoppingListId, onListUpdate }: ShoppingHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const refreshShoppingList = () => {
    setIsRefreshing(true)
    onListUpdate();
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const handleFormSubmit = () => {
    setIsDialogOpen(false);
    onListUpdate();
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
      <div>
        <h1 className="font-heading font-black text-3xl text-gray-900">Shopping List</h1>
        <p className="font-body text-gray-600 mt-1">Automated list based on inventory alerts and expiration dates</p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64 font-body"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={refreshShoppingList}
          disabled={isRefreshing}
          className="font-body bg-transparent"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>

        <Button variant="outline" size="sm" className="font-body bg-transparent">
          <Settings className="h-4 w-4 mr-2" />
          Store Settings
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-body bg-gray-900 hover:bg-gray-800">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Item to Shopping List</DialogTitle>
              <DialogDescription>
                Enter the name and quantity of the item you want to add.
              </DialogDescription>
            </DialogHeader>
            <AddToListForm shoppingListId={shoppingListId} onFormSubmit={handleFormSubmit} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
