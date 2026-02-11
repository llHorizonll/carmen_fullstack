import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useSignalR } from "./useSignalR"
import { useNotificationStore } from "@/stores/notification-store"
import { useAuthStore } from "@/stores/auth-store"
import type { NotificationDto } from "@/features/notifications/types"

export function useNotificationHub() {
  const { connection, isConnected } = useSignalR({
    hubUrl: "/hubs/notifications",
    enabled: useAuthStore((s) => s.isAuthenticated),
  })

  const queryClient = useQueryClient()
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount)

  useEffect(() => {
    if (!connection || !isConnected) return

    // Listen for new notifications
    connection.on("ReceiveNotification", (notification: NotificationDto) => {
      // Invalidate notification queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ["notifications"] })

      // Show toast
      toast.info(notification.title, {
        description: notification.message,
        action: notification.actionUrl
          ? {
              label: "View",
              onClick: () => {
                window.location.href = notification.actionUrl!
              },
            }
          : undefined,
      })
    })

    // Listen for unread count updates
    connection.on("UpdateUnreadCount", (count: number) => {
      setUnreadCount(count)
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] })
    })

    return () => {
      connection.off("ReceiveNotification")
      connection.off("UpdateUnreadCount")
    }
  }, [connection, isConnected, queryClient, setUnreadCount])
}
