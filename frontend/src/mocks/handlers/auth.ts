import { http, HttpResponse } from 'msw'

const mockUser = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@carmen.hotel',
  firstName: 'System',
  lastName: 'Admin',
  displayName: 'System Admin',
  tenantId: '11111111-1111-1111-1111-111111111111',
  tenantName: 'Grand Paradise Hotel',
  role: 'Admin',
  avatarUrl: null,
  locale: 'en',
  timezone: 'Asia/Bangkok',
  createdAt: '2024-01-01T00:00:00Z',
}

const mockTokens = {
  accessToken: 'mock-access-token-jwt',
  refreshToken: 'mock-refresh-token',
  expiresIn: 28800,
}

export const authHandlers = [
  // GET /v1/me
  http.get('*/v1/me', () => {
    return HttpResponse.json(mockUser)
  }),

  // POST /v1/auth/login
  http.post('*/v1/auth/login', () => {
    return HttpResponse.json({
      ...mockTokens,
      user: mockUser,
    })
  }),

  // POST /v1/auth/refresh
  http.post('*/v1/auth/refresh', () => {
    return HttpResponse.json({
      accessToken: 'mock-refreshed-access-token-jwt',
      refreshToken: 'mock-refreshed-refresh-token',
      expiresIn: 28800,
    })
  }),

  // GET /v1/me/permissions
  http.get('*/v1/me/permissions', () => {
    return HttpResponse.json(['*'])
  }),
]
