import { apiClient } from "@/lib/api-client"
import type {
  NotificationDto,
  NotificationPreferenceDto,
  NotificationQueryParams,
  PaginatedResult,
  UnreadCountDto,
  UpdatePreferenceRequest,
} from "./types"

const getBaseUrl = (tenantId: string) => `/v1/tenants/${tenantId}/notifications`

export const notificationsApi = {
  getNotifications: async (
    tenantId: string,
    params?: NotificationQueryParams
  ): Promise<PaginatedResult<NotificationDto>> => {
    const searchParams = new URLSearchParams()
    if (params?.type !== undefined) searchParams.set("type", String(params.type))
    if (params?.isRead !== undefined) searchParams.set("isRead", String(params.isRead))
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize))

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<PaginatedResult<NotificationDto>>(url)
    return response.data
  },

  getUnreadCount: async (tenantId: string): Promise<UnreadCountDto> => {
    const response = await apiClient.getRaw<UnreadCountDto>(`${getBaseUrl(tenantId)}/unread-count`)
    return response.data
  },

  markAsRead: async (tenantId: string, id: string): Promise<void> => {
    await apiClient.putRaw(`${getBaseUrl(tenantId)}/${id}/read`)
  },

  markAllRead: async (tenantId: string): Promise<void> => {
    await apiClient.putRaw(`${getBaseUrl(tenantId)}/read-all`)
  },

  deleteNotification: async (tenantId: string, id: string): Promise<void> => {
    await apiClient.deleteRaw(`${getBaseUrl(tenantId)}/${id}`)
  },

  getPreferences: async (tenantId: string): Promise<NotificationPreferenceDto[]> => {
    const response = await apiClient.getRaw<NotificationPreferenceDto[]>(
      `${getBaseUrl(tenantId)}/preferences`
    )
    return response.data
  },

  updatePreferences: async (
    tenantId: string,
    preferences: UpdatePreferenceRequest[]
  ): Promise<void> => {
    await apiClient.putRaw(`${getBaseUrl(tenantId)}/preferences`, preferences)
  },
}
