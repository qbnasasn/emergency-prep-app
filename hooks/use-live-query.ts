"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { useOfflineAuth } from "@/hooks/use-offline-auth";
import type { Table } from "dexie";

export function useSmartQuery<T>(
  table: Table<T, any>,
  endpoint: string
) {
  const { isOffline, isSignedIn } = useOfflineAuth();
  const [isFetching, setIsFetching] = useState(false);

  // Always subscribe to local Dexie data
  const data = useLiveQuery(() => table.toArray());

  // Background Sync when Online
  useEffect(() => {
    if (isOffline || !isSignedIn) return;

    const fetchData = async () => {
      setIsFetching(true);
      try {
        const res = await fetch(endpoint);
        if (res.ok) {
          const remoteData = await res.json();
          if (Array.isArray(remoteData)) {
            const items = remoteData.map((item: any) => ({
              ...item,
              sync_status: 'synced'
            }));
            await table.bulkPut(items);
          }
        }
      } catch (error) {
        console.error(`SmartQuery sync failed for ${endpoint}`, error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [isOffline, isSignedIn, endpoint, table]);

  return {
    data: data || [],
    isLoading: data === undefined, // Dexie is loading initial data
    isRefreshing: isFetching,      // Background fetch is happening
    source: isOffline ? 'local' : 'remote'
  };
}
