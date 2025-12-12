"use client";

import { useEffect, useRef } from "react";
import { useOfflineAuth } from "@/hooks/use-offline-auth";
import { db } from "@/lib/db/local";
import { toast } from "sonner";

export function SyncManager() {
  const { isSignedIn, isOffline } = useOfflineAuth();
  const isSyncing = useRef(false);

  useEffect(() => {
    // Only sync if online and signed in
    if (isOffline || !isSignedIn) {
        return;
    }

    const syncData = async () => {
      if (isSyncing.current) return;
      isSyncing.current = true;

      const toastId = toast.loading("Syncing data...");

      try {
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
