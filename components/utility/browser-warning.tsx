"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";

export function BrowserWarning() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent;
      // "Edg" is the token for Edge (Chromium). "Edge" is Legacy Edge.
      const isEdge = userAgent.indexOf("Edg") > -1;
      const hasDismissed = sessionStorage.getItem("edge-warning-dismissed");

      if (isEdge && !hasDismissed) {
        setIsOpen(true);
      }
    }
  }, []);

  const handleContinue = () => {
    sessionStorage.setItem("edge-warning-dismissed", "true");
    setIsOpen(false);
  };

  if (!mounted) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <TriangleAlert className="h-5 w-5" />
            Compatibility Warning
          </DialogTitle>
          <DialogDescription className="pt-2">
            This application&apos;s Offline Sync features are optimized for Google Chrome.
            You may experience loading issues on Microsoft Edge.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleContinue}>
            Continue Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
