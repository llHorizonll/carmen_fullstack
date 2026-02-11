import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TenantSummary = {
  id: string
  code: string
  name: string
  baseCurrency: string
}

export type User = {
  id: string
  email: string
  name: string
  tenantId?: string
  tenantName?: string
  tenantCode?: string
  roles: string[]
  accessibleTenants: TenantSummary[]
}

export type Permission = string

type AuthState = {
  user: User | null
  permissions: Permission[]
  isAuthenticated: boolean
  accessToken: string | null
  refreshToken: string | null
  activeTenantId: string | null
}

type AuthActions = {
  setAuth: (user: User, permissions: Permission[], accessToken: string, refreshToken: string) => void
  logout: () => void
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  switchTenant: (tenantId: string) => void
  getActiveTenantId: () => string | null
}

// Mock user for development (matches backend seed data)
const DEV_TENANT_ID = '11111111-1111-1111-1111-111111111111'
const DEV_MOCK_USER: User | null = import.meta.env.DEV ? {
  id: '22222222-2222-2222-2222-222222222222',
  email: 'admin@carmen.com',
  name: 'System Administrator',
  tenantId: DEV_TENANT_ID,
  tenantName: 'Demo Hotel',
  tenantCode: 'DEMO',
  roles: ['Admin'],
  accessibleTenants: [{
    id: DEV_TENANT_ID,
    code: 'DEMO',
    name: 'Demo Hotel',
    baseCurrency: 'USD',
  }],
} : null

const DEV_MOCK_PERMISSIONS: Permission[] = import.meta.env.DEV ? ['*'] : []

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // Use mock user in development if no persisted state
      user: DEV_MOCK_USER,
      permissions: DEV_MOCK_PERMISSIONS,
      isAuthenticated: import.meta.env.DEV,
      accessToken: import.meta.env.DEV ? 'dev-mock-token' : null,
      refreshToken: null,
      activeTenantId: import.meta.env.DEV ? DEV_TENANT_ID : null,

      setAuth: (user, permissions, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        set({
          user,
          permissions,
          isAuthenticated: true,
          accessToken,
          refreshToken,
          activeTenantId: user.tenantId || null,
        })
      },

      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({
          user: null,
          permissions: [],
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          activeTenantId: null,
        })
      },

      hasPermission: (permission) => {
        const { permissions } = get()
        return permissions.includes(permission) || permissions.includes('*')
      },

      hasAnyPermission: (perms) => {
        const { permissions } = get()
        if (permissions.includes('*')) return true
        return perms.some((p) => permissions.includes(p))
      },

      hasAllPermissions: (perms) => {
        const { permissions } = get()
        if (permissions.includes('*')) return true
        return perms.every((p) => permissions.includes(p))
      },

      switchTenant: (tenantId) => {
        const { user } = get()
        if (!user) return

        const targetTenant = user.accessibleTenants.find(t => t.id === tenantId)
        if (!targetTenant) return

        set({
          activeTenantId: tenantId,
          user: {
            ...user,
            tenantId: targetTenant.id,
            tenantName: targetTenant.name,
            tenantCode: targetTenant.code,
          },
        })
      },

      getActiveTenantId: () => {
        return get().activeTenantId
      },
    }),
    {
      name: 'carmen-auth',
      partialize: (state) => ({
        user: state.user,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
        activeTenantId: state.activeTenantId,
      }),
      // In development, use mock data if persisted state has no user
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AuthState> | undefined

        // In dev mode, if no persisted user or not authenticated, use mock
        if (import.meta.env.DEV && (!persisted?.user || !persisted?.isAuthenticated)) {
          return {
            ...currentState,
            user: DEV_MOCK_USER,
            permissions: DEV_MOCK_PERMISSIONS,
            isAuthenticated: true,
            accessToken: 'dev-mock-token',
            refreshToken: null,
            activeTenantId: DEV_TENANT_ID,
          }
        }

        return {
          ...currentState,
          ...persisted,
        }
      },
    }
  )
)
