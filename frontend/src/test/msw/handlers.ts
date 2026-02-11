import { http, HttpResponse } from 'msw'

const API_BASE = '/api/v1'

export const handlers = [
  // Auth - GET /me
  http.get(`${API_BASE}/me`, () => {
    return HttpResponse.json({
      id: '10000000-0000-0000-0000-000000000001',
      email: 'test@carmen.dev',
      fullName: 'Test User',
      tenantId: '00000000-0000-0000-0000-000000000001',
      roles: ['Admin'],
      permissions: ['*'],
    })
  }),

  // Auth - POST /login
  http.post(`${API_BASE}/auth/login`, () => {
    return HttpResponse.json({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: {
        id: '10000000-0000-0000-0000-000000000001',
        email: 'test@carmen.dev',
        fullName: 'Test User',
      },
    })
  }),

  // Auth - POST /refresh
  http.post(`${API_BASE}/auth/refresh`, () => {
    return HttpResponse.json({
      accessToken: 'mock-new-access-token',
      refreshToken: 'mock-new-refresh-token',
    })
  }),

  // Dashboard
  http.get(`${API_BASE}/tenants/:tenantId/dashboard/summary`, () => {
    return HttpResponse.json({
      totalAssets: 1000000,
      totalLiabilities: 500000,
      totalEquity: 500000,
      totalRevenue: 250000,
      totalExpenses: 200000,
      netIncome: 50000,
    })
  }),
]
