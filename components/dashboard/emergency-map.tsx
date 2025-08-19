"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Navigation, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EmergencyMap() {
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    // TODO: Initialize Google Maps with API key: AIzaSyBuJuvMeN-oGqnQOOoMSnp5F5NraI8HZ70
    // This would load the actual Google Maps JavaScript API
    setTimeout(() => {
      setMapLoaded(true)
    }, 1500)
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-500" />
          <CardTitle className="font-heading text-xl">Emergency Map</CardTitle>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm">
            <Navigation className="h-4 w-4 mr-2" />
            My Location
          </Button>
          <Button variant="ghost" size="sm">
            <Layers className="h-4 w-4 mr-2" />
            Layers
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
          {!mapLoaded ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="font-body text-gray-600">Loading Google Maps...</p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="font-heading font-bold text-lg text-gray-900 mb-2">Interactive Emergency Map</h3>
                <p className="font-body text-gray-600 max-w-md">
                  Google Maps integration will display:
                  <br />• Emergency kit locations with GPS coordinates
                  <br />• Weather alert overlays
                  <br />• Evacuation routes
                  <br />• Emergency services nearby
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-body text-sm text-gray-600">Emergency Kits</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="font-body text-sm text-gray-600">Weather Alerts</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-body text-sm text-gray-600">Safe Locations</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
