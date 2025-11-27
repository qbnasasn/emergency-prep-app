"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Radio, Play, Square, Activity, Volume2, VolumeX, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Import from the library
// Using deep imports as permitted by package exports
import { Demodulator } from "@jtarrio/webrtlsdr/demod/demodulator.js"
import { getMode } from "@jtarrio/webrtlsdr/demod/modes.js"
import { Radio as RtlRadio } from "@jtarrio/webrtlsdr/radio.js"
import { RTL2832U_Provider } from "@jtarrio/webrtlsdr/rtlsdr.js"

interface WebRtlsdrInterfaceProps {
  className?: string
}

export function WebRtlsdrInterface({ className }: WebRtlsdrInterfaceProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [frequency, setFrequency] = useState(88.5)
  const [volume, setVolume] = useState(1)
  const [mode, setMode] = useState("WBFM")
  const [gain, setGain] = useState<number | "auto">("auto")
  const [error, setError] = useState<string | null>(null)
  const [supported, setSupported] = useState(true)
  const [frequencyInput, setFrequencyInput] = useState("88.5")

  const radioRef = useRef<any>(null)
  const demodulatorRef = useRef<any>(null)

  useEffect(() => {
    setFrequencyInput(frequency.toString())
  }, [frequency])

  useEffect(() => {
    // Check for WebUSB support
    if (typeof navigator !== 'undefined' && !navigator.usb) {
      setSupported(false)
    }
  }, [])

  const initRadio = async () => {
    try {
      const provider = new RTL2832U_Provider()
      const demodulator = new Demodulator()
      const radio = new RtlRadio(provider, demodulator)

      radioRef.current = radio
      demodulatorRef.current = demodulator

      // Set initial state
      await radio.setFrequency(Math.floor(frequency * 1000000))
      demodulator.setVolume(volume)
      demodulator.setMode(getMode(mode))

      const gainValue = gain === "auto" ? null : gain
      await radio.setGain(gainValue)

      await radio.start()
      setIsPlaying(true)
      setError(null)
    } catch (err: any) {
      console.error("Failed to initialize radio:", err)
      setError(err.message || "Failed to connect to RTL-SDR device. Make sure it is plugged in.")
      setIsPlaying(false)
    }
  }

  const stopRadio = async () => {
    if (radioRef.current) {
      try {
        await radioRef.current.stop()
        setIsPlaying(false)
      } catch (err: any) {
        console.error("Failed to stop radio:", err)
      }
    }
  }

  const togglePlay = async () => {
    if (isPlaying) {
      await stopRadio()
    } else {
      await initRadio()
    }
  }

  const handleFrequencyChange = async (value: number[]) => {
    const newFreq = value[0]
    setFrequency(newFreq)
    if (radioRef.current && isPlaying) {
      try {
        await radioRef.current.setFrequency(Math.floor(newFreq * 1000000))
      } catch (err) {
        console.error("Failed to set frequency:", err)
      }
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVol = value[0]
    setVolume(newVol)
    if (demodulatorRef.current) {
      demodulatorRef.current.setVolume(newVol)
    }
  }

  const handleModeChange = (newMode: string) => {
    setMode(newMode)
    if (demodulatorRef.current) {
      demodulatorRef.current.setMode(getMode(newMode))
    }
  }

  const handleGainChange = async (value: number[]) => {
    const newGain = value[0]
    setGain(newGain)
    if (radioRef.current && isPlaying) {
       await radioRef.current.setGain(newGain)
    }
  }

  const toggleAutoGain = async (auto: boolean) => {
    const newGain = auto ? "auto" : 0
    setGain(newGain)
    if (radioRef.current && isPlaying) {
      await radioRef.current.setGain(auto ? null : 0)
    }
  }

  const handleFrequencyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFrequencyInput(e.target.value)
  }

  const handleFrequencyInputCommit = () => {
    const val = parseFloat(frequencyInput)
    if (!isNaN(val) && val >= 24 && val <= 1766) {
      handleFrequencyChange([val])
    } else {
      setFrequencyInput(frequency.toString())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleFrequencyInputCommit()
      e.currentTarget.blur()
    }
  }

  // Handle cleanup
  useEffect(() => {
    return () => {
      if (radioRef.current && isPlaying) {
        radioRef.current.stop().catch(console.error)
      }
    }
  }, [isPlaying])

  if (!supported) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="font-heading text-xl flex items-center">
            <Radio className="h-5 w-5 mr-2 text-primary" />
            Software Defined Radio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Not Supported</AlertTitle>
            <AlertDescription>
              WebUSB is not supported in this browser. Please use Chrome, Edge, or Opera to access RTL-SDR devices.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <Radio className="h-5 w-5 text-primary" />
          <CardTitle className="font-heading text-xl">RTL-SDR Receiver</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
             <Badge variant={isPlaying ? "default" : "secondary"}>
            {isPlaying ? "Live" : "Standby"}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
          <div className="space-y-1">
            <div className="text-3xl font-heading font-bold text-primary">
              {frequency.toFixed(3)} <span className="text-lg text-muted-foreground">MHz</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground font-body">
              <Activity className="h-4 w-4" />
              <span>{mode} Demodulation</span>
            </div>
          </div>
          <Button
            size="lg"
            variant={isPlaying ? "destructive" : "default"}
            onClick={togglePlay}
            className="h-12 w-12 rounded-full p-0"
          >
            {isPlaying ? <Square className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium font-body">Frequency (MHz)</label>
              <Input
                type="number"
                value={frequencyInput}
                onChange={handleFrequencyInputChange}
                onBlur={handleFrequencyInputCommit}
                onKeyDown={handleKeyDown}
                className="w-32 h-8 font-mono text-right"
                step="0.001"
              />
            </div>
            <Slider
              value={[frequency]}
              min={24}
              max={1766}
              step={0.1}
              onValueChange={handleFrequencyChange}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground font-body">
              <span>24 MHz</span>
              <span>1766 MHz</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium font-body">Mode</label>
              <Select value={mode} onValueChange={handleModeChange}>
                <SelectTrigger className="font-body">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WBFM">WBFM (Radio)</SelectItem>
                  <SelectItem value="NBFM">NBFM (Comms)</SelectItem>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="USB">USB</SelectItem>
                  <SelectItem value="LSB">LSB</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium font-body">Volume</label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleVolumeChange([volume === 0 ? 1 : 0])}
                >
                  {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Slider
                  value={[volume]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2 border-t">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-gain" className="font-body">
              Automatic Gain Control
            </Label>
            <Switch
              id="auto-gain"
              checked={gain === "auto"}
              onCheckedChange={toggleAutoGain}
            />
          </div>

          {gain !== "auto" && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="font-body text-xs">RF Gain (dB)</Label>
                <span className="text-xs text-muted-foreground">{gain} dB</span>
              </div>
              <Slider
                value={[gain]}
                min={0}
                max={50}
                step={1}
                onValueChange={handleGainChange}
              />
            </div>
          )}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-200 font-body flex items-start">
            <Radio className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
            Connect a compatible RTL-SDR USB dongle to receive live radio signals directly in your browser.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
