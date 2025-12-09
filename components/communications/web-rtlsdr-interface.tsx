"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Radio, Play, Square, Activity, Volume2, VolumeX, AlertTriangle, Save, Trash2, Zap, Waves } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog"

// Import from the library
// Using deep imports as permitted by package exports
import { Demodulator } from "@jtarrio/webrtlsdr/demod/demodulator.js"
import { getMode, modeParameters } from "@jtarrio/webrtlsdr/demod/modes.js"
import { Radio as RtlRadio } from "@jtarrio/webrtlsdr/radio.js"
import { RTL2832U_Provider } from "@jtarrio/webrtlsdr/rtlsdr.js"

class CustomAudioPlayer {
  static OUT_RATE = 48000
  static TIME_BUFFER = 0.05

  lastPlayedAt = -1
  ac: AudioContext | undefined
  gainNode: GainNode | undefined
  analyser: AnalyserNode | undefined
  gain = 1

  play(leftSamples: Float32Array, rightSamples: Float32Array) {
    if (!this.ac || !this.gainNode) {
      this.ac = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.ac.resume().catch(console.error) // Force resume on start

      this.gainNode = this.ac.createGain()
      this.gainNode.gain.value = this.gain

      // Setup Analyser
      this.analyser = this.ac.createAnalyser()
      this.analyser.fftSize = 2048
      this.analyser.smoothingTimeConstant = 0.8

      // Connect: Source -> Gain -> Analyser -> Destination
      this.gainNode.connect(this.analyser)
      this.analyser.connect(this.ac.destination)
    }

    const buffer = this.ac.createBuffer(2, leftSamples.length, CustomAudioPlayer.OUT_RATE)
    buffer.getChannelData(0).set(leftSamples)
    buffer.getChannelData(1).set(rightSamples)

    const source = this.ac.createBufferSource()
    source.buffer = buffer
    source.connect(this.gainNode)

    this.lastPlayedAt = Math.max(
      this.lastPlayedAt + leftSamples.length / CustomAudioPlayer.OUT_RATE,
      this.ac.currentTime + CustomAudioPlayer.TIME_BUFFER,
    )
    source.start(this.lastPlayedAt)
  }

  setVolume(volume: number) {
    // Logarithmic / Exponential curve for better audible range
    // Volume input is 0-10 (linear from slider)
    // We map 0-10 to an exponential gain curve.
    // Using cubic curve: gain = (vol/10)^3 * maxGain
    // A maxGain of 2.0 or 3.0 helps boost quiet signals on laptops.
    const maxGain = 3.0
    const normalized = Math.max(0, Math.min(volume, 10)) / 10

    // Apply cubic curve
    this.gain = Math.pow(normalized, 3) * maxGain

    if (this.gainNode) {
      this.gainNode.gain.value = this.gain
    }
  }

  getVolume() {
    // Reverse the calculation to return linear 0-10 for UI if needed,
    // but we usually just track the slider state in the component.
    return this.gain
  }

  getByteFrequencyData(array: Uint8Array) {
      if (this.analyser) {
          this.analyser.getByteFrequencyData(array)
      }
  }

  get sampleRate() {
    return this.ac ? this.ac.sampleRate : 48000
  }

  async setOutputDevice(deviceId: string) {
    if (this.ac && typeof (this.ac as any).setSinkId === "function") {
      try {
        await (this.ac as any).setSinkId(deviceId)
      } catch (err) {
        console.error("Failed to set audio output device:", err)
      }
    }
  }
}

interface SavedFrequency {
  id: string
  frequency: string // numeric string from DB
  description: string | null
  mode: string | null
  created_at: string
}

interface WebRtlsdrInterfaceProps {
  className?: string
  externalTune?: { freq: number; mode: string } | null
}

