import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useTenantId } from '../useTenantId'
import { useAuthStore } from '@/stores/auth-store'

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    permissions: [],
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    activeTenantId: null,
  })
})

describe('useTenantId', () => {
  it('returns activeTenantId when set', () => {
    useAuthStore.setState({
      activeTenantId: 'tenant-123',
      user: {
        id: 'u1',
        email: 'test@test.com',
        name: 'Test',
        tenantId: 'tenant-456',
        roles: [],
        accessibleTenants: [],
      },
    })

    const { result } = renderHook(() => useTenantId())

    expect(result.current).toBe('tenant-123')
  })

  it('falls back to user.tenantId when activeTenantId is null', () => {
    useAuthStore.setState({
      activeTenantId: null,
      user: {
        id: 'u1',
        email: 'test@test.com',
        name: 'Test',
        tenantId: 'tenant-456',
        roles: [],
        accessibleTenants: [],
      },
    })

    const { result } = renderHook(() => useTenantId())

    expect(result.current).toBe('tenant-456')
  })
})
