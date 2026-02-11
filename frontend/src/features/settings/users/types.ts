// Re-export from roles for convenience
export type { UserRolesDto, UpdateUserRolesRequest, PaginatedResult, RoleLookupDto } from "../roles/types"
import type { RoleLookupDto } from "../roles/types"

// User List DTOs (for the user management list)
export interface UserListDto {
  id: string
  email: string
  fullName: string
  isActive: boolean
  roleCount: number
  lastLoginAt?: string
  createdAt: string
}

// User Detail DTO with full information including roles
export interface UserDetailDto {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  phone?: string
  preferredLanguage: string
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  roles: RoleLookupDto[]
}

export interface UserQueryParams {
  search?: string
  isActive?: boolean
  page?: number
  pageSize?: number
  sortBy?: string
  sortDescending?: boolean
}
