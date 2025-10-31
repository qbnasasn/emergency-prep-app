"use client"

import { useState, useRef } from "react"
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
import { Upload } from "lucide-react"

interface ImportDialogProps {
  onImportComplete: () => void;
}

export function ImportDialog({ onImportComplete }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select a file to import.");
      return;
    }

    setIsImporting(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/inventory/import", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        onImportComplete();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to import file.");
      }
    } catch (error) {
      setError("An error occurred while importing the file.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="font-body bg-transparent">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Inventory</DialogTitle>
          <DialogDescription>
            Select a CSV file to import into your inventory. The file should have the following columns: name, description, quantity, category, location, supplier, cost_per_unit, purchase_date, expiry_date, min_stock, calories, upc.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          {error && <p className="text-destructive">{error}</p>}
          <Button onClick={handleImport} disabled={isImporting} className="w-full">
            {isImporting ? "Importing..." : "Import"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
