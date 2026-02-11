import { http, HttpResponse } from 'msw'
import { mockDashboardSummary } from '../data/dashboard'

export const dashboardHandlers = [
  // GET /v1/tenants/:tenantId/dashboard/summary
  http.get('*/v1/tenants/:tenantId/dashboard/summary', () => {
    return HttpResponse.json(mockDashboardSummary)
  }),
]
