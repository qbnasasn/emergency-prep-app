"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { getInventoryItems, InventoryItem } from "@/lib/data/inventory"
import { useSession } from "next-auth/react"
import { PlusCircle, XCircle, ShoppingCart, Loader2 } from "lucide-react"
import { suggestedItems } from "@/lib/data/suggested-items"
import { createKit } from "@/lib/actions/kits"
import { Kit } from "@/lib/data/kits"

type KitCategory = keyof typeof suggestedItems;

const kitCategories: KitCategory[] = [
  "Go-Bag (Bug-Out Bag) 72-hours",
  "Stay-at-Home Kit (Shelter-in-Place Kit)",
  "First-Aid Kit",
  "Emergency Car Kit",
  "Work Emergency Kit",
  "Resupply Cache",
  "Communications Kit",
  "Custom Kit",
]

interface KitBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (kitData: any) => Promise<void>;
  kit?: Kit | null;
}

export function KitBuilderModal({ isOpen, onClose, onSave, kit }: KitBuilderModalProps) {
  const { data: session } = useSession()
  const [kitName, setKitName] = useState("")
  const [kitDescription, setKitDescription] = useState("")
  const [kitCategory, setKitCategory] = useState<KitCategory | "">("")
  const [gpsCoordinates, setGpsCoordinates] = useState("")
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([])
  const [currentSuggestedItems, setCurrentSuggestedItems] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (kit) {
      setKitName(kit.name || "");
      setKitDescription(kit.description || "");
      setKitCategory(kit.category as KitCategory || "");
      setGpsCoordinates(kit.gps_location ? `${kit.gps_location.x}, ${kit.gps_location.y}` : "");
      // Here you would also fetch and set the items associated with the kit
    } else {
      // Reset form for new kit
      setKitName("");
      setKitDescription("");
      setKitCategory("");
      setGpsCoordinates("");
      setSelectedItems([]);
    }
  }, [kit]);


  useEffect(() => {
    async function fetchItems() {
      if (session?.user?.id) {
        const items = await getInventoryItems(session.user.id)
        setInventoryItems(items)
      }
    }
    fetchItems()
  }, [session])

  useEffect(() => {
    if (kitCategory && suggestedItems[kitCategory]) {
      setCurrentSuggestedItems(suggestedItems[kitCategory])
    } else {
      setCurrentSuggestedItems([])
    }
  }, [kitCategory])

  const handleSelectItem = (item: InventoryItem) => {
    setSelectedItems((prev) => [...prev, item])
    setInventoryItems((prev) => prev.filter((i) => i.id !== item.id))
  }

  const handleDeselectItem = (item: InventoryItem) => {
    setInventoryItems((prev) => [...prev, item])
    setSelectedItems((prev) => prev.filter((i) => i.id !== item.id))
  }

  const handleAddToShoppingList = (itemName: string) => {
    console.log(`Added ${itemName} to shopping list.`)
  }

  const handleSave = async () => {
    if (!session?.user?.id || !kitName || !kitCategory) {
        setErrorMessage("Please provide a kit name and select a category.");
        return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const kitData = {
        id: kit?.id,
        name: kitName,
        description: kitDescription,
        category: kitCategory,
        gps_location: gpsCoordinates,
        items: selectedItems.map((item) => ({ id: item.id, quantity: item.quantity || 1 })),
    };

    await onSave(kitData);
    setIsSubmitting(false);
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{kit ? "Edit Kit" : "Create New Kit"}</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4 md:col-span-1">
                {errorMessage && (
                    <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                    <p className="text-sm">{errorMessage}</p>
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="kit-name">Kit Name</Label>
                    <Input id="kit-name" value={kitName} onChange={(e) => setKitName(e.target.value)} placeholder="e.g., My Go-Bag" required/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="kit-description">Description</Label>
                    <Textarea id="kit-description" value={kitDescription} onChange={(e) => setKitDescription(e.target.value)} placeholder="A brief description of the kit."/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="kit-category">Category</Label>
                    <Select value={kitCategory} onValueChange={(value) => setKitCategory(value as KitCategory)} required>
                    <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                        {kitCategories.map((category) => (<SelectItem key={category} value={category}>{category}</SelectItem>))}
                    </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="gps-coordinates">GPS Coordinates</Label>
                    <Input id="gps-coordinates" value={gpsCoordinates} onChange={(e) => setGpsCoordinates(e.target.value)} placeholder="e.g., 40.7128, -74.0060"/>
                </div>
                </div>
                <div className="space-y-4 md:col-span-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Available Inventory</h3>
                    <div className="border rounded-md p-4 h-64 overflow-y-auto">
                        {inventoryItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-1">
                            <span>{item.name}</span>
                            <Button variant="ghost" size="sm" onClick={() => handleSelectItem(item)}><PlusCircle className="h-4 w-4" /></Button>
                        </div>
                        ))}
                    </div>
                    </div>
                    <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Selected Items for Kit</h3>
                    <div className="border rounded-md p-4 h-64 overflow-y-auto">
                        {selectedItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-1">
                            <span>{item.name}</span>
                            <Button variant="ghost" size="sm" onClick={() => handleDeselectItem(item)}><XCircle className="h-4 w-4" /></Button>
                        </div>
                        ))}
                    </div>
                    </div>
                </div>
                {kitCategory && currentSuggestedItems.length > 0 && (
                    <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Suggested Items for {kitCategory}</h3>
                    <div className="border rounded-md p-4 h-64 overflow-y-auto">
                        {currentSuggestedItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-1">
                            <span>{item}</span>
                            <Button variant="ghost" size="sm" onClick={() => handleAddToShoppingList(item)}><ShoppingCart className="h-4 w-4" /></Button>
                        </div>
                        ))}
                    </div>
                    </div>
                )}
                </div>
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Kit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}