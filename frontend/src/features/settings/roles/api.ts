import { apiClient } from "@/lib/api-client"
import type {
  RoleDto,
  RoleListDto,
  RoleLookupDto,
  RoleQueryParams,
  CreateRoleRequest,
  UpdateRoleRequest,
  UpdateRolePermissionsRequest,
  PermissionDto,
  PermissionGroupDto,
  PaginatedResult,
} from "./types"

const ROLES_BASE_URL = "/v1/roles"
const PERMISSIONS_BASE_URL = "/v1/permissions"

export const rolesApi = {
  /**
   * Get paginated list of roles
   */
  getRoles: async (params?: RoleQueryParams): Promise<PaginatedResult<RoleListDto>> => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize))
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy)
    if (params?.sortDescending !== undefined)
      searchParams.set("sortDescending", String(params.sortDescending))

    const queryString = searchParams.toString()
    const url = `${ROLES_BASE_URL}${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<PaginatedResult<RoleListDto>>(url)
    return response.data
  },

  /**
   * Get role by ID
   */
  getRole: async (id: string): Promise<RoleDto> => {
    const response = await apiClient.getRaw<RoleDto>(`${ROLES_BASE_URL}/${id}`)
    return response.data
  },

  /**
   * Get roles for lookup (dropdown)
   */
  getRoleLookup: async (): Promise<RoleLookupDto[]> => {
    const response = await apiClient.getRaw<RoleLookupDto[]>(`${ROLES_BASE_URL}/lookup`)
    return response.data
  },

  /**
   * Create a new role
   */
  createRole: async (data: CreateRoleRequest): Promise<RoleDto> => {
    const response = await apiClient.postRaw<RoleDto>(ROLES_BASE_URL, data)
    return response.data
  },

  /**
   * Update an existing role
   */
  updateRole: async (id: string, data: UpdateRoleRequest): Promise<RoleDto> => {
    const response = await apiClient.putRaw<RoleDto>(`${ROLES_BASE_URL}/${id}`, data)
    return response.data
  },

  /**
   * Delete a role
   */
  deleteRole: async (id: string): Promise<void> => {
    await apiClient.deleteRaw(`${ROLES_BASE_URL}/${id}`)
  },

  /**
   * Get role permissions
   */
  getRolePermissions: async (id: string): Promise<PermissionDto[]> => {
    const response = await apiClient.getRaw<PermissionDto[]>(
      `${ROLES_BASE_URL}/${id}/permissions`
    )
    return response.data
  },

  /**
   * Update role permissions
   */
  updateRolePermissions: async (
    id: string,
    data: UpdateRolePermissionsRequest
  ): Promise<RoleDto> => {
    const response = await apiClient.putRaw<RoleDto>(
      `${ROLES_BASE_URL}/${id}/permissions`,
      data
    )
    return response.data
  },

  /**
   * Check if role name exists
   */
  checkRoleName: async (
    name: string,
    excludeId?: string
  ): Promise<{ exists: boolean }> => {
    const url = excludeId
      ? `${ROLES_BASE_URL}/check-name/${encodeURIComponent(name)}?excludeId=${excludeId}`
      : `${ROLES_BASE_URL}/check-name/${encodeURIComponent(name)}`

    const response = await apiClient.getRaw<{ exists: boolean }>(url)
    return response.data
  },
}

export const permissionsApi = {
  /**
   * Get all permissions
   */
  getPermissions: async (): Promise<PermissionDto[]> => {
    const response = await apiClient.getRaw<PermissionDto[]>(PERMISSIONS_BASE_URL)
    return response.data
  },

  /**
   * Get permissions grouped by module
   */
  getPermissionsGrouped: async (): Promise<PermissionGroupDto[]> => {
    const response = await apiClient.getRaw<PermissionGroupDto[]>(
      `${PERMISSIONS_BASE_URL}/grouped`
    )
    return response.data
  },
}
