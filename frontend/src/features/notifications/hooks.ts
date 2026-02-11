import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/auth-store"
import { notificationsApi } from "./api"
import type { NotificationQueryParams, UpdatePreferenceRequest } from "./types"

function useTenantId() {
  return useAuthStore((s) => s.activeTenantId) ?? ""
}

export function useNotifications(params?: NotificationQueryParams) {
  const tenantId = useTenantId()
  return useQuery({
    queryKey: ["notifications", tenantId, params],
    queryFn: () => notificationsApi.getNotifications(tenantId, params),
    enabled: !!tenantId,
  })
}

export function useUnreadCount() {
  const tenantId = useTenantId()
  return useQuery({
    queryKey: ["notifications", "unread-count", tenantId],
    queryFn: () => notificationsApi.getUnreadCount(tenantId),
    enabled: !!tenantId,
    refetchInterval: 60000, // Poll every 60s as fallback
  })
}

export function useMarkAsRead() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useMarkAllRead() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      toast.success("All notifications marked as read")
    },
  })
}

export function useDeleteNotification() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotification(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useNotificationPreferences() {
  const tenantId = useTenantId()
  return useQuery({
    queryKey: ["notification-preferences", tenantId],
    queryFn: () => notificationsApi.getPreferences(tenantId),
    enabled: !!tenantId,
  })
}

export function useUpdateNotificationPreferences() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (preferences: UpdatePreferenceRequest[]) =>
      notificationsApi.updatePreferences(tenantId, preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] })
      toast.success("Notification preferences updated")
    },
    onError: () => {
      toast.error("Failed to update preferences")
    },
  })
}
