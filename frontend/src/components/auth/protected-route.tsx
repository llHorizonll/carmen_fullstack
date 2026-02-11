import * as React from "react"
import { Navigate, useLocation } from "react-router-dom"

import { useAuthStore } from "@/stores/auth-store"

type ProtectedRouteProps = {
  children: React.ReactNode
  permission?: string
  permissions?: string[]
  requireAll?: boolean
}

export function ProtectedRoute({
  children,
  permission,
  permissions,
  requireAll = false,
}: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, hasPermission, hasAnyPermission, hasAllPermissions } =
    useAuthStore()

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)

    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return <>{children}</>
}
