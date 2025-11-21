"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Wifi, Send, Users, MapPin, ExternalLink } from "lucide-react"

interface MeshtasticNode {
  id: string
  name: string
  distance: number
  battery: number
  lastSeen: string
  status: "online" | "offline"
}

export function MeshtasticInterface() {
  // We keep the mock data for display purposes when not "connected" to the real client,
  // or as a preview of what the interface manages.
  // The "Connect" button will now launch the external client.
  const [nodes, setNodes] = useState<MeshtasticNode[]>([])
  const [message, setMessage] = useState("")

  useEffect(() => {
    // Mock Meshtastic nodes data
    const mockNodes: MeshtasticNode[] = [
      {
        id: "!a1b2c3d4",
        name: "Base Station",
        distance: 0.1,
        battery: 100,
        lastSeen: "2024-12-22T15:30:00Z",
        status: "online",
      },
      {
        id: "!e5f6g7h8",
        name: "Mobile Unit 1",
        distance: 2.3,
        battery: 78,
        lastSeen: "2024-12-22T15:28:00Z",
        status: "online",
      },
    ]
    setNodes(mockNodes)
  }, [])

  const launchClient = () => {
    window.open("https://client.meshtastic.org", "_blank")
  }

  const formatDistance = (distance: number) => {
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`
  }

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    return diffMinutes < 1 ? "Just now" : `${diffMinutes}m ago`
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <Wifi className="h-5 w-5 text-primary" />
          <CardTitle className="font-heading text-xl">Meshtastic Network</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-muted text-foreground">
            Preview Mode
          </Badge>
          <Button size="sm" onClick={launchClient} className="font-body">
            Launch Client <ExternalLink className="ml-2 h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
            <div className="space-y-3 opacity-70 pointer-events-none select-none blur-[0.5px]">
              <h3 className="font-body font-semibold text-foreground flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Active Nodes ({nodes.length})
              </h3>
              <div className="space-y-2">
                {nodes.map((node) => (
                  <div
                    key={node.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${node.status === "online" ? "bg-primary/100" : "bg-gray-400"}`}
                      />
                      <div>
                        <div className="font-body font-medium text-foreground">{node.name}</div>
                        <div className="font-body text-xs text-muted-foreground">{node.id}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-body text-sm text-muted-foreground flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {formatDistance(node.distance)}
                      </div>
                      <div className="font-body text-xs text-muted-foreground">
                        {node.battery}% • {formatLastSeen(node.lastSeen)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 opacity-70 pointer-events-none select-none blur-[0.5px]">
              <h3 className="font-body font-semibold text-foreground">Send Message</h3>
              <div className="flex space-x-2">
                <Input
                  placeholder="Type your message..."
                  value={message}
                  readOnly
                  className="font-body"
                />
                <Button disabled className="font-body">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
               {/* Overlay content can go here if needed, but the buttons are in header */}
            </div>

            <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4 mt-4">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-body">
                <strong>Note:</strong> To interact with your Meshtastic device (Web Serial/Bluetooth), please launch the official web client. This preview shows the interface layout.
              </p>
            </div>
      </CardContent>
    </Card>
  )
}
