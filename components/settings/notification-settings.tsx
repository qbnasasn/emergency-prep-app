"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Bell, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface NotificationSettingsData {
  email_alerts: boolean
  weather_alerts: string
  inventory_alerts: string
  inventory_check_frequency: string
  plan_reminders: string
  shopping_updates: string
}

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  const handleSendTestEmail = async () => {
    setIsSending(true)
    toast.info("Sending test email...")

    try {
      const res = await fetch('/api/settings/test-email', { method: 'POST' })
      if (!res.ok) throw new Error('Server error')
      toast.success("Test email sent successfully!")
    } catch (error) {
      console.error("Failed to send test email", error)
      toast.error("Failed to send test email.")
    } finally {
      setIsSending(false)
    }
  }

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

  const updateSetting = async (key: keyof NotificationSettingsData, value: boolean | string) => {
    if (!settings) return

    // Cast to any to avoid TS union type issues with key assignment
    const newSettings = { ...settings, [key]: value } as NotificationSettingsData
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

  const renderSelect = (key: keyof NotificationSettingsData) => (
    <Select
        value={(settings?.[key] as string) || 'none'}
        onValueChange={(val) => updateSetting(key, val)}
    >
        <SelectTrigger className="w-[180px] font-body">
            <SelectValue placeholder="Select method" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="none">No Alerts</SelectItem>
            <SelectItem value="in_app">In-App Only</SelectItem>
            <SelectItem value="email">Email Only</SelectItem>
            <SelectItem value="both">Both</SelectItem>
        </SelectContent>
    </Select>
  )

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
            {renderSelect('weather_alerts')}
          </div>

          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                <Label className="font-body font-medium">Inventory Alerts</Label>
                <p className="font-body text-sm text-muted-foreground">Low stock and expiration notifications</p>
                </div>
                {renderSelect('inventory_alerts')}
            </div>
            {/* Frequency Sub-setting */}
            {(settings?.inventory_alerts !== 'none') && (
                <div className="flex items-center justify-between ml-4 pl-4 border-l">
                    <Label className="font-body text-sm">Frequency</Label>
                    <Select
                        value={settings?.inventory_check_frequency || 'weekly'}
                        onValueChange={(val) => updateSetting('inventory_check_frequency', val)}
                    >
                        <SelectTrigger className="w-[180px] h-8 font-body">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly (Mondays)</SelectItem>
                            <SelectItem value="monthly">Monthly (1st)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-body font-medium">Plan Reminders</Label>
              <p className="font-body text-sm text-muted-foreground">Emergency plan review reminders</p>
            </div>
            {renderSelect('plan_reminders')}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="font-body font-medium">Global Email Settings</Label>
          <Select
            value={settings?.email_alerts ? "email" : "none"}
            onValueChange={(value) => updateSetting('email_alerts', value === 'email')}
          >
            <SelectTrigger className="font-body">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Emails Enabled</SelectItem>
              <SelectItem value="none">Emails Disabled (Global)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            If disabled, no emails will be sent even if specific alerts are enabled.
          </p>
        </div>
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendTestEmail}
            disabled={isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Test Email'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
