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
import type { ShoppingItem } from "./shopping-list"

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
  item_name: z.string().min(1, { message: "Item name is required" }),
  quantity: z.coerce.number().int().min(1, { message: "Quantity must be at least 1" }),
  category: z.string().optional(),
  estimated_cost: z.coerce.number().optional(),
  preferred_store: z.string().optional(),
})

interface ShoppingItemFormProps {
  shoppingListId: string;
  onFormSubmit: () => void;
  initialData?: ShoppingItem;
}

export function ShoppingItemForm({ shoppingListId, onFormSubmit, initialData }: ShoppingItemFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      item_name: "",
      quantity: 1,
      category: "",
      estimated_cost: 0,
      preferred_store: "",
    },
  })

  const isEditMode = !!initialData;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const url = isEditMode
        ? `/api/shopping-lists/${shoppingListId}/items/${initialData.id}`
        : `/api/shopping-lists/${shoppingListId}/items`;

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
          name="item_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. AA Batteries" {...field} />
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
          name="estimated_cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Cost (Total)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="preferred_store"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Store</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Amazon" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">{isEditMode ? 'Save Changes' : 'Add to List'}</Button>
      </form>
    </Form>
  )
}
