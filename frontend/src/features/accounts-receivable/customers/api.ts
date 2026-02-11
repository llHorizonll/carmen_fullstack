import { apiClient } from "@/lib/api-client"
import type {
  CustomerDto,
  CustomerListDto,
  CustomerLookupDto,
  CustomerQueryParams,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerAgingDto,
  CustomerAgingSummaryDto,
  PaginatedResult,
} from "./types"

const getBaseUrl = (tenantId: string) => `/v1/tenants/${tenantId}/customers`

export const customersApi = {
  /**
   * Get paginated list of customers
   */
  getCustomers: async (
    tenantId: string,
    params?: CustomerQueryParams
  ): Promise<PaginatedResult<CustomerListDto>> => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.isActive !== undefined) searchParams.set("isActive", String(params.isActive))
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize))
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy)
    if (params?.sortDescending !== undefined) searchParams.set("sortDescending", String(params.sortDescending))

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<PaginatedResult<CustomerListDto>>(url)
    return response.data
  },

  /**
   * Get customer by ID
   */
  getCustomer: async (tenantId: string, id: string): Promise<CustomerDto> => {
    const response = await apiClient.getRaw<CustomerDto>(`${getBaseUrl(tenantId)}/${id}`)
    return response.data
  },

  /**
   * Get customer by code
   */
  getCustomerByCode: async (tenantId: string, customerCode: string): Promise<CustomerDto> => {
    const response = await apiClient.getRaw<CustomerDto>(
      `${getBaseUrl(tenantId)}/by-code/${customerCode}`
    )
    return response.data
  },

  /**
   * Create a new customer
   */
  createCustomer: async (
    tenantId: string,
    data: CreateCustomerRequest
  ): Promise<CustomerDto> => {
    const response = await apiClient.postRaw<CustomerDto>(getBaseUrl(tenantId), data)
    return response.data
  },

  /**
   * Update an existing customer
   */
  updateCustomer: async (
    tenantId: string,
    id: string,
    data: UpdateCustomerRequest
  ): Promise<CustomerDto> => {
    const response = await apiClient.putRaw<CustomerDto>(
      `${getBaseUrl(tenantId)}/${id}`,
      data
    )
    return response.data
  },

  /**
   * Delete a customer
   */
  deleteCustomer: async (tenantId: string, id: string): Promise<void> => {
    await apiClient.deleteRaw(`${getBaseUrl(tenantId)}/${id}`)
  },

  /**
   * Get customer lookup list for dropdowns
   */
  getCustomerLookup: async (
    tenantId: string,
    search?: string
  ): Promise<CustomerLookupDto[]> => {
    const params = search ? `?search=${encodeURIComponent(search)}` : ""
    const response = await apiClient.getRaw<CustomerLookupDto[]>(
      `${getBaseUrl(tenantId)}/lookup${params}`
    )
    return response.data
  },

  /**
   * Get customer aging detail
   */
  getCustomerAging: async (
    tenantId: string,
    customerId: string,
    asOfDate?: string
  ): Promise<CustomerAgingDto> => {
    const params = asOfDate ? `?asOfDate=${asOfDate}` : ""
    const response = await apiClient.getRaw<CustomerAgingDto>(
      `${getBaseUrl(tenantId)}/${customerId}/aging${params}`
    )
    return response.data
  },

  /**
   * Get aging report for all customers
   */
  getAgingReport: async (
    tenantId: string,
    asOfDate?: string
  ): Promise<CustomerAgingSummaryDto[]> => {
    const params = asOfDate ? `?asOfDate=${asOfDate}` : ""
    const response = await apiClient.getRaw<CustomerAgingSummaryDto[]>(
      `${getBaseUrl(tenantId)}/aging-report${params}`
    )
    return response.data
  },

  /**
   * Check if customer code is unique
   */
  isCustomerCodeUnique: async (
    tenantId: string,
    customerCode: string,
    excludeId?: string
  ): Promise<boolean> => {
    const params = new URLSearchParams({ customerCode })
    if (excludeId) params.set("excludeId", excludeId)
    const response = await apiClient.getRaw<{ isUnique: boolean }>(
      `${getBaseUrl(tenantId)}/check-code?${params.toString()}`
    )
    return response.data.isUnique
  },
}
