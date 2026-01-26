import { SettingsHeader } from "@/components/settings/settings-header"
import { FamilyMembers } from "@/components/settings/family-members"
import { Pets } from "@/components/settings/pets"
import { NoaaAlertLocations } from "@/components/settings/noaa-alert-locations"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { StorageManager } from "@/components/settings/storage-manager"
import { SubscriptionManager } from "@/components/settings/subscription-manager"
import { getAuthUser } from "@/lib/auth"

export default async function SettingsPage() {
  const user = await getAuthUser();

  return (
    <div className="space-y-6">
      <SettingsHeader />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <FamilyMembers />
          <Pets />
          <NoaaAlertLocations />
        </div>
        <div className="space-y-6">
          <NotificationSettings />
          <StorageManager />
        </div>
      </div>

      <SubscriptionManager subscriptionPlan={user?.subscriptionPlan} />
    </div>
  )
}
