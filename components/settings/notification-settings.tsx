"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Loader2, Mail } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

interface NotificationSettingsData {
  in_app_alerts: boolean
  email_alerts: boolean
  weather_alerts: boolean
  inventory_alerts: boolean
  plan_reminders: boolean
  shopping_updates: boolean
  plan_reminder_frequency: string
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

  const updateSetting = async (key: keyof NotificationSettingsData, value: boolean | string) => {
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

  const handleTestNotification = async () => {
    try {
      const res = await fetch('/api/notifications/test', { method: 'POST' });
      if (!res.ok) throw new Error('Server error');
      toast.success("Test email sent!", {
        description: "Please check your inbox."
      });
    } catch (error) {
      toast.error("Failed to send test email.", {
        description: "Please check the server logs."
      });
    }
  };

  return (
    <>
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

          {settings?.plan_reminders && (
            <div className="flex items-center justify-between">
              <Label className="font-body font-medium">Reminder Frequency</Label>
              <Select
                value={settings?.plan_reminder_frequency || 'monthly'}
                onValueChange={(value) => updateSetting('plan_reminder_frequency', value)}
              >
                <SelectTrigger className="w-[180px] font-body">
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

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
            value={
              settings?.email_alerts && settings?.in_app_alerts
                ? 'both'
                : settings?.email_alerts
                ? 'email'
                : 'in-app'
            }
            onValueChange={(value) => {
              if (value === 'both') {
                updateSetting('email_alerts', true);
                updateSetting('in_app_alerts', true);
              } else if (value === 'email') {
                updateSetting('email_alerts', true);
                updateSetting('in_app_alerts', false);
              } else {
                updateSetting('email_alerts', false);
                updateSetting('in_app_alerts', true);
              }
            }}
          >
            <SelectTrigger className="font-body">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in-app">In-App Only</SelectItem>
              <SelectItem value="email">Email Only</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Configure how you receive general alerts.
          </p>
        </div>
      </CardContent>
    </Card>
    <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl flex items-center">
            <Mail className="h-5 w-5 mr-2 text-primary" />
            Test Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-body text-sm text-muted-foreground mb-4">
            Click the button below to send a test email to your account. This will verify that your email notification service is configured correctly.
          </p>
          <Button onClick={handleTestNotification} className="font-body">
            Send Test Email
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
