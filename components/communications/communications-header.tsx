"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Power, Settings, AlertTriangle } from "lucide-react"
import { useState } from "react"

export function CommunicationsHeader() {
  const [emergencyMode, setEmergencyMode] = useState(false)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
      <div>
        <h1 className="font-heading font-black text-3xl text-gray-900">Communications Center</h1>
        <p className="font-body text-gray-600 mt-1">Emergency command center for all communication systems</p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Badge className={emergencyMode ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
            <Power className="h-3 w-3 mr-1" />
            {emergencyMode ? "Emergency Mode" : "Normal Mode"}
          </Badge>
        </div>

        <Button variant="outline" size="sm" className="font-body bg-transparent">
          <Settings className="h-4 w-4 mr-2" />
          Radio Settings
        </Button>

        <Button
          onClick={() => setEmergencyMode(!emergencyMode)}
          className={`font-body ${emergencyMode ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
        >
          {emergencyMode ? (
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
