import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { rolesApi, permissionsApi } from "./api"
import type {
  RoleQueryParams,
  CreateRoleRequest,
  UpdateRoleRequest,
  UpdateRolePermissionsRequest,
} from "./types"
import { toast } from "sonner"

const ROLES_QUERY_KEY = "roles"
const PERMISSIONS_QUERY_KEY = "permissions"

/**
 * Hook for fetching paginated roles list
 */
export function useRoles(params?: RoleQueryParams) {
  return useQuery({
    queryKey: [ROLES_QUERY_KEY, params],
    queryFn: () => rolesApi.getRoles(params),
  })
}

/**
 * Hook for fetching a single role by ID
 */
export function useRole(id: string | undefined) {
  return useQuery({
    queryKey: [ROLES_QUERY_KEY, id],
    queryFn: () => rolesApi.getRole(id!),
    enabled: !!id,
  })
}

/**
 * Hook for fetching roles for lookup (dropdown)
 */
export function useRoleLookup() {
  return useQuery({
    queryKey: [ROLES_QUERY_KEY, "lookup"],
    queryFn: () => rolesApi.getRoleLookup(),
  })
}

/**
 * Hook for creating a new role
 */
export function useCreateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRoleRequest) => rolesApi.createRole(data),
    onSuccess: (role) => {
      queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY] })
      toast.success(`Role "${role.name}" created successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create role")
    },
  })
}

/**
 * Hook for updating a role
 */
export function useUpdateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleRequest }) =>
      rolesApi.updateRole(id, data),
    onSuccess: (role) => {
      queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY] })
      toast.success(`Role "${role.name}" updated successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update role")
    },
  })
}

/**
 * Hook for deleting a role
 */
export function useDeleteRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => rolesApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY] })
      toast.success("Role deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete role")
    },
  })
}

/**
 * Hook for fetching role permissions
 */
export function useRolePermissions(id: string | undefined) {
  return useQuery({
    queryKey: [ROLES_QUERY_KEY, id, "permissions"],
    queryFn: () => rolesApi.getRolePermissions(id!),
    enabled: !!id,
  })
}

/**
 * Hook for updating role permissions
 */
export function useUpdateRolePermissions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRolePermissionsRequest }) =>
      rolesApi.updateRolePermissions(id, data),
    onSuccess: (role) => {
      queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY] })
      toast.success(`Permissions for "${role.name}" updated successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update permissions")
    },
  })
}

/**
 * Hook for checking if role name exists
 */
export function useCheckRoleName(name: string | undefined, excludeId?: string) {
  return useQuery({
    queryKey: [ROLES_QUERY_KEY, "check-name", name, excludeId],
    queryFn: () => rolesApi.checkRoleName(name!, excludeId),
    enabled: !!name && name.length > 0,
  })
}

/**
 * Hook for fetching all permissions
 */
export function usePermissions() {
  return useQuery({
    queryKey: [PERMISSIONS_QUERY_KEY],
    queryFn: () => permissionsApi.getPermissions(),
  })
}

/**
 * Hook for fetching permissions grouped by module
 */
export function usePermissionsGrouped() {
  return useQuery({
    queryKey: [PERMISSIONS_QUERY_KEY, "grouped"],
    queryFn: () => permissionsApi.getPermissionsGrouped(),
  })
}
