"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Download, Upload } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ItemForm } from "@/components/inventory/item-form"

export function InventoryHeader() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleFormSubmit = () => {
    setIsDialogOpen(false);
    // Here you would typically trigger a refresh of the inventory list
    // For now, we just close the dialog. A simple way to refresh is to reload the page:
    window.location.reload();
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
      <div>
        <h1 className="font-heading font-black text-3xl text-foreground">Inventory Management</h1>
        <p className="font-body text-muted-foreground mt-1">Track and manage your emergency supplies</p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-body">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
              <DialogDescription>
                Fill in the details of the new item you want to add to your inventory.
              </DialogDescription>
            </DialogHeader>
            <ItemForm onFormSubmit={handleFormSubmit} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
