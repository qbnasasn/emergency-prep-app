import { SettingsHeader } from "@/components/settings/settings-header"
import { UserSettings } from "@/components/settings/user-settings"
import { NotificationSettings } from "@/components/settings/notification-settings"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <SettingsHeader />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <UserSettings />
        </div>
        <div>
          <NotificationSettings />
        </div>
      </div>
    </div>
  )
}