export function WebRtlsdrInterface({ className, externalTune }: WebRtlsdrInterfaceProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [frequency, setFrequency] = useState(88.5)
  const [volume, setVolume] = useState(5) // Default to mid-range (linear)
  const [mode, setMode] = useState("WBFM")
  const [gain, setGain] = useState<number | "auto">("auto")
  const [biasTee, setBiasTee] = useState(false)
  const [tunerType, setTunerType] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [supported, setSupported] = useState(true)
  const [frequencyInput, setFrequencyInput] = useState("88.5")
  const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>("default")
  const [ppm, setPpm] = useState(0)
  const [squelch, setSquelch] = useState(0)

  // Saved Frequencies State
  const [savedFrequencies, setSavedFrequencies] = useState<SavedFrequency[]>([])
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [newFreqDescription, setNewFreqDescription] = useState("")

  const radioRef = useRef<any>(null)
  const demodulatorRef = useRef<any>(null)
  const playerRef = useRef<CustomAudioPlayer | null>(null)
  const providerRef = useRef<any>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  // React to external tune
  useEffect(() => {
    if (externalTune) {
      setFrequency(externalTune.freq)
      setFrequencyInput(externalTune.freq.toString())
      setMode(externalTune.mode)
      handleFrequencyChange([externalTune.freq]) // Tune radio
      handleModeChange(externalTune.mode) // Set mode
    }
  }, [externalTune])

  useEffect(() => {
    setFrequencyInput(frequency.toString())
  }, [frequency])

  useEffect(() => {
    const getDevices = async () => {
      if (typeof navigator !== "undefined" && navigator.mediaDevices) {
        try {
          const devs = await navigator.mediaDevices.enumerateDevices()
          const outputs = devs.filter((d) => d.kind === "audiooutput" && d.deviceId !== "")
          setOutputDevices(outputs)
        } catch (e) {
          console.error("Failed to enumerate devices", e)
        }
      }
    }
    getDevices()
    navigator.mediaDevices?.addEventListener("devicechange", getDevices)
    return () => navigator.mediaDevices?.removeEventListener("devicechange", getDevices)
  }, [])

  useEffect(() => {
    // Check for WebUSB support
    if (typeof navigator !== 'undefined' && !navigator.usb) {
      setSupported(false)
    }
    fetchSavedFrequencies();
  }, [])

  const fetchSavedFrequencies = async () => {
    try {
        const res = await fetch('/api/communications/saved-frequencies');
        if (res.ok) {
            const data = await res.json();
            setSavedFrequencies(data);
        }
    } catch (e) {
        console.error("Failed to fetch saved frequencies", e);
    }
  }

  const handleSaveFrequency = async () => {
      try {
          const res = await fetch('/api/communications/saved-frequencies', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  frequency: frequency,
                  description: newFreqDescription || `Frequency ${frequency.toFixed(4)}`,
                  mode: mode
              })
          });
          if (res.ok) {
              toast.success("Frequency saved");
              setNewFreqDescription("");
              setIsSaveDialogOpen(false);
              fetchSavedFrequencies();
          } else {
              toast.error("Failed to save frequency");
          }
      } catch (e) {
          toast.error("Error saving frequency");
      }
  }

  const handleDeleteFrequency = async (id: string) => {
      try {
          const res = await fetch(`/api/communications/saved-frequencies/${id}`, {
              method: 'DELETE'
          });
          if (res.ok) {
              toast.success("Frequency deleted");
              fetchSavedFrequencies();
          } else {
              toast.error("Failed to delete");
          }
      } catch (e) {
          toast.error("Error deleting");
      }
  }

  const handleRecallFrequency = (saved: SavedFrequency) => {
      const freq = parseFloat(saved.frequency);
      if (!isNaN(freq)) {
          setFrequency(freq);
          setFrequencyInput(freq.toString());
          handleFrequencyChange([freq]);
          if (saved.mode) {
              handleModeChange(saved.mode);
          }
      }
  }

  const drawVisualizer = useCallback(() => {
    if (!canvasRef.current || !playerRef.current || !playerRef.current.analyser) {
         animationRef.current = requestAnimationFrame(drawVisualizer);
         return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = playerRef.current.analyser;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    playerRef.current.getByteFrequencyData(dataArray);

    // Clear with Cyberpunk Black
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid lines
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let i=0; i<canvas.width; i+=40) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
    }
    for(let i=0; i<canvas.height; i+=20) {
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
    }
    ctx.stroke();

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    for(let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        // Cyberpunk colors: Green base, Red tips for spikes
        // "Matrix" style
        let r = 0;
        let g = barHeight + 20;
        let b = 0;

        if (barHeight > 180) {
             // Spike detected (Red/Orange)
             r = barHeight;
             g = barHeight > 220 ? 0 : 100; // Pure red for very high peaks
             b = 0;
        } else {
             // Normal signal (Green)
             r = 0;
             g = Math.min(255, barHeight + 50);
             b = 0;
        }

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, canvas.height - barHeight / 1.5, barWidth, barHeight / 1.5);

        x += barWidth + 1;
    }

    animationRef.current = requestAnimationFrame(drawVisualizer);
  }, []);

  useEffect(() => {
    if (isPlaying) {
        animationRef.current = requestAnimationFrame(drawVisualizer);
    } else {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
    return () => {
         if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
  }, [isPlaying, drawVisualizer]);


  const initRadio = async () => {
    try {
      const provider = new RTL2832U_Provider()
      providerRef.current = provider;

      const player = new CustomAudioPlayer()
      playerRef.current = player
      // Apply initial volume
      player.setVolume(volume)

      const demodulator = new Demodulator(player as any)
      const radio = new RtlRadio(provider, demodulator)

      radioRef.current = radio
      demodulatorRef.current = demodulator

      // Open the device to check tuner type (if exposed by provider)
      // Note: We need to start the radio to get some info, but usually checking properties works after open.
      // Assuming 'open' happens implicitly or during init.
      // We will check for R828D logic here if applicable.

      // Set initial state
      await radio.setFrequency(Math.floor(frequency * 1000000))
      demodulator.setVolume(1) // Demodulator internal volume, we control gain via player
      demodulator.setMode(getMode(mode))

      // Check Tuner Type if possible
      // This is speculative based on common library properties,
      // but if provider has `tunerType` we use it.
      if ((provider as any).tunerType) {
          setTunerType((provider as any).tunerType);
          if ((provider as any).tunerType === 'R828D') {
              console.log("R828D Tuner Detected - Optimizing defaults");
              // R828D often benefits from Auto gain initially
              if (gain === "auto") {
                   await radio.setGain(null); // Auto
              }
          }
      } else {
          // Fallback check
          // Some libraries expose it on the radio instance
          setTunerType("Standard (R820T/2)");
      }

      const gainValue = gain === "auto" ? null : gain
      await radio.setGain(gainValue)

      radio.setSampleRate(2048000)
      await radio.setFrequencyCorrection(ppm)

      // Restore Bias Tee state if it was enabled
      if (biasTee) {
          toggleBiasTee(true);
      }

      radio.addEventListener("error", (e: any) => {
        console.error("Radio error:", e)
        setError(e.detail?.exception?.message || "Radio error occurred")
        setIsPlaying(false)
        radioRef.current = null
      })

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
      } catch (err: any) {
        console.error("Failed to stop radio:", err)
      }
      radioRef.current = null
      setIsPlaying(false)
    }
  }

  const togglePlay = async () => {
    if (isPlaying) {
      await stopRadio()
    } else {
      await initRadio()
    }
  }

  const toggleBiasTee = async (enabled: boolean) => {
      setBiasTee(enabled);

      // Only attempt to send command if radio/provider is active
      // But user might toggle before start. If so, we handle in initRadio.
      if (!radioRef.current && !providerRef.current) return;

      const provider = providerRef.current;
      const radio = radioRef.current;

      try {
          let success = false;

          // Strategy 1: Offset Tuning Hack (Common for V3/V4)
          // Toggles GPIO connected to Bias Tee
          if (radio && typeof radio.setOffsetTuning === 'function') {
              await radio.setOffsetTuning(enabled);
              success = true;
          } else if (provider && typeof provider.setOffsetTuning === 'function') {
              await provider.setOffsetTuning(enabled);
              success = true;
          }

          // Strategy 2: Direct GPIO (if library supports it)
          // R828D / V4 might use specific GPIO calls
          if (!success && provider && typeof provider.setBiasTee === 'function') {
              await provider.setBiasTee(enabled);
              success = true;
          }

          if (success) {
              toast.success(`Bias Tee Power ${enabled ? 'ON' : 'OFF'}`, {
                  description: "Check V4 LED indicator."
              });
          } else {
              // If we couldn't find a function, we warn but still set state
              // so initRadio might try again or user knows intent.
              console.warn("No direct Bias Tee control found on provider/radio.");
              if (isPlaying) {
                 toast.warning("Driver may not support Bias Tee toggle.");
              }
          }
      } catch (e) {
          console.error("Bias Tee Toggle Error", e);
          toast.error("Failed to toggle Bias Tee");
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
    if (playerRef.current) {
      playerRef.current.setVolume(newVol)
    }
  }

  const handleModeChange = (newMode: string) => {
    setMode(newMode)
    if (demodulatorRef.current) {
      const m = getMode(newMode)
      demodulatorRef.current.setMode(m)

      const params = modeParameters(m)
      if (params.hasSquelch()) {
        setSquelch(params.getSquelch())
      }
    }
  }

  const handleSquelchChange = (value: number[]) => {
    const newSquelch = value[0]
    setSquelch(newSquelch)
    if (demodulatorRef.current) {
      const currentMode = demodulatorRef.current.getMode()
      const params = modeParameters(currentMode)
      if (params.hasSquelch()) {
        params.setSquelch(newSquelch)
        demodulatorRef.current.setMode(params.mode)
      }
    }
  }

  const handleGainChange = async (value: number[]) => {
    const newGain = value[0]
    setGain(newGain)
    if (radioRef.current && isPlaying) {
       await radioRef.current.setGain(newGain)
    }
  }

  const handleDeviceChange = async (deviceId: string) => {
    setSelectedDevice(deviceId)
    if (playerRef.current) {
      await playerRef.current.setOutputDevice(deviceId)
    }
  }

  const toggleAutoGain = async (auto: boolean) => {
    const newGain = auto ? "auto" : 30
    setGain(newGain)
    if (radioRef.current && isPlaying) {
      await radioRef.current.setGain(auto ? null : 30)
    }
  }

  const handlePpmChange = async (value: number[]) => {
    const newPpm = value[0]
    setPpm(newPpm)
    if (radioRef.current && isPlaying) {
      await radioRef.current.setFrequencyCorrection(newPpm)
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
            {tunerType && (
                 <Badge variant="outline" className="text-[10px] hidden sm:flex">
                     {tunerType}
                 </Badge>
            )}
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
              {frequency.toFixed(4)} <span className="text-lg text-muted-foreground">MHz</span>
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

        {/* Spectral Visualizer Canvas */}
        <div className="relative w-full h-32 bg-black rounded-md overflow-hidden border border-gray-800 shadow-inner">
             <canvas
                ref={canvasRef}
                width={600}
                height={128}
                className="w-full h-full"
             />
             <div className="absolute top-1 left-2 text-[10px] text-green-500/50 font-mono">
                 AUDIO SPECTRUM
             </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-2">
              <label className="text-sm font-medium font-body whitespace-nowrap">Frequency (MHz)</label>
              <div className="flex items-center gap-2 w-full">
                  <Input
                    type="number"
                    value={frequencyInput}
                    onChange={handleFrequencyInputChange}
                    onBlur={handleFrequencyInputCommit}
                    onKeyDown={handleKeyDown}
                    className="h-8 font-mono text-right flex-1"
                    step="0.0001"
                  />
                  <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                      <DialogTrigger asChild>
                          <Button size="icon" variant="outline" className="h-8 w-8">
                              <Save className="h-4 w-4" />
                          </Button>
                      </DialogTrigger>
                      <DialogContent>
                          <DialogHeader>
                              <DialogTitle>Save Frequency</DialogTitle>
                              <DialogDescription>Save this frequency to your list for quick access.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 pt-2">
                              <div className="grid gap-2">
                                  <Label>Frequency</Label>
                                  <Input value={frequency.toFixed(4)} disabled />
                              </div>
                              <div className="grid gap-2">
                                  <Label>Mode</Label>
                                  <Input value={mode} disabled />
                              </div>
                              <div className="grid gap-2">
                                  <Label>Description</Label>
                                  <Input
                                      placeholder="e.g. NOAA Weather, Local Repeater"
                                      value={newFreqDescription}
                                      onChange={(e) => setNewFreqDescription(e.target.value)}
                                  />
                              </div>
                              <Button onClick={handleSaveFrequency} className="w-full">
                                  Save Frequency
                              </Button>
                          </div>
                      </DialogContent>
                  </Dialog>
              </div>
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
                  max={10}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Saved Frequencies List */}
        {savedFrequencies.length > 0 && (
            <div className="pt-4 border-t space-y-3">
                <Label className="font-body text-sm font-medium">Saved Frequencies</Label>
                <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                    {savedFrequencies.map((saved) => (
                        <div key={saved.id} className="flex items-center justify-between p-2 rounded-md bg-muted/40 hover:bg-muted/70 group">
                            <div
                                className="flex-1 cursor-pointer"
                                onClick={() => handleRecallFrequency(saved)}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-medium">{parseFloat(saved.frequency).toFixed(4)}</span>
                                    {saved.mode && <Badge variant="outline" className="text-[10px] h-4 px-1">{saved.mode}</Badge>}
                                </div>
                                {saved.description && <div className="text-xs text-muted-foreground truncate">{saved.description}</div>}
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteFrequency(saved.id)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        <div className="space-y-4 pt-2 border-t">
          <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                  <Label htmlFor="bias-tee" className="font-body flex items-center">
                    Bias Tee (4.5V)
                    <Zap className="h-3 w-3 ml-1 text-yellow-500" />
                  </Label>
              </div>
              <Switch
                  id="bias-tee"
                  checked={biasTee}
                  onCheckedChange={toggleBiasTee}
              />
          </div>

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

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="font-body text-xs">Freq Correction (PPM)</Label>
              <span className="text-xs text-muted-foreground">{ppm}</span>
            </div>
            <Slider
              value={[ppm]}
              min={-100}
              max={100}
              step={1}
              onValueChange={handlePpmChange}
            />
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-200 font-body flex items-start">
            <Radio className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
            Connect a compatible RTL-SDR USB dongle (V3/V4 recommended).
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
