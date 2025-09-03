"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell } from "lucide-react"

export function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center">
          <Bell className="h-5 w-5 mr-2 text-orange-500" />
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
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-body font-medium">Inventory Alerts</Label>
              <p className="font-body text-sm text-muted-foreground">Low stock and expiration notifications</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-body font-medium">Plan Reminders</Label>
              <p className="font-body text-sm text-muted-foreground">Emergency plan review reminders</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-body font-medium">Shopping Updates</Label>
              <p className="font-body text-sm text-muted-foreground">New items added to shopping list</p>
            </div>
            <Switch />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="font-body font-medium">Notification Method</Label>
          <Select>
            <SelectTrigger className="font-body">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email Only</SelectItem>
              <SelectItem value="push">Push Notifications</SelectItem>
              <SelectItem value="both">Email + Push</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
