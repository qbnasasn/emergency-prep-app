"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Power, AlertTriangle, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function CommunicationsHeader() {
  const [emergencyMode, setEmergencyMode] = useState(false)
  const [isBroadcasting, setIsBroadcasting] = useState(false)

  const handleEmergencyToggle = async () => {
    // If activating emergency, we trigger the broadcast
    if (!emergencyMode) {
      setIsBroadcasting(true)

      try {
        const response = await fetch('/api/communications/emergency-broadcast', {
            method: 'POST'
        });

        const data = await response.json();

        if (!response.ok) {
            toast.error("Failed to initiate emergency broadcast");
            setIsBroadcasting(false);
            return; // Don't toggle state if API completely failed
        }

        // Handle specific statuses
        if (data.status === 'sent') {
            toast.success(`Emergency Broadcast sent to ${data.recipientCount} recipients.`);
        } else if (data.status === 'simulated') {
            toast.warning(`Emergency Activated (Email simulation - System Key Missing).`, {
                description: "Emails were not sent because the system is in simulation mode."
            });
        } else if (data.status === 'no_recipients') {
            toast.warning("Emergency Activated, but no recipients found.");
        } else if (data.status === 'no_plans') {
            toast.warning("Emergency Activated, but no active plans found to share.");
        } else {
            toast.success("Emergency Mode Activated");
        }

        setEmergencyMode(true);

      } catch (error) {
        console.error("Broadcast error:", error);
        toast.error("Network error while activating emergency");
      } finally {
        setIsBroadcasting(false);
      }
    } else {
      // Deactivating is simple
      setEmergencyMode(false)
      toast.info("Emergency mode deactivated")
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
      <div>
        <h1 className="font-heading font-black text-3xl text-foreground">Communications Center</h1>
        <p className="font-body text-muted-foreground mt-1">Emergency command center for all communication systems</p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Badge className={emergencyMode ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
            <Power className="h-3 w-3 mr-1" />
            {emergencyMode ? "Emergency Mode" : "Normal Mode"}
          </Badge>
        </div>

        <Button
          onClick={handleEmergencyToggle}
          disabled={isBroadcasting}
          className={`font-body ${emergencyMode ? "bg-green-600 hover:bg-green-700" : "bg-destructive hover:bg-red-700"}`}
        >
          {isBroadcasting ? (
             <>
               <Loader2 className="h-4 w-4 mr-2 animate-spin" />
               Broadcasting...
             </>
          ) : emergencyMode ? (
            <>
              <Power className="h-4 w-4 mr-2" />
              Exit Emergency
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Activate Emergency
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
