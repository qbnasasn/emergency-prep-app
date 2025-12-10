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
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { X, ScanBarcode } from "lucide-react"
import { INVENTORY_CATEGORIES, NUTRITION_TYPES } from "@/lib/constants"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Html5QrcodeScanner } from "html5-qrcode"

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
  nutrition_type: z.string().optional(),
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
    nutrition_type: initialData.nutrition_type || "",
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
      nutrition_type: "",
      image: "",
      upc: "",
      location: "",
      supplier: "",
      purchase_date: "",
      expiry_date: "",
    },
  })

  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null)
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

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

  const mapCategory = (productName: string): string | undefined => {
    const lowerName = productName.toLowerCase();

    // Simple keyword mapping
    if (lowerName.includes("water") || lowerName.includes("hydration") || lowerName.includes("drink")) return "Water & Hydration";
    if (lowerName.includes("food") || lowerName.includes("soup") || lowerName.includes("bean") || lowerName.includes("rice") || lowerName.includes("pasta") || lowerName.includes("canned") || lowerName.includes("snack") || lowerName.includes("meal")) return "Food & Nutrition";
    if (lowerName.includes("bandage") || lowerName.includes("aid") || lowerName.includes("medicine") || lowerName.includes("pill") || lowerName.includes("vitamin")) return "First Aid & Medical";
    if (lowerName.includes("battery") || lowerName.includes("power") || lowerName.includes("light") || lowerName.includes("radio")) return "Energy & Power";
    if (lowerName.includes("soap") || lowerName.includes("tissue") || lowerName.includes("wipe") || lowerName.includes("sanitizer") || lowerName.includes("hygiene")) return "Sanitation & Hygiene";

    return undefined;
  };

  const handleBarcodeLookup = async (barcode: string) => {
    if (!barcode) return;

    const toastId = toast.loading("Looking up product...");

    try {
      // Check if online
      if (!navigator.onLine) {
        toast.error("Product lookup unavailable. Please enter details manually.", { id: toastId });
        return;
      }

      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product = data.product;

        // Update fields
        form.setValue("name", product.product_name || "");
        if (product.nutriments && product.nutriments['energy-kcal_100g']) {
          form.setValue("calories", Math.round(Number(product.nutriments['energy-kcal_100g'])));
        }

        // Handle Image
        if (product.image_url) {
           try {
             const imageResponse = await fetch(product.image_url);
             const blob = await imageResponse.blob();
             const reader = new FileReader();
             reader.onloadend = () => {
               const base64String = reader.result as string;
               setImagePreview(base64String);
               form.setValue("image", base64String);
             };
             reader.readAsDataURL(blob);
           } catch (imgErr) {
             console.error("Failed to fetch image", imgErr);
             // Non-critical, just ignore image if it fails
           }
        }

        // Map Category
        const mappedCategory = mapCategory(product.product_name || "");
        if (mappedCategory && INVENTORY_CATEGORIES.includes(mappedCategory)) {
          form.setValue("category", mappedCategory);
          // If category is food, auto-set nutrition type default or logic could be added here
        }

        toast.success("Product found!", { id: toastId });
      } else {
        toast.error("Product lookup unavailable. Please enter details manually.", { id: toastId });
      }
    } catch (error) {
      console.error("Lookup error:", error);
      toast.error("Product lookup unavailable. Please enter details manually.", { id: toastId });
    }
  };

  // Initialize Scanner when modal opens
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    let timer: NodeJS.Timeout | null = null;

    if (isScanning) {
        // Short delay to ensure DOM element exists
        timer = setTimeout(() => {
            if (!isScanning) return; // check again

            scanner = new Html5QrcodeScanner(
                "reader",
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                /* verbose= */ false
            );

            scanner.render(
                (decodedText) => {
                    // Success callback
                    handleBarcodeLookup(decodedText);
                    setIsScanning(false);
                    form.setValue("upc", decodedText);
                },
                (errorMessage) => {
                    // Error callback - ignore simple scan failures as it polls continuously
                }
            );
            scannerRef.current = scanner;
        }, 100);
    }

    return () => {
        if (timer) clearTimeout(timer);
        if (scannerRef.current) {
            scannerRef.current.clear().catch(error => {
                console.error("Failed to clear html5-qrcode scanner. ", error);
            });
            scannerRef.current = null;
        }
    };
  }, [isScanning, form]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      handleBarcodeLookup(e.currentTarget.value);
    }
  };

  return (
    <>
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
                    {INVENTORY_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.watch("category") === "Food & Nutrition" && (
          <FormField
            control={form.control}
            name="nutrition_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nutrition Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select nutrition type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {NUTRITION_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          )}
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
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      {...field}
                      onKeyDown={onKeyDown}
                      placeholder="Scan or enter barcode"
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setIsScanning(true)}
                    title="Scan Barcode"
                  >
                    <ScanBarcode className="h-4 w-4" />
                  </Button>
                </div>
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

      <Dialog open={isScanning} onOpenChange={setIsScanning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan Barcode</DialogTitle>
            <DialogDescription>
              Point your camera at a barcode to scan it.
            </DialogDescription>
          </DialogHeader>
          <div id="reader" className="w-full h-[300px]"></div>
        </DialogContent>
      </Dialog>
    </>
  )
}
