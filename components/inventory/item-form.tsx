"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { InventoryItem } from "@/components/inventory/inventory-table"
import { useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"

const categories = [
  "Water & Hydration",
  "Food & Nutrition",
  "First Aid & Medical",
  "Communication & Information",
  "Tools & Utilities",
  "Clothing",
  "Shelter & Warmth",
  "Documents & Records",
  "Energy & Power",
  "Sanitation & Hygiene",
  "Navigation",
  "Vehicle Preparedness",
  "Specialized Gear",
  "Miscellaneous",
]

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  quantity: z.coerce.number().int().min(0, { message: "Quantity must be a positive number" }),
  category: z.string().min(1, { message: "Category is required" }),
  location: z.string().optional(),
  supplier: z.string().optional(),
  cost_per_unit: z.coerce.number().optional(),
  purchase_date: z.string().optional(),
  expiry_date: z.string().optional(),
  min_stock: z.coerce.number().int().optional(),
  calories: z.coerce.number().int().optional(),
  upc: z.string().optional(),
  image: z.string().optional(),
})

interface ItemFormProps {
  onFormSubmit: () => void;
  initialData?: InventoryItem;
}

export function ItemForm({ onFormSubmit, initialData }: ItemFormProps) {
  const formattedInitialData = initialData ? {
    ...initialData,
    description: initialData.description || "",
    location: initialData.location || "",
    supplier: initialData.supplier || "",
    upc: initialData.upc || "",
    image: initialData.image || "",
    category: initialData.category || "",
    purchase_date: initialData.purchase_date ? initialData.purchase_date.split('T')[0] : '',
    expiry_date: initialData.expiry_date ? initialData.expiry_date.split('T')[0] : '',
  } : undefined;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: formattedInitialData || {
      name: "",
      description: "",
      quantity: 0,
      category: "",
      image: "",
      upc: "",
      location: "",
      supplier: "",
      purchase_date: "",
      expiry_date: "",
    },
  })

  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create an image element to resize the image
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Max dimension (width or height)
        const MAX_DIMENSION = 800;

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Convert to base64 (JPEG with 0.7 quality for compression)
          const base64String = canvas.toDataURL('image/jpeg', 0.7);
          setImagePreview(base64String);
          form.setValue("image", base64String);
        }
      };

      const reader = new FileReader();
      reader.onloadend = () => {
        img.src = reader.result as string;
      }
      reader.readAsDataURL(file);
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    form.setValue("image", "")
  }

  const isEditMode = !!initialData;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const url = isEditMode ? `/api/inventory/${initialData.id}` : "/api/inventory";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        onFormSubmit();
      } else {
        console.error(`Failed to ${isEditMode ? 'update' : 'add'} item`);
      }
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Canned Beans" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Pantry" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="supplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Local Mart" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cost_per_unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost per Unit</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="min_stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Stock Level</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="purchase_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expiry_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="calories"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Calories (for food items)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="upc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>UPC / Barcode</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                {imagePreview ? (
                  <div className="relative w-32 h-32 border rounded-md overflow-hidden group">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">{isEditMode ? 'Save Changes' : 'Add Item'}</Button>
      </form>
    </Form>
  )
}
