"use client";

import { useAuthUser } from "@/components/auth/auth-provider";
import { useState, useEffect } from "react";
import { db } from "@/lib/db/local";

export function useOfflineAuth() {
  const { user: sessionUser, isLoaded: sessionLoaded } = useAuthUser();
  const [offlineUser, setOfflineUser] = useState<any>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineLoaded, setOfflineLoaded] = useState(false);

  useEffect(() => {
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

  // Sync authenticated user to Dexie when available
  useEffect(() => {
    if (sessionLoaded && sessionUser) {
      db.user_settings.put({ key: "profile", value: sessionUser }).catch(console.error);
    }
  }, [sessionLoaded, sessionUser]);

  // Load from Dexie when offline
  useEffect(() => {
    if (isOffline) {
      db.user_settings
        .get("profile")
        .then((record) => {
          if (record) {
            setOfflineUser(record.value);
          }
          setOfflineLoaded(true);
        })
        .catch((e) => {
          console.error(e);
          setOfflineLoaded(true);
        });
    } else {
      setOfflineUser(null);
    }
  }, [isOffline]);

  const user = isOffline && !sessionUser ? offlineUser : sessionUser;
  const isSignedIn = !!user;
  const isLoaded = isOffline ? offlineLoaded : sessionLoaded;

  return {
    user,
    isLoaded,
    isSignedIn,
    isOffline,
  };
}
