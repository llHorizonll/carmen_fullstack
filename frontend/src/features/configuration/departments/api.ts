import { apiClient } from "@/lib/api-client"
import type {
  DepartmentDto,
  DepartmentListDto,
  DepartmentLookupDto,
  DepartmentTreeDto,
  DepartmentQueryParams,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  PaginatedResult,
} from "./types"

const getBaseUrl = (tenantId: string) => `/v1/tenants/${tenantId}/departments`

export const departmentsApi = {
  /**
   * Get paginated list of departments
   */
  getDepartments: async (
    tenantId: string,
    params?: DepartmentQueryParams
  ): Promise<PaginatedResult<DepartmentListDto>> => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.isActive !== undefined)
      searchParams.set("isActive", String(params.isActive))
    if (params?.parentDepartmentId)
      searchParams.set("parentDepartmentId", params.parentDepartmentId)
    if (params?.level !== undefined)
      searchParams.set("level", String(params.level))
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize))
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy)
    if (params?.sortDescending !== undefined)
      searchParams.set("sortDescending", String(params.sortDescending))

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<PaginatedResult<DepartmentListDto>>(url)
    return response.data
  },

  /**
   * Get department by ID
   */
  getDepartment: async (tenantId: string, id: string): Promise<DepartmentDto> => {
    const response = await apiClient.getRaw<DepartmentDto>(
      `${getBaseUrl(tenantId)}/${id}`
    )
    return response.data
  },

  /**
   * Get department by code
   */
  getDepartmentByCode: async (
    tenantId: string,
    code: string
  ): Promise<DepartmentDto> => {
    const response = await apiClient.getRaw<DepartmentDto>(
      `${getBaseUrl(tenantId)}/by-code/${code}`
    )
    return response.data
  },

  /**
   * Get departments for lookup (dropdown/select)
   */
  getDepartmentLookup: async (
    tenantId: string,
    isActive?: boolean,
    excludeId?: string
  ): Promise<DepartmentLookupDto[]> => {
    const searchParams = new URLSearchParams()
    if (isActive !== undefined)
      searchParams.set("isActive", String(isActive))
    if (excludeId)
      searchParams.set("excludeId", excludeId)

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}/lookup${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<DepartmentLookupDto[]>(url)
    return response.data
  },

  /**
   * Get departments as a hierarchical tree
   */
  getDepartmentTree: async (
    tenantId: string,
    isActive?: boolean
  ): Promise<DepartmentTreeDto[]> => {
    const searchParams = new URLSearchParams()
    if (isActive !== undefined)
      searchParams.set("isActive", String(isActive))

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}/tree${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<DepartmentTreeDto[]>(url)
    return response.data
  },

  /**
   * Create a new department
   */
  createDepartment: async (
    tenantId: string,
    data: CreateDepartmentRequest
  ): Promise<DepartmentDto> => {
    const response = await apiClient.postRaw<DepartmentDto>(
      getBaseUrl(tenantId),
      data
    )
    return response.data
  },

  /**
   * Update an existing department
   */
  updateDepartment: async (
    tenantId: string,
    id: string,
    data: UpdateDepartmentRequest
  ): Promise<DepartmentDto> => {
    const response = await apiClient.putRaw<DepartmentDto>(
      `${getBaseUrl(tenantId)}/${id}`,
      data
    )
    return response.data
  },

  /**
   * Delete a department (soft delete)
   */
  deleteDepartment: async (tenantId: string, id: string): Promise<void> => {
    await apiClient.deleteRaw(`${getBaseUrl(tenantId)}/${id}`)
  },

  /**
   * Check if department code exists
   */
  checkDepartmentCode: async (
    tenantId: string,
    code: string,
    excludeId?: string
  ): Promise<{ exists: boolean }> => {
    const url = excludeId
      ? `${getBaseUrl(tenantId)}/check-code/${code}?excludeId=${excludeId}`
      : `${getBaseUrl(tenantId)}/check-code/${code}`

    const response = await apiClient.getRaw<{ exists: boolean }>(url)
    return response.data
  },

  /**
   * Check if department has references (child departments or transactions)
   */
  checkHasReferences: async (
    tenantId: string,
    id: string
  ): Promise<{ hasReferences: boolean }> => {
    const response = await apiClient.getRaw<{ hasReferences: boolean }>(
      `${getBaseUrl(tenantId)}/${id}/has-references`
    )
    return response.data
  },
}
