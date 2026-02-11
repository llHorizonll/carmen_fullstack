import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useUnreadCount } from "../hooks"
import { useNotificationStore } from "@/stores/notification-store"
import { useEffect } from "react"

type NotificationBellProps = {
  onClick: () => void
}

export function NotificationBell({ onClick }: NotificationBellProps) {
  const { data } = useUnreadCount()
  const { unreadCount, setUnreadCount } = useNotificationStore()

  // Sync API count with store
  useEffect(() => {
    if (data?.count !== undefined) {
      setUnreadCount(data.count)
    }
  }, [data?.count, setUnreadCount])

  return (
    <Button variant="ghost" size="icon" className="relative" onClick={onClick}>
      <Bell className="size-5" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 size-5 p-0 flex items-center justify-center text-[10px]"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </Button>
  )
}
