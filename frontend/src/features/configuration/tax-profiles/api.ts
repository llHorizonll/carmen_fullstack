import { apiClient } from "@/lib/api-client"
import type {
  TaxProfileDto,
  TaxProfileListDto,
  TaxProfileLookupDto,
  TaxProfileQueryParams,
  CreateTaxProfileRequest,
  PaginatedResult,
  UpdateTaxProfileRequest,
} from "./types"

const getBaseUrl = (tenantId: string) => `/v1/tenants/${tenantId}/tax-profiles`

export const taxProfilesApi = {
  /**
   * Get paginated list of tax profiles
   */
  getTaxProfiles: async (
    tenantId: string,
    params?: TaxProfileQueryParams
  ): Promise<PaginatedResult<TaxProfileListDto>> => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.taxType !== undefined)
      searchParams.set("taxType", String(params.taxType))
    if (params?.isActive !== undefined)
      searchParams.set("isActive", String(params.isActive))
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize))
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy)
    if (params?.sortDescending !== undefined)
      searchParams.set("sortDescending", String(params.sortDescending))

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<PaginatedResult<TaxProfileListDto>>(url)
    return response.data
  },

  /**
   * Get tax profile by ID
   */
  getTaxProfile: async (tenantId: string, id: string): Promise<TaxProfileDto> => {
    const response = await apiClient.getRaw<TaxProfileDto>(
      `${getBaseUrl(tenantId)}/${id}`
    )
    return response.data
  },

  /**
   * Get tax profile by code
   */
  getTaxProfileByCode: async (
    tenantId: string,
    code: string
  ): Promise<TaxProfileDto> => {
    const response = await apiClient.getRaw<TaxProfileDto>(
      `${getBaseUrl(tenantId)}/by-code/${code}`
    )
    return response.data
  },

  /**
   * Get tax profiles for lookup (dropdown/select)
   */
  getTaxProfileLookup: async (
    tenantId: string,
    isActive?: boolean
  ): Promise<TaxProfileLookupDto[]> => {
    const searchParams = new URLSearchParams()
    if (isActive !== undefined)
      searchParams.set("isActive", String(isActive))

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}/lookup${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<TaxProfileLookupDto[]>(url)
    return response.data
  },

  /**
   * Create a new tax profile
   */
  createTaxProfile: async (
    tenantId: string,
    data: CreateTaxProfileRequest
  ): Promise<TaxProfileDto> => {
    const response = await apiClient.postRaw<TaxProfileDto>(
      getBaseUrl(tenantId),
      data
    )
    return response.data
  },

  /**
   * Update an existing tax profile
   */
  updateTaxProfile: async (
    tenantId: string,
    id: string,
    data: UpdateTaxProfileRequest
  ): Promise<TaxProfileDto> => {
    const response = await apiClient.putRaw<TaxProfileDto>(
      `${getBaseUrl(tenantId)}/${id}`,
      data
    )
    return response.data
  },

  /**
   * Delete a tax profile (soft delete)
   */
  deleteTaxProfile: async (tenantId: string, id: string): Promise<void> => {
    await apiClient.deleteRaw(`${getBaseUrl(tenantId)}/${id}`)
  },

  /**
   * Check if tax code exists
   */
  checkTaxCode: async (
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
   * Check if tax profile has transactions
   */
  checkHasTransactions: async (
    tenantId: string,
    id: string
  ): Promise<{ hasTransactions: boolean }> => {
    const response = await apiClient.getRaw<{ hasTransactions: boolean }>(
      `${getBaseUrl(tenantId)}/${id}/has-transactions`
    )
    return response.data
  },
}
