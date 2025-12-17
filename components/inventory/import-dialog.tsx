"use client"

import { useState, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Upload, Download, ArrowRight, Loader2, CheckCircle2 } from "lucide-react"
import Papa from "papaparse"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { INVENTORY_CATEGORIES } from "@/lib/constants"

interface ImportDialogProps {
  onImportComplete: () => void;
}

// Fields we expect/allow in the database
const REQUIRED_FIELDS = [
  { key: "name", label: "Item Name", required: true },
  { key: "quantity", label: "Quantity", required: true },
  { key: "category", label: "Category", required: true },
];

const OPTIONAL_FIELDS = [
  { key: "description", label: "Description" },
  { key: "location", label: "Location" },
  { key: "supplier", label: "Supplier" },
  { key: "cost_per_unit", label: "Cost Per Unit" },
  { key: "purchase_date", label: "Purchase Date" },
  { key: "expiry_date", label: "Expiry Date" },
  { key: "min_stock", label: "Minimum Stock" },
  { key: "calories", label: "Calories" },
  { key: "upc", label: "UPC/Barcode" },
];

const ALL_DB_FIELDS = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];

export function ImportDialog({ onImportComplete }: ImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"upload" | "map" | "importing" | "success">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<any[]>([]);
  // Mapping state: dbField -> csvHeader (or "" if unmapped)
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setStep("upload");
    setCsvHeaders([]);
    setParsedData([]);
    setColumnMapping({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Small timeout to allow animation to finish before resetting
      setTimeout(resetState, 300);
    }
  };

  const downloadSample = () => {
    // Generate sample data
    const headers = ALL_DB_FIELDS.map(f => f.key);
    const sampleRows = [
      headers.join(","),
      "Canned Beans,Organic Black Beans,5,Food & Nutrition,Pantry,Walmart,1.50,2023-10-01,2025-10-01,2,300,123456789",
      "AA Batteries,Pack of 20,1,Energy & Power,Garage,Amazon,15.99,2023-09-15,,1,,",
    ];
    const csvContent = sampleRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "prepsafe_inventory_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (fileToParse: File) => {
    Papa.parse(fileToParse, {
      header: true,
      skipEmptyLines: true,
      preview: 50, // Preview first 50 rows for mapping to save memory initially? No, let's parse all but just read headers.
                   // Actually, we need to parse all to eventually send them.
                   // Let's parse all now. Client side parsing for CSV is usually fast enough for typical user files.
      complete: (results) => {
        if (results.meta.fields) {
          setCsvHeaders(results.meta.fields);
          setParsedData(results.data);

          // Auto-guess mapping
          const initialMapping: Record<string, string> = {};
          ALL_DB_FIELDS.forEach(dbField => {
            const match = results.meta.fields?.find(header =>
              header.toLowerCase().replace(/_/g, '').trim() === dbField.key.toLowerCase().replace(/_/g, '').trim() ||
              header.toLowerCase() === dbField.label.toLowerCase()
            );
            if (match) {
              initialMapping[dbField.key] = match;
            }
          });
          setColumnMapping(initialMapping);
          setStep("map");
        } else {
            toast.error("Could not parse CSV headers. Please check the file.");
        }
      },
      error: (error) => {
        console.error(error);
        toast.error("Failed to parse CSV file.");
      }
    });
  };

  const handleMappingChange = (dbField: string, csvHeader: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [dbField]: csvHeader
    }));
  };

  const executeImport = async () => {
    // Validate required fields
    const missingRequired = REQUIRED_FIELDS.filter(f => !columnMapping[f.key]);
    if (missingRequired.length > 0) {
      toast.error(`Please map the following required fields: ${missingRequired.map(f => f.label).join(", ")}`);
      return;
    }

    setStep("importing");

    // Transform data based on mapping
    const mappedData = parsedData.map(row => {
      const newRow: any = {};
      Object.entries(columnMapping).forEach(([dbKey, csvHeader]) => {
        if (csvHeader && row[csvHeader] !== undefined) {
           let value = row[csvHeader];
           // Basic cleaning
           if (typeof value === 'string') value = value.trim();

           // Data type conversions for specific fields could go here if needed,
           // but the API should also handle type coercion or sanitization.
           // For now, pass mostly as strings/raw and let API handle it.

           // Exception: Categories. If mapped category doesn't match our valid list, we might want to default to 'Other' or keep as is?
           // Let's keep as is, the API will try to insert it.

           newRow[dbKey] = value;
        }
      });
      return newRow;
    });

    try {
        const response = await fetch("/api/inventory/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: mappedData }),
        });

        const result = await response.json();

        if (response.ok) {
            setStep("success");
            toast.success(`Successfully imported ${result.count} items.`);
            onImportComplete();
        } else {
            toast.error(result.error || "Import failed.");
            setStep("map"); // Go back to map so they can fix if it was a data issue?
        }
    } catch (err) {
        console.error(err);
        toast.error("An unexpected error occurred.");
        setStep("map");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="font-body bg-transparent">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>Import Inventory</DialogTitle>
          <DialogDescription>
            {step === "upload" && "Upload a CSV file to bulk add items to your inventory."}
            {step === "map" && "Match columns from your CSV to PrepSafe fields."}
            {step === "importing" && "Processing your data..."}
            {step === "success" && "Import Complete!"}
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-6 py-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-10 text-center hover:bg-muted/50 transition-colors">
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop your CSV file here, or click to browse.
                </p>
                <Input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="max-w-xs mx-auto cursor-pointer"
                />
            </div>

            <div className="bg-muted/50 p-4 rounded-md flex items-center justify-between">
                <div className="text-sm">
                    <p className="font-medium">Need a template?</p>
                    <p className="text-muted-foreground text-xs">Download a sample CSV file to get started.</p>
                </div>
                <Button variant="outline" size="sm" onClick={downloadSample}>
                    <Download className="h-3 w-3 mr-2" />
                    Download Sample
                </Button>
            </div>
          </div>
        )}

        {step === "map" && (
          <div className="space-y-6">
             <div className="grid gap-4 py-4">
                <p className="text-sm text-muted-foreground">
                    We found {parsedData.length} items in your file. Please verify the column mapping below.
                </p>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {ALL_DB_FIELDS.map((field) => (
                        <div key={field.key} className="grid grid-cols-2 gap-4 items-center border-b pb-4 last:border-0">
                            <div>
                                <Label className="text-sm font-medium flex items-center">
                                    {field.label}
                                    {field.required && <span className="text-destructive ml-1">*</span>}
                                </Label>
                                <p className="text-xs text-muted-foreground">Target Field</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                <Select
                                    value={columnMapping[field.key] || "ignore"}
                                    onValueChange={(val) => handleMappingChange(field.key, val === "ignore" ? "" : val)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select column" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ignore" className="text-muted-foreground italic">-- Ignore --</SelectItem>
                                        {csvHeaders.map(header => (
                                            <SelectItem key={header} value={header}>{header}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    ))}
                </div>
             </div>

             <div className="flex justify-end gap-2">
                 <Button variant="ghost" onClick={resetState}>Cancel</Button>
                 <Button onClick={executeImport}>
                    Import {parsedData.length} Items
                 </Button>
             </div>
          </div>
        )}

        {step === "importing" && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Importing your inventory...</p>
            </div>
        )}

        {step === "success" && (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium">Import Successful</h3>
                <p className="text-center text-sm text-muted-foreground max-w-xs">
                    Your items have been added to your inventory.
                </p>
                <Button onClick={() => setOpen(false)} className="w-full max-w-xs">
                    Close
                </Button>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
