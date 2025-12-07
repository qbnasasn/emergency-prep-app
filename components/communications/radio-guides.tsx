"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Radio, Satellite, Ship, AlertTriangle, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const gmrsChannels = [
  { channel: 1, frequency: "462.5625", power: "5W", notes: "General use" },
  { channel: 2, frequency: "462.5875", power: "5W", notes: "General use" },
  { channel: 3, frequency: "462.6125", power: "5W", notes: "General use" },
  { channel: 15, frequency: "462.5500", power: "50W", notes: "Emergency/Travel" },
  { channel: 16, frequency: "462.5750", power: "50W", notes: "Emergency/Travel" },
  { channel: 17, frequency: "462.6000", power: "50W", notes: "Emergency/Travel" },
  { channel: 18, frequency: "462.6250", power: "50W", notes: "Emergency/Travel" },
  { channel: 19, frequency: "462.6500", power: "50W", notes: "Emergency" },
  { channel: 20, frequency: "462.6750", power: "50W", notes: "Emergency" },
  // Repeater inputs
  { channel: "15R (In)", frequency: "467.5500", power: "50W", notes: "Repeater Input" },
  { channel: "16R (In)", frequency: "467.5750", power: "50W", notes: "Repeater Input" },
  { channel: "17R (In)", frequency: "467.6000", power: "50W", notes: "Repeater Input" },
  { channel: "18R (In)", frequency: "467.6250", power: "50W", notes: "Repeater Input" },
  { channel: "19R (In)", frequency: "467.6500", power: "50W", notes: "Repeater Input" },
  { channel: "20R (In)", frequency: "467.6750", power: "50W", notes: "Repeater Input" },
  { channel: "21R (In)", frequency: "467.7000", power: "50W", notes: "Repeater Input" },
  { channel: "22R (In)", frequency: "467.7250", power: "50W", notes: "Repeater Input" },
]

const noaaChannels = [
  { channel: "WX1", frequency: "162.550", location: "National" },
  { channel: "WX2", frequency: "162.400", location: "National" },
  { channel: "WX3", frequency: "162.475", location: "National" },
  { channel: "WX4", frequency: "162.425", location: "National" },
  { channel: "WX5", frequency: "162.450", location: "National" },
  { channel: "WX6", frequency: "162.500", location: "National" },
  { channel: "WX7", frequency: "162.525", location: "National" },
]

const maritimeChannels = [
  { channel: 16, frequency: "156.800", purpose: "Distress/Safety/Calling", priority: "Emergency" },
  { channel: 9, frequency: "156.450", purpose: "Commercial/Non-Commercial", priority: "High" },
  { channel: 68, frequency: "156.425", purpose: "Non-Commercial", priority: "Medium" },
  { channel: 69, frequency: "156.445", purpose: "Non-Commercial", priority: "Medium" },
  { channel: 70, frequency: "156.525", purpose: "Digital Selective Calling", priority: "High" },
  { channel: 22, frequency: "157.100", purpose: "Coast Guard Liaison", priority: "High" },
]

interface RadioGuidesProps {
  onTune?: (freq: number, mode: string) => void
}

export function RadioGuides({ onTune }: RadioGuidesProps) {
  const [activeTab, setActiveTab] = useState("gmrs")

  const handleTune = (freqStr: string, mode: string) => {
    if (onTune) {
      const freq = parseFloat(freqStr)
      if (!isNaN(freq)) {
        onTune(freq, mode)
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center">
          <Radio className="h-5 w-5 mr-2 text-primary" />
          Radio Frequency Guides
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gmrs" className="font-body">
              GMRS
            </TabsTrigger>
            <TabsTrigger value="noaa" className="font-body">
              NOAA
            </TabsTrigger>
            <TabsTrigger value="maritime" className="font-body">
              Maritime
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gmrs" className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Radio className="h-4 w-4 text-primary" />
              <h3 className="font-body font-semibold text-foreground">GMRS Channels</h3>
            </div>
            <div className="space-y-2 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {gmrsChannels.map((ch) => (
                <div
                  key={ch.channel}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => handleTune(ch.frequency, "NBFM")}
                >
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-blue-100 text-blue-800 min-w-[3rem]">CH {ch.channel}</Badge>
                    <div>
                      <div className="font-body font-medium text-foreground">{ch.frequency} MHz</div>
                      <div className="font-body text-xs text-muted-foreground">{ch.notes}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={ch.power === "50W" ? "bg-orange-100 text-orange-800" : "bg-muted text-foreground"}>
                        {ch.power}
                    </Badge>
                    <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlayCircle className="h-4 w-4 text-primary" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="font-body text-sm text-blue-800">
                <strong>GMRS License Required:</strong> FCC license needed for legal operation. Channels 15-22 are
                repeater capable with higher power limits.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="noaa" className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Satellite className="h-4 w-4 text-primary" />
              <h3 className="font-body font-semibold text-foreground">NOAA Weather Radio</h3>
            </div>
            <div className="space-y-2">
              {noaaChannels.map((ch) => (
                <div
                  key={ch.channel}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => handleTune(ch.frequency, "NBFM")}
                >
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-orange-100 text-orange-800 min-w-[3rem]">{ch.channel}</Badge>
                    <div>
                      <div className="font-body font-medium text-foreground">{ch.frequency} MHz</div>
                      <div className="font-body text-xs text-muted-foreground">{ch.location} Coverage</div>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="h-4 w-4 text-primary" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="font-body text-sm text-orange-800">
                <strong>24/7 Weather Information:</strong> Continuous broadcasts of weather conditions, forecasts, and
                emergency alerts. No license required for reception.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="maritime" className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Ship className="h-4 w-4 text-primary" />
              <h3 className="font-body font-semibold text-foreground">Maritime VHF Channels</h3>
            </div>
            <div className="space-y-2">
              {maritimeChannels.map((ch) => (
                <div
                    key={ch.channel}
                    className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                    onClick={() => handleTune(ch.frequency, "NBFM")}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-blue-100 text-blue-800 min-w-[3rem]">CH {ch.channel}</Badge>
                      <div className="font-body font-medium text-foreground">{ch.frequency} MHz</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge
                        className={
                            ch.priority === "Emergency"
                            ? "bg-red-100 text-red-800"
                            : ch.priority === "High"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-muted text-foreground"
                        }
                        >
                        {ch.priority}
                        </Badge>
                        <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <PlayCircle className="h-4 w-4 text-primary" />
                        </Button>
                    </div>
                  </div>
                  <div className="font-body text-sm text-muted-foreground">{ch.purpose}</div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-destructive/10 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                <p className="font-body text-sm text-red-800">
                  <strong>Channel 16 Emergency:</strong> International distress frequency. Monitor continuously when
                  possible. Marine radio license may be required.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
