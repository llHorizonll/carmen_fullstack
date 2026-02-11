// Permission DTOs
export interface PermissionDto {
  id: string
  code: string
  name: string
  description?: string
  module: string
}

export interface PermissionGroupDto {
  module: string
  permissions: PermissionDto[]
}

// Role DTOs
export interface RoleDto {
  id: string
  name: string
  description?: string
  isSystem: boolean
  permissions: PermissionDto[]
  userCount: number
  createdAt: string
  updatedAt?: string
}

export interface RoleListDto {
  id: string
  name: string
  description?: string
  isSystem: boolean
  permissionCount: number
  userCount: number
}

export interface RoleLookupDto {
  id: string
  name: string
}

// Request DTOs
export interface CreateRoleRequest {
  name: string
  description?: string
  permissionIds: string[]
}

export interface UpdateRoleRequest {
  name: string
  description?: string
}

export interface UpdateRolePermissionsRequest {
  permissionIds: string[]
}

// Query Parameters
export interface RoleQueryParams {
  search?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortDescending?: boolean
}

// User Role DTOs
export interface UserRolesDto {
  userId: string
  email: string
  fullName: string
  roles: RoleLookupDto[]
}

export interface UpdateUserRolesRequest {
  roleIds: string[]
}

// Paginated Response
export interface PaginatedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}
