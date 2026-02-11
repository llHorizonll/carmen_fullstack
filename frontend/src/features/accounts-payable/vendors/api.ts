import { apiClient } from "@/lib/api-client"
import type {
  VendorDto,
  VendorListDto,
  VendorLookupDto,
  VendorQueryParams,
  CreateVendorRequest,
  UpdateVendorRequest,
  VendorAgingDto,
  VendorAgingSummaryDto,
  PaginatedResult,
} from "./types"

const getBaseUrl = (tenantId: string) => `/v1/tenants/${tenantId}/vendors`

export const vendorsApi = {
  /**
   * Get paginated list of vendors
   */
  getVendors: async (
    tenantId: string,
    params?: VendorQueryParams
  ): Promise<PaginatedResult<VendorListDto>> => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.isActive !== undefined) searchParams.set("isActive", String(params.isActive))
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize))
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy)
    if (params?.sortDescending !== undefined) searchParams.set("sortDescending", String(params.sortDescending))

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<PaginatedResult<VendorListDto>>(url)
    return response.data
  },

  /**
   * Get vendor by ID
   */
  getVendor: async (tenantId: string, id: string): Promise<VendorDto> => {
    const response = await apiClient.getRaw<VendorDto>(`${getBaseUrl(tenantId)}/${id}`)
    return response.data
  },

  /**
   * Get vendor by code
   */
  getVendorByCode: async (tenantId: string, vendorCode: string): Promise<VendorDto> => {
    const response = await apiClient.getRaw<VendorDto>(
      `${getBaseUrl(tenantId)}/by-code/${vendorCode}`
    )
    return response.data
  },

  /**
   * Create a new vendor
   */
  createVendor: async (
    tenantId: string,
    data: CreateVendorRequest
  ): Promise<VendorDto> => {
    const response = await apiClient.postRaw<VendorDto>(getBaseUrl(tenantId), data)
    return response.data
  },

  /**
   * Update an existing vendor
   */
  updateVendor: async (
    tenantId: string,
    id: string,
    data: UpdateVendorRequest
  ): Promise<VendorDto> => {
    const response = await apiClient.putRaw<VendorDto>(
      `${getBaseUrl(tenantId)}/${id}`,
      data
    )
    return response.data
  },

  /**
   * Delete a vendor
   */
  deleteVendor: async (tenantId: string, id: string): Promise<void> => {
    await apiClient.deleteRaw(`${getBaseUrl(tenantId)}/${id}`)
  },

  /**
   * Get vendor lookup list for dropdowns
   */
  getVendorLookup: async (
    tenantId: string,
    search?: string
  ): Promise<VendorLookupDto[]> => {
    const params = search ? `?search=${encodeURIComponent(search)}` : ""
    const response = await apiClient.getRaw<VendorLookupDto[]>(
      `${getBaseUrl(tenantId)}/lookup${params}`
    )
    return response.data
  },

  /**
   * Get vendor aging detail
   */
  getVendorAging: async (
    tenantId: string,
    vendorId: string,
    asOfDate?: string
  ): Promise<VendorAgingDto> => {
    const params = asOfDate ? `?asOfDate=${asOfDate}` : ""
    const response = await apiClient.getRaw<VendorAgingDto>(
      `${getBaseUrl(tenantId)}/${vendorId}/aging${params}`
    )
    return response.data
  },

  /**
   * Get aging report for all vendors
   */
  getAgingReport: async (
    tenantId: string,
    asOfDate?: string
  ): Promise<VendorAgingSummaryDto[]> => {
    const params = asOfDate ? `?asOfDate=${asOfDate}` : ""
    const response = await apiClient.getRaw<VendorAgingSummaryDto[]>(
      `${getBaseUrl(tenantId)}/aging-report${params}`
    )
    return response.data
  },

  /**
   * Check if vendor code is unique
   */
  isVendorCodeUnique: async (
    tenantId: string,
    vendorCode: string,
    excludeId?: string
  ): Promise<boolean> => {
    const params = new URLSearchParams({ vendorCode })
    if (excludeId) params.set("excludeId", excludeId)
    const response = await apiClient.getRaw<{ isUnique: boolean }>(
      `${getBaseUrl(tenantId)}/check-code?${params.toString()}`
    )
    return response.data.isUnique
  },
}
