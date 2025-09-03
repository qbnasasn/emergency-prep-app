"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Wifi, Send, Users, MapPin } from "lucide-react"

interface MeshtasticNode {
  id: string
  name: string
  distance: number
  battery: number
  lastSeen: string
  status: "online" | "offline"
}

export function MeshtasticInterface() {
  const [connected, setConnected] = useState(false)
  const [message, setMessage] = useState("")
  const [nodes, setNodes] = useState<MeshtasticNode[]>([])

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
      {
        id: "!i9j0k1l2",
        name: "Repeater North",
        distance: 5.7,
        battery: 45,
        lastSeen: "2024-12-22T15:25:00Z",
        status: "online",
      },
    ]
    setNodes(mockNodes)
  }, [])

  const connectToMeshtastic = () => {
    setConnected(!connected)
  }

  const sendMessage = () => {
    if (message.trim()) {
      // TODO: Send message via Meshtastic
      console.log("Sending message:", message)
      setMessage("")
    }
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
          <Wifi className="h-5 w-5 text-blue-500" />
          <CardTitle className="font-heading text-xl">Meshtastic Network</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={connected ? "bg-green-100 text-green-800" : "bg-muted text-foreground"}>
            {connected ? "Connected" : "Disconnected"}
          </Badge>
          <Button size="sm" onClick={connectToMeshtastic} className="font-body">
            {connected ? "Disconnect" : "Connect"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {connected ? (
          <>
            <div className="space-y-3">
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
                        className={`w-3 h-3 rounded-full ${node.status === "online" ? "bg-green-500" : "bg-gray-400"}`}
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

            <div className="space-y-3">
              <h3 className="font-body font-semibold text-foreground">Send Message</h3>
              <div className="flex space-x-2">
                <Input
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="font-body"
                />
                <Button onClick={sendMessage} disabled={!message.trim()} className="font-body">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Wifi className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="font-body text-muted-foreground mb-4">Connect to Meshtastic network to access mesh communication</p>
            <div className="text-sm font-body text-muted-foreground space-y-1">
              <p>• Long-range, low-power mesh networking</p>
              <p>• Works without internet or cell towers</p>
              <p>• Perfect for emergency communications</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
