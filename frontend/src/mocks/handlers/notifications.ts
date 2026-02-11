import { http, HttpResponse } from 'msw'
import { paginate } from '../data/common'
import { mockNotifications, mockNotificationPreferences } from '../data/notifications'

export const notificationHandlers = [
  // GET notifications (paginated)
  http.get('*/v1/tenants/:tenantId/notifications', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const pageSize = Number(url.searchParams.get('pageSize') || '20')
    return HttpResponse.json(paginate(mockNotifications, page, pageSize))
  }),

  // GET unread count
  http.get('*/v1/tenants/:tenantId/notifications/unread-count', () => {
    const count = mockNotifications.filter((n) => !n.isRead).length
    return HttpResponse.json({ count })
  }),

  // GET preferences
  http.get('*/v1/tenants/:tenantId/notifications/preferences', () => {
    return HttpResponse.json(mockNotificationPreferences)
  }),

  // PUT preferences
  http.put('*/v1/tenants/:tenantId/notifications/preferences', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // PUT mark all read
  http.put('*/v1/tenants/:tenantId/notifications/read-all', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // PUT mark single as read
  http.put('*/v1/tenants/:tenantId/notifications/:id/read', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // DELETE notification
  http.delete('*/v1/tenants/:tenantId/notifications/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),
]
