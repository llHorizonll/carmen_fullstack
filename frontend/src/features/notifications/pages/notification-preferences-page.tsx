import { useEffect, useState } from "react"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "../hooks"
import type { UpdatePreferenceRequest, NotificationType } from "../types"

export function NotificationPreferencesPage() {
  const { data: preferences, isLoading } = useNotificationPreferences()
  const updatePreferences = useUpdateNotificationPreferences()
  const [localPrefs, setLocalPrefs] = useState<UpdatePreferenceRequest[]>([])

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(
        preferences.map((p) => ({
          type: p.type,
          inAppEnabled: p.inAppEnabled,
          emailEnabled: p.emailEnabled,
        }))
      )
    }
  }, [preferences])

  const handleToggle = (
    type: NotificationType,
    field: "inAppEnabled" | "emailEnabled"
  ) => {
    setLocalPrefs((prev) =>
      prev.map((p) =>
        p.type === type ? { ...p, [field]: !p[field] } : p
      )
    )
  }

  const handleSave = () => {
    updatePreferences.mutate(localPrefs)
  }

  const getTypeName = (type: NotificationType): string => {
    const names: Record<NotificationType, string> = {
      1: "Approval Requests",
      2: "Alerts",
      3: "System Messages",
      4: "Reports",
      5: "User Messages",
    }
    return names[type] || "Unknown"
  }

  const getTypeDescription = (type: NotificationType): string => {
    const descriptions: Record<NotificationType, string> = {
      1: "Notifications about pending approvals and approval results",
      2: "Important alerts like due dates and overdue payments",
      3: "System announcements and maintenance notices",
      4: "Notifications when scheduled reports are ready",
      5: "Messages from other users in your organization",
    }
    return descriptions[type] || ""
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Notification Preferences
          </h1>
          <p className="text-muted-foreground">
            Choose how you want to receive notifications
          </p>
        </div>
        <Button onClick={handleSave} disabled={updatePreferences.isPending}>
          <Save className="mr-2 size-4" />
          {updatePreferences.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Notification Type</TableHead>
              <TableHead className="text-center w-[120px]">In-App</TableHead>
              <TableHead className="text-center w-[120px]">Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  Loading preferences...
                </TableCell>
              </TableRow>
            ) : (
              localPrefs.map((pref) => (
                <TableRow key={pref.type}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{getTypeName(pref.type)}</p>
                      <p className="text-xs text-muted-foreground">
                        {getTypeDescription(pref.type)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={pref.inAppEnabled}
                      onCheckedChange={() =>
                        handleToggle(pref.type, "inAppEnabled")
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={pref.emailEnabled}
                      onCheckedChange={() =>
                        handleToggle(pref.type, "emailEnabled")
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
