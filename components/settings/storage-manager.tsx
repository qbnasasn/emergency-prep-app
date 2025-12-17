"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { HardDrive, Trash2, ShieldCheck, Download, Upload } from "lucide-react"
import { toast } from "sonner"
import { db } from "@/lib/db/local"

export function StorageManager() {
  const [usage, setUsage] = useState(0)
  const [quota, setQuota] = useState(0)
  const [isPersisted, setIsPersisted] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    checkStorage()
    checkPersistence()
  }, [])

  const checkStorage = async () => {
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate()
        setUsage(estimate.usage || 0)
        setQuota(estimate.quota || 0)
      } catch (error) {
        console.error("Storage estimate error:", error)
      }
    }
  }

  const checkPersistence = async () => {
    if (navigator.storage && navigator.storage.persisted) {
      try {
        const persisted = await navigator.storage.persisted()
        setIsPersisted(persisted)
      } catch (error) {
        console.error("Storage persistence check error:", error)
      }
    }
  }

  const requestPersistence = async () => {
    setLoading(true)
    try {
      if (navigator.storage && navigator.storage.persist) {
        const persisted = await navigator.storage.persist()
        setIsPersisted(persisted)
        if (persisted) {
          toast.success("Persistent storage granted")
        } else {
          toast.error("Persistent storage denied by browser")
        }
      } else {
        toast.error("Persistent storage API not supported")
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to request persistent storage")
    } finally {
      setLoading(false)
    }
  }

  const clearCache = async () => {
    setLoading(true)
    try {
      if ('caches' in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map(key => caches.delete(key)))
        toast.success("Cache cleared successfully")
        checkStorage()
      } else {
        toast.error("Cache API not supported")
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to clear cache")
    } finally {
      setLoading(false)
    }
  }

  const exportBackup = async () => {
    setLoading(true);
    try {
      const inventory = await db.inventory.toArray();
      const kits = await db.kits.toArray();
      const plans = await db.plans.toArray();
      const shopping_list = await db.shopping_list.toArray();
      const user_settings = await db.user_settings.toArray();
      const knowledge_base = await db.knowledge_base.toArray();

      const backupData = {
        version: 1,
        timestamp: new Date().toISOString(),
        inventory,
        kits,
        plans,
        shopping_list,
        user_settings,
        knowledge_base
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wolfman_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Secure backup generated");
    } catch (error) {
      console.error("Export backup error:", error);
      toast.error("Failed to generate backup");
    } finally {
      setLoading(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const backupData = JSON.parse(content);

        if (!backupData || typeof backupData !== 'object') {
          throw new Error("Invalid backup file format");
        }

        // Basic validation - check for at least one known table key
        const knownKeys = ['inventory', 'kits', 'plans', 'shopping_list', 'user_settings', 'knowledge_base'];
        const hasValidData = knownKeys.some(key => Array.isArray(backupData[key]));

        if (!hasValidData) {
          throw new Error("No valid data found in backup file");
        }

        await db.transaction('rw', db.inventory, db.kits, db.plans, db.shopping_list, db.user_settings, db.knowledge_base, async () => {
          if (backupData.inventory?.length) await db.inventory.bulkPut(backupData.inventory);
          if (backupData.kits?.length) await db.kits.bulkPut(backupData.kits);
          if (backupData.plans?.length) await db.plans.bulkPut(backupData.plans);
          if (backupData.shopping_list?.length) await db.shopping_list.bulkPut(backupData.shopping_list);
          if (backupData.user_settings?.length) await db.user_settings.bulkPut(backupData.user_settings);
          if (backupData.knowledge_base?.length) await db.knowledge_base.bulkPut(backupData.knowledge_base);
        });

        toast.success("Backup restored successfully");
        checkStorage(); // Update storage usage
      } catch (error) {
        console.error("Import error:", error);
        toast.error("Failed to restore backup: Invalid file");
      } finally {
        setLoading(false);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.onerror = () => {
      toast.error("Failed to read file");
      setLoading(false);
    };

    reader.readAsText(file);
  };

  const usagePercent = quota > 0 ? (usage / quota) * 100 : 0
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-primary" />
          <CardTitle>Storage Management</CardTitle>
        </div>
        <CardDescription>
          Manage your device storage and offline data limits.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Used Space</span>
            <span className="font-medium">{formatBytes(usage)} / {formatBytes(quota)}</span>
          </div>
          <Progress value={usagePercent} />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />

          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={requestPersistence}
            disabled={isPersisted || loading}
          >
            <ShieldCheck className="h-4 w-4" />
            {isPersisted ? "Storage Persisted" : "Request Persistent Storage"}
          </Button>

          <Button
            variant="default"
            className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white"
            onClick={exportBackup}
            disabled={loading}
          >
            <Download className="h-4 w-4" />
            Export Backup
          </Button>

          <Button
            variant="outline"
            className="flex-1 gap-2 border-dashed"
            onClick={handleImportClick}
            disabled={loading}
          >
            <Upload className="h-4 w-4" />
            Restore Backup
          </Button>

          <Button
            variant="destructive"
            className="flex-1 gap-2"
            onClick={clearCache}
            disabled={loading}
          >
            <Trash2 className="h-4 w-4" />
            Clear Cache
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
