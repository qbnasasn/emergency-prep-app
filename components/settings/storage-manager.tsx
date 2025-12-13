"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { HardDrive, Trash2, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

export function StorageManager() {
  const [usage, setUsage] = useState(0)
  const [quota, setQuota] = useState(0)
  const [isPersisted, setIsPersisted] = useState(false)
  const [loading, setLoading] = useState(false)

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
