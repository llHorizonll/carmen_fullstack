import { apiClient } from "@/lib/api-client"
import type {
  UserRolesDto,
  UpdateUserRolesRequest,
  UserListDto,
  UserDetailDto,
  UserQueryParams,
  PaginatedResult,
} from "./types"

const USERS_BASE_URL = "/v1/users"

export const usersApi = {
  /**
   * Get paginated list of users
   */
  getUsers: async (params: UserQueryParams): Promise<PaginatedResult<UserListDto>> => {
    const queryParams = new URLSearchParams()
    if (params.search) queryParams.append("search", params.search)
    if (params.isActive !== undefined) queryParams.append("isActive", String(params.isActive))
    if (params.page) queryParams.append("page", String(params.page))
    if (params.pageSize) queryParams.append("pageSize", String(params.pageSize))
    if (params.sortBy) queryParams.append("sortBy", params.sortBy)
    if (params.sortDescending !== undefined) queryParams.append("sortDescending", String(params.sortDescending))

    const queryString = queryParams.toString()
    const url = queryString ? `${USERS_BASE_URL}?${queryString}` : USERS_BASE_URL

    const response = await apiClient.getRaw<PaginatedResult<UserListDto>>(url)
    return response.data
  },

  /**
   * Get user by ID
   */
  getUser: async (userId: string): Promise<UserDetailDto> => {
    const response = await apiClient.getRaw<UserDetailDto>(
      `${USERS_BASE_URL}/${userId}`
    )
    return response.data
  },
}

export const userRolesApi = {
  /**
   * Get user roles
   */
  getUserRoles: async (userId: string): Promise<UserRolesDto> => {
    const response = await apiClient.getRaw<UserRolesDto>(
      `${USERS_BASE_URL}/${userId}/roles`
    )
    return response.data
  },

  /**
   * Update user roles
   */
  updateUserRoles: async (
    userId: string,
    data: UpdateUserRolesRequest
  ): Promise<UserRolesDto> => {
    const response = await apiClient.putRaw<UserRolesDto>(
      `${USERS_BASE_URL}/${userId}/roles`,
      data
    )
    return response.data
  },
}
