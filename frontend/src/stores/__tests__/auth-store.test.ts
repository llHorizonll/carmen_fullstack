import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore, type User, type Permission } from '../auth-store'

// Reset store state before each test
beforeEach(() => {
  useAuthStore.setState({
    user: null,
    permissions: [],
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    activeTenantId: null,
  })
  vi.clearAllMocks()
})

const mockUser: User = {
  id: '10000000-0000-0000-0000-000000000001',
  email: 'test@carmen.dev',
  name: 'Test User',
  tenantId: '00000000-0000-0000-0000-000000000001',
  tenantName: 'Test Hotel',
  tenantCode: 'TEST',
  roles: ['Admin'],
  accessibleTenants: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      code: 'TEST',
      name: 'Test Hotel',
      baseCurrency: 'USD',
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      code: 'DEMO',
      name: 'Demo Hotel',
      baseCurrency: 'THB',
    },
  ],
}

const mockPermissions: Permission[] = ['GL.JournalVoucher', 'GL.Account', 'AP.Invoice']

describe('auth-store', () => {
  describe('setAuth', () => {
    it('stores user, tokens, and permissions', () => {
      const store = useAuthStore.getState()
      store.setAuth(mockUser, mockPermissions, 'access-token', 'refresh-token')

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.permissions).toEqual(mockPermissions)
      expect(state.isAuthenticated).toBe(true)
      expect(state.accessToken).toBe('access-token')
      expect(state.refreshToken).toBe('refresh-token')
    })

    it('sets activeTenantId from user.tenantId', () => {
      const store = useAuthStore.getState()
      store.setAuth(mockUser, mockPermissions, 'at', 'rt')

      expect(useAuthStore.getState().activeTenantId).toBe('00000000-0000-0000-0000-000000000001')
    })

    it('persists tokens to localStorage', () => {
      const store = useAuthStore.getState()
      store.setAuth(mockUser, mockPermissions, 'my-access', 'my-refresh')

      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'my-access')
      expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'my-refresh')
    })
  })

  describe('logout', () => {
    it('clears all state', () => {
      // First login
      const store = useAuthStore.getState()
      store.setAuth(mockUser, mockPermissions, 'at', 'rt')

      // Then logout
      useAuthStore.getState().logout()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.permissions).toEqual([])
      expect(state.isAuthenticated).toBe(false)
      expect(state.accessToken).toBeNull()
      expect(state.refreshToken).toBeNull()
      expect(state.activeTenantId).toBeNull()
    })

    it('removes tokens from localStorage', () => {
      useAuthStore.getState().setAuth(mockUser, mockPermissions, 'at', 'rt')
      useAuthStore.getState().logout()

      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken')
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken')
    })
  })

  describe('hasPermission', () => {
    it('returns true for matching permission', () => {
      useAuthStore.getState().setAuth(mockUser, ['GL.JournalVoucher'], 'at', 'rt')

      expect(useAuthStore.getState().hasPermission('GL.JournalVoucher')).toBe(true)
    })

    it('returns false for non-matching permission', () => {
      useAuthStore.getState().setAuth(mockUser, ['GL.JournalVoucher'], 'at', 'rt')

      expect(useAuthStore.getState().hasPermission('AP.Invoice')).toBe(false)
    })

    it('returns true for wildcard permission', () => {
      useAuthStore.getState().setAuth(mockUser, ['*'], 'at', 'rt')

      expect(useAuthStore.getState().hasPermission('GL.JournalVoucher')).toBe(true)
      expect(useAuthStore.getState().hasPermission('AP.Invoice')).toBe(true)
    })
  })

  describe('hasAnyPermission', () => {
    it('returns true if any permission matches', () => {
      useAuthStore.getState().setAuth(mockUser, ['GL.JournalVoucher'], 'at', 'rt')

      expect(
        useAuthStore.getState().hasAnyPermission(['GL.JournalVoucher', 'AP.Invoice'])
      ).toBe(true)
    })

    it('returns false if no permission matches', () => {
      useAuthStore.getState().setAuth(mockUser, ['GL.JournalVoucher'], 'at', 'rt')

      expect(
        useAuthStore.getState().hasAnyPermission(['AP.Invoice', 'AR.Invoice'])
      ).toBe(false)
    })

    it('returns true with wildcard', () => {
      useAuthStore.getState().setAuth(mockUser, ['*'], 'at', 'rt')

      expect(
        useAuthStore.getState().hasAnyPermission(['AP.Invoice', 'AR.Invoice'])
      ).toBe(true)
    })
  })

  describe('hasAllPermissions', () => {
    it('returns true if all permissions match', () => {
      useAuthStore
        .getState()
        .setAuth(mockUser, ['GL.JournalVoucher', 'AP.Invoice'], 'at', 'rt')

      expect(
        useAuthStore.getState().hasAllPermissions(['GL.JournalVoucher', 'AP.Invoice'])
      ).toBe(true)
    })

    it('returns false if any permission is missing', () => {
      useAuthStore.getState().setAuth(mockUser, ['GL.JournalVoucher'], 'at', 'rt')

      expect(
        useAuthStore.getState().hasAllPermissions(['GL.JournalVoucher', 'AP.Invoice'])
      ).toBe(false)
    })

    it('returns true with wildcard', () => {
      useAuthStore.getState().setAuth(mockUser, ['*'], 'at', 'rt')

      expect(
        useAuthStore.getState().hasAllPermissions(['GL.JournalVoucher', 'AP.Invoice'])
      ).toBe(true)
    })
  })

  describe('switchTenant', () => {
    it('switches to an accessible tenant', () => {
      useAuthStore.getState().setAuth(mockUser, mockPermissions, 'at', 'rt')

      useAuthStore.getState().switchTenant('00000000-0000-0000-0000-000000000002')

      const state = useAuthStore.getState()
      expect(state.activeTenantId).toBe('00000000-0000-0000-0000-000000000002')
      expect(state.user?.tenantId).toBe('00000000-0000-0000-0000-000000000002')
      expect(state.user?.tenantName).toBe('Demo Hotel')
      expect(state.user?.tenantCode).toBe('DEMO')
    })

    it('does nothing for invalid tenant id', () => {
      useAuthStore.getState().setAuth(mockUser, mockPermissions, 'at', 'rt')

      useAuthStore.getState().switchTenant('non-existent-id')

      const state = useAuthStore.getState()
      expect(state.activeTenantId).toBe('00000000-0000-0000-0000-000000000001')
    })

    it('does nothing when no user is set', () => {
      useAuthStore.getState().switchTenant('00000000-0000-0000-0000-000000000002')

      expect(useAuthStore.getState().activeTenantId).toBeNull()
    })
  })

  describe('getActiveTenantId', () => {
    it('returns the active tenant id', () => {
      useAuthStore.getState().setAuth(mockUser, mockPermissions, 'at', 'rt')

      expect(useAuthStore.getState().getActiveTenantId()).toBe(
        '00000000-0000-0000-0000-000000000001'
      )
    })

    it('returns null when not authenticated', () => {
      expect(useAuthStore.getState().getActiveTenantId()).toBeNull()
    })
  })
})
