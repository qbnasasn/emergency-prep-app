"use client";

import { useOfflineAuth } from "@/hooks/use-offline-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

export function OfflineGate({ children }: { children: React.ReactNode }) {
  const { user, isLoaded, isSignedIn, isOffline } = useOfflineAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isOffline && !isSignedIn) {
      router.push("/signin");
    }
  }, [isLoaded, isOffline, isSignedIn, router]);

  if (!isLoaded) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (isOffline) {
    if (isSignedIn) {
      return (
        <>
          <div className="bg-amber-500 text-white px-4 py-2 text-sm font-medium flex items-center justify-center gap-2">
            <TriangleAlert className="h-4 w-4" />
            Offline Mode
          </div>
          {children}
        </>
      );
    } else {
      return (
        <div className="flex h-screen items-center justify-center flex-col gap-4 p-4 text-center">
            <TriangleAlert className="h-10 w-10 text-amber-500" />
            <h1 className="text-xl font-bold">Offline Access Unavailable</h1>
            <p>You need to have logged in on this device previously to access PrepSafe offline.</p>
            <p className="text-sm text-gray-500">Please connect to the internet and sign in.</p>
        </div>
      );
    }
  }

  if (isSignedIn) {
    return <>{children}</>;
  }

  return null; // Will redirect via useEffect
}
