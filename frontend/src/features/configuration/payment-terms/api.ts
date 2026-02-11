import { apiClient } from "@/lib/api-client"
import type {
  PaymentTermDto,
  PaymentTermListDto,
  PaymentTermLookupDto,
  PaymentTermQueryParams,
  CreatePaymentTermRequest,
  UpdatePaymentTermRequest,
  PaginatedResult,
} from "./types"

const getBaseUrl = (tenantId: string) => `/v1/tenants/${tenantId}/payment-terms`

export const paymentTermsApi = {
  /**
   * Get paginated list of payment terms
   */
  getPaymentTerms: async (
    tenantId: string,
    params?: PaymentTermQueryParams
  ): Promise<PaginatedResult<PaymentTermListDto>> => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.isActive !== undefined)
      searchParams.set("isActive", String(params.isActive))
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize))
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy)
    if (params?.sortDescending !== undefined)
      searchParams.set("sortDescending", String(params.sortDescending))

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<PaginatedResult<PaymentTermListDto>>(url)
    return response.data
  },

  /**
   * Get payment term by ID
   */
  getPaymentTerm: async (tenantId: string, id: string): Promise<PaymentTermDto> => {
    const response = await apiClient.getRaw<PaymentTermDto>(
      `${getBaseUrl(tenantId)}/${id}`
    )
    return response.data
  },

  /**
   * Get payment term by code
   */
  getPaymentTermByCode: async (
    tenantId: string,
    code: string
  ): Promise<PaymentTermDto> => {
    const response = await apiClient.getRaw<PaymentTermDto>(
      `${getBaseUrl(tenantId)}/by-code/${code}`
    )
    return response.data
  },

  /**
   * Get payment terms for lookup (dropdown/select)
   */
  getPaymentTermLookup: async (
    tenantId: string,
    isActive?: boolean
  ): Promise<PaymentTermLookupDto[]> => {
    const searchParams = new URLSearchParams()
    if (isActive !== undefined)
      searchParams.set("isActive", String(isActive))

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}/lookup${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<PaymentTermLookupDto[]>(url)
    return response.data
  },

  /**
   * Create a new payment term
   */
  createPaymentTerm: async (
    tenantId: string,
    data: CreatePaymentTermRequest
  ): Promise<PaymentTermDto> => {
    const response = await apiClient.postRaw<PaymentTermDto>(
      getBaseUrl(tenantId),
      data
    )
    return response.data
  },

  /**
   * Update an existing payment term
   */
  updatePaymentTerm: async (
    tenantId: string,
    id: string,
    data: UpdatePaymentTermRequest
  ): Promise<PaymentTermDto> => {
    const response = await apiClient.putRaw<PaymentTermDto>(
      `${getBaseUrl(tenantId)}/${id}`,
      data
    )
    return response.data
  },

  /**
   * Delete a payment term (soft delete)
   */
  deletePaymentTerm: async (tenantId: string, id: string): Promise<void> => {
    await apiClient.deleteRaw(`${getBaseUrl(tenantId)}/${id}`)
  },

  /**
   * Check if term code exists
   */
  checkTermCode: async (
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
   * Check if payment term has transactions
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
