"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface NotificationSettingsData {
  email_alerts: boolean
  weather_alerts: boolean
  inventory_alerts: boolean
  plan_reminders: boolean
  shopping_updates: boolean
}

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettingsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings/notifications')
        if (res.ok) {
          const data = await res.json()
          setSettings(data)
        }
      } catch (error) {
        console.error("Failed to fetch notification settings", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const updateSetting = async (key: keyof NotificationSettingsData, value: boolean) => {
    if (!settings) return

    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)

    try {
      const res = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      })

      if (!res.ok) throw new Error('Failed to update settings')
      toast.success("Settings updated")
    } catch (error) {
      console.error(error)
      toast.error("Failed to save settings")
      setSettings(settings) // Revert on error
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl flex items-center">
            <Bell className="h-5 w-5 mr-2 text-primary" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center">
          <Bell className="h-5 w-5 mr-2 text-primary" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-body font-medium">Weather Alerts</Label>
              <p className="font-body text-sm text-muted-foreground">NOAA weather warnings and watches</p>
            </div>
            <Switch
              checked={settings?.weather_alerts}
              onCheckedChange={(checked) => updateSetting('weather_alerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-body font-medium">Inventory Alerts</Label>
              <p className="font-body text-sm text-muted-foreground">Low stock and expiration notifications</p>
            </div>
            <Switch
              checked={settings?.inventory_alerts}
              onCheckedChange={(checked) => updateSetting('inventory_alerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-body font-medium">Plan Reminders</Label>
              <p className="font-body text-sm text-muted-foreground">Emergency plan review reminders</p>
            </div>
            <Switch
              checked={settings?.plan_reminders}
              onCheckedChange={(checked) => updateSetting('plan_reminders', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-body font-medium">Shopping Updates</Label>
              <p className="font-body text-sm text-muted-foreground">New items added to shopping list</p>
            </div>
            <Switch
              checked={settings?.shopping_updates}
              onCheckedChange={(checked) => updateSetting('shopping_updates', checked)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="font-body font-medium">Notification Method</Label>
          <Select
            value={settings?.email_alerts ? "email" : "none"}
            onValueChange={(value) => updateSetting('email_alerts', value === 'email')}
          >
            <SelectTrigger className="font-body">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email Only</SelectItem>
              <SelectItem value="none">None (In-App Only)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Push notifications are not currently available.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
