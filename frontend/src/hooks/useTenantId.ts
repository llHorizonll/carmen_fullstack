import { useAuthStore } from "@/stores/auth-store"

// Default tenant ID for development when user has no tenant assigned
// Must match backend seed data in Program.cs
const DEV_TENANT_ID = "11111111-1111-1111-1111-111111111111"

/**
 * Centralized hook to get the current active tenant ID.
 *
 * Uses the activeTenantId from auth store, which is updated when:
 * - User logs in (set to their default/selected tenant)
 * - User switches tenant via the tenant switcher
 *
 * In development mode, falls back to a dev tenant ID if no tenant is set.
 * In production, throws an error if no tenant context is available.
 */
export function useTenantId(): string {
  const activeTenantId = useAuthStore((state) => state.activeTenantId)
  const user = useAuthStore((state) => state.user)

  // Prefer activeTenantId (supports tenant switching)
  if (activeTenantId) {
    return activeTenantId
  }

  // Fallback to user's tenant ID
  if (user?.tenantId) {
    return user.tenantId
  }

  // In development, use a fallback tenant ID
  if (import.meta.env.DEV) {
    return DEV_TENANT_ID
  }

  throw new Error("No tenant context available")
}
