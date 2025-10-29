"use client"

import { useRef, useState } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { InventoryItem } from "@/components/inventory/inventory-table"

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
  image: z.any().optional(),
})

interface ItemFormProps {
  onFormSubmit: () => void;
  initialData?: InventoryItem;
}

export function ItemForm({ onFormSubmit, initialData }: ItemFormProps) {
  const formattedInitialData = initialData ? {
    ...initialData,
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
      is_food_item: false,
    },
  })

  const isEditMode = !!initialData;
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialData?.image);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      let finalImageUrl = imageUrl;

      if (inputFileRef.current?.files && inputFileRef.current.files.length > 0) {
        const file = inputFileRef.current.files[0];
        const response = await fetch(`/api/upload?filename=${file.name}`, {
          method: 'POST',
          body: file,
        });

        if (response.ok) {
          const newBlob = await response.json();
          finalImageUrl = newBlob.url;
          setImageUrl(finalImageUrl);
        } else {
          console.error('Failed to upload image');
          return;
        }
      }

      const submissionValues = {
        ...values,
        image: finalImageUrl,
        purchase_date: values.purchase_date || null,
        expiry_date: values.expiry_date || null,
      };

      const url = isEditMode ? `/api/inventory/${initialData.id}` : "/api/inventory";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionValues),
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
                <Input {...field} ref={field.ref} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {imageUrl && <img src={imageUrl} alt="Inventory item image" className="w-40 h-40 object-cover rounded-lg" />}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <Input type="file" ref={inputFileRef} />
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
