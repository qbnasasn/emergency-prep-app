"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { db } from "@/lib/db/local";

export function useOfflineAuth() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const [offlineUser, setOfflineUser] = useState<any>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineLoaded, setOfflineLoaded] = useState(false);

  useEffect(() => {
    // Initial check
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Sync Clerk user to Dexie when available
  useEffect(() => {
    if (clerkLoaded && clerkUser) {
      const serializedUser = JSON.parse(JSON.stringify(clerkUser));
      db.user_settings.put({ key: "profile", value: serializedUser }).catch(console.error);
    }
  }, [clerkLoaded, clerkUser]);

  // Load from Dexie when offline
  useEffect(() => {
    if (isOffline) {
      db.user_settings.get("profile").then((record) => {
        if (record) {
          setOfflineUser(record.value);
        }
        setOfflineLoaded(true);
      }).catch((e) => {
        console.error(e);
        setOfflineLoaded(true);
      });
    } else {
        setOfflineUser(null);
    }
  }, [isOffline]);

  const user = (isOffline && !clerkUser) ? offlineUser : clerkUser;
  const isSignedIn = !!user;

  // If we are online, we rely on clerkLoaded.
  // If we are offline, we rely on offlineLoaded (Dexie fetch complete).
  // But if we have a user from either, we are effectively loaded for that context.
  const isLoaded = isOffline ? offlineLoaded : clerkLoaded;

  return {
    user,
    isLoaded,
    isSignedIn,
    isOffline,
  };
}
