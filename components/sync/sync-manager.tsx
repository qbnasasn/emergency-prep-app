"use client";

import { useEffect, useRef } from "react";
import { useOfflineAuth } from "@/hooks/use-offline-auth";
import { db } from "@/lib/db/local";
import { toast } from "sonner";

const BATCH_SIZE = 5;

export function SyncManager() {
  const { isSignedIn, isOffline } = useOfflineAuth();
  const isSyncing = useRef(false);

  useEffect(() => {
    // Only sync if online and signed in
    if (isOffline || !isSignedIn) {
        return;
    }

    const checkStorageQuota = async () => {
        if (navigator.storage && navigator.storage.estimate) {
            try {
                const { usage, quota } = await navigator.storage.estimate();
                if (usage && quota && (usage / quota > 0.9)) {
                    toast.error("Storage full. Please clear space.");
                    return false;
                }
            } catch (e) {
                console.error("Storage estimate failed", e);
            }
        }
        return true;
    };

    const convertItemImages = async (items: any[]) => {
        return Promise.all(items.map(async (item) => {
            if (item.image instanceof Blob) {
                try {
                    const base64 = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(item.image);
                    });
                    return { ...item, image: base64 };
                } catch (e) {
                    console.error("Image conversion failed", e);
                    return item; // Send as is (will likely fail serialization but keep batch going)
                }
            }
            return item;
        }));
    };

    const pushInventory = async () => {
        try {
            // Fetch unsynced items
            const unsyncedItems = await db.inventory
                .filter(item => item.sync_status !== 'synced')
                .toArray();

            if (unsyncedItems.length === 0) return;

            // Process in batches
            for (let i = 0; i < unsyncedItems.length; i += BATCH_SIZE) {
                const batch = unsyncedItems.slice(i, i + BATCH_SIZE);
                const processedBatch = await convertItemImages(batch);

                try {
                    const res = await fetch("/api/inventory", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(processedBatch)
                    });

                    if (!res.ok) {
                        throw new Error(`Upload failed: ${res.statusText}`);
                    }

                    // Mark as synced
                    await db.inventory.bulkPut(batch.map(item => ({ ...item, sync_status: 'synced' })));
                } catch (error) {
                    console.error("Batch upload failed", error);
                    toast.error("Partial Sync: Some items failed to upload.");
                    // Continue to next batch
                }
            }
        } catch (e) {
            console.error("Push inventory error", e);
        }
    };

    const syncData = async () => {
      if (isSyncing.current) return;
      isSyncing.current = true;

      const canSync = await checkStorageQuota();
      if (!canSync) {
          isSyncing.current = false;
          return;
      }

      const toastId = toast.loading("Syncing data...");

      try {
        // Push first
        await pushInventory();

        // Then Pull
        const [inventoryRes, kitsRes, plansRes] = await Promise.all([
            fetch("/api/inventory"),
            fetch("/api/kits"),
            fetch("/api/plans")
        ]);

        if (inventoryRes.ok) {
            const data = await inventoryRes.json();
            const items = Array.isArray(data) ? data : [];
            await db.inventory.bulkPut(items.map((i: any) => ({ ...i, sync_status: 'synced' })));
        }

        if (kitsRes.ok) {
            const data = await kitsRes.json();
            const items = Array.isArray(data) ? data : [];
            await db.kits.bulkPut(items.map((i: any) => ({ ...i, sync_status: 'synced' })));
        }

        if (plansRes.ok) {
            const data = await plansRes.json();
            const items = Array.isArray(data) ? data : [];
            await db.plans.bulkPut(items.map((i: any) => ({ ...i, sync_status: 'synced' })));
        }

        toast.success("Sync complete", { id: toastId });
      } catch (error) {
        console.error("Sync failed", error);
        toast.error("Sync failed", { id: toastId });
      } finally {
        isSyncing.current = false;
      }
    };

    // Trigger sync
    syncData();

  }, [isSignedIn, isOffline]);

  return null;
}
