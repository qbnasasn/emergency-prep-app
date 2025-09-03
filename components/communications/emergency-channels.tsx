"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Phone, Radio, Satellite, Volume2, VolumeX } from "lucide-react"

interface EmergencyChannel {
  id: string
  name: string
  type: "voice" | "digital" | "emergency"
  frequency: string
  status: "active" | "monitoring" | "offline"
  lastActivity: string
  priority: "critical" | "high" | "medium"
}

const emergencyChannels: EmergencyChannel[] = [
  {
    id: "1",
    name: "Local Emergency Services",
    type: "emergency",
    frequency: "911",
    status: "active",
    lastActivity: "Always available",
    priority: "critical",
  },
  {
    id: "2",
    name: "NOAA Weather Alert",
    type: "voice",
    frequency: "162.550 MHz",
    status: "monitoring",
    lastActivity: "2 minutes ago",
    priority: "high",
  },
  {
    id: "3",
    name: "GMRS Emergency Channel",
    type: "voice",
    frequency: "462.675 MHz",
    status: "monitoring",
    lastActivity: "15 minutes ago",
    priority: "high",
  },
  {
    id: "4",
    name: "Maritime Distress",
    type: "voice",
    frequency: "156.800 MHz",
    status: "monitoring",
    lastActivity: "1 hour ago",
    priority: "critical",
  },
  {
    id: "5",
    name: "Amateur Radio Emergency",
    type: "voice",
    frequency: "146.520 MHz",
    status: "offline",
    lastActivity: "3 hours ago",
    priority: "medium",
  },
]

export function EmergencyChannels() {
  const [channels, setChannels] = useState<EmergencyChannel[]>(emergencyChannels)

  const toggleMonitoring = (channelId: string) => {
    setChannels(
      channels.map((channel) =>
        channel.id === channelId
          ? {
              ...channel,
              status: channel.status === "monitoring" ? "offline" : "monitoring",
            }
          : channel,
      ),
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "monitoring":
        return "bg-blue-100 text-blue-800"
      case "offline":
        return "bg-muted text-foreground"
      default:
        return "bg-muted text-foreground"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-muted text-foreground"
    }
  }

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "emergency":
        return Phone
      case "voice":
        return Radio
      case "digital":
        return Satellite
      default:
        return Radio
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center">
          <Radio className="h-5 w-5 mr-2 text-red-500" />
          Emergency Channels
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {channels.map((channel) => {
            const IconComponent = getChannelIcon(channel.type)
            return (
              <div key={channel.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-body font-medium text-foreground">{channel.name}</div>
                      <div className="font-body text-sm text-muted-foreground">{channel.frequency}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPriorityColor(channel.priority)}>{channel.priority}</Badge>
                    <Badge className={getStatusColor(channel.status)}>{channel.status}</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="font-body text-xs text-muted-foreground">Last activity: {channel.lastActivity}</div>
                  <div className="flex space-x-2">
                    {channel.type !== "emergency" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleMonitoring(channel.id)}
                        className="font-body bg-transparent"
                      >
                        {channel.status === "monitoring" ? (
                          <>
                            <VolumeX className="h-3 w-3 mr-1" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3 w-3 mr-1" />
                            Monitor
                          </>
                        )}
                      </Button>
                    )}
                    {channel.type === "emergency" && (
                      <Button size="sm" className="font-body bg-red-600 hover:bg-red-700">
                        <Phone className="h-3 w-3 mr-1" />
                        Call
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="p-3 bg-red-50 rounded-lg">
          <p className="font-body text-sm text-red-800">
            <strong>Emergency Mode Active:</strong> All critical channels are being monitored. Emergency services can be
            contacted immediately via the buttons above.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
