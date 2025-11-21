"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, ListPlus, Settings } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ShoppingItemForm } from "./shopping-item-form"

interface ShoppingHeaderProps {
  shoppingListId: string;
  onListUpdate: () => void;
  onSearch: (query: string) => void;
}

export function ShoppingHeader({ shoppingListId, onListUpdate, onSearch }: ShoppingHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isPopulating, setIsPopulating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const populateFromInventory = async () => {
    setIsPopulating(true);
    try {
      const response = await fetch('/api/shopping-lists/populate-from-inventory', {
        method: 'POST',
      });
      // TODO: Show a toast with the message from the response
      onListUpdate();
    } catch (error) {
      console.error("Failed to populate shopping list", error);
    } finally {
      setIsPopulating(false);
    }
  };

  const handleFormSubmit = () => {
    setIsDialogOpen(false);
    onListUpdate();
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
      <div>
        <h1 className="font-heading font-black text-3xl text-foreground">Shopping List</h1>
        <p className="font-body text-muted-foreground mt-1">Automated list based on inventory alerts and expiration dates</p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 w-64 font-body"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={populateFromInventory}
          disabled={isPopulating}
          className="font-body bg-transparent"
        >
          <ListPlus className={`h-4 w-4 mr-2 ${isPopulating ? "animate-spin" : ""}`} />
          Check for Low Stock
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
            <ShoppingItemForm shoppingListId={shoppingListId} onFormSubmit={handleFormSubmit} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
