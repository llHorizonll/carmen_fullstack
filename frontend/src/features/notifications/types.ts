export type NotificationType = 1 | 2 | 3 | 4 | 5

export const NotificationTypeLabels: Record<NotificationType, string> = {
  1: "Approval",
  2: "Alert",
  3: "System",
  4: "Report",
  5: "User",
}

export type NotificationPriority = 1 | 2 | 3 | 4

export const NotificationPriorityLabels: Record<NotificationPriority, string> = {
  1: "Low",
  2: "Normal",
  3: "High",
  4: "Urgent",
}

export interface NotificationDto {
  id: string
  userId: string
  type: NotificationType
  priority: NotificationPriority
  title: string
  message: string
  actionUrl?: string
  entityType?: string
  entityId?: string
  isRead: boolean
  readAt?: string
  data?: string
  createdAt: string
}

export interface UnreadCountDto {
  count: number
}

export interface NotificationPreferenceDto {
  id: string
  type: NotificationType
  typeName: string
  inAppEnabled: boolean
  emailEnabled: boolean
}

export interface UpdatePreferenceRequest {
  type: NotificationType
  inAppEnabled: boolean
  emailEnabled: boolean
}

export interface NotificationQueryParams {
  type?: NotificationType
  isRead?: boolean
  page?: number
  pageSize?: number
}

export interface PaginatedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}
