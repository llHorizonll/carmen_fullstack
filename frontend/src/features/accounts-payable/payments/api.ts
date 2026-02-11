import { apiClient } from "@/lib/api-client"
import type {
  ApPaymentDto,
  ApPaymentListDto,
  ApPaymentQueryParams,
  CreateApPaymentRequest,
  UpdateApPaymentRequest,
  ApproveApPaymentRequest,
  PostApPaymentRequest,
  VoidApPaymentRequest,
  AutoAllocateRequest,
  AutoAllocateResult,
  PaginatedResult,
} from "./types"

const getBaseUrl = (tenantId: string) => `/v1/tenants/${tenantId}/ap/payments`

export const apPaymentsApi = {
  /**
   * Get paginated list of AP payments
   */
  getPayments: async (
    tenantId: string,
    params?: ApPaymentQueryParams
  ): Promise<PaginatedResult<ApPaymentListDto>> => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.status !== undefined) searchParams.set("status", String(params.status))
    if (params?.vendorId) searchParams.set("vendorId", params.vendorId)
    if (params?.paymentMethod !== undefined) searchParams.set("paymentMethod", String(params.paymentMethod))
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom)
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo)
    if (params?.fiscalPeriodId) searchParams.set("fiscalPeriodId", params.fiscalPeriodId)
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize))
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy)
    if (params?.sortDescending !== undefined) searchParams.set("sortDescending", String(params.sortDescending))

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<PaginatedResult<ApPaymentListDto>>(url)
    return response.data
  },

  /**
   * Get AP payment by ID
   */
  getPayment: async (tenantId: string, id: string): Promise<ApPaymentDto> => {
    const response = await apiClient.getRaw<ApPaymentDto>(`${getBaseUrl(tenantId)}/${id}`)
    return response.data
  },

  /**
   * Get AP payment by number
   */
  getPaymentByNumber: async (tenantId: string, paymentNumber: string): Promise<ApPaymentDto> => {
    const response = await apiClient.getRaw<ApPaymentDto>(
      `${getBaseUrl(tenantId)}/by-number/${paymentNumber}`
    )
    return response.data
  },

  /**
   * Create a new AP payment
   */
  createPayment: async (
    tenantId: string,
    data: CreateApPaymentRequest
  ): Promise<ApPaymentDto> => {
    const response = await apiClient.postRaw<ApPaymentDto>(getBaseUrl(tenantId), data)
    return response.data
  },

  /**
   * Update an existing AP payment
   */
  updatePayment: async (
    tenantId: string,
    id: string,
    data: UpdateApPaymentRequest
  ): Promise<ApPaymentDto> => {
    const response = await apiClient.putRaw<ApPaymentDto>(
      `${getBaseUrl(tenantId)}/${id}`,
      data
    )
    return response.data
  },

  /**
   * Delete an AP payment
   */
  deletePayment: async (tenantId: string, id: string): Promise<void> => {
    await apiClient.deleteRaw(`${getBaseUrl(tenantId)}/${id}`)
  },

  /**
   * Approve payment
   */
  approvePayment: async (
    tenantId: string,
    id: string,
    data: ApproveApPaymentRequest
  ): Promise<ApPaymentDto> => {
    const response = await apiClient.postRaw<ApPaymentDto>(
      `${getBaseUrl(tenantId)}/${id}/approve`,
      data
    )
    return response.data
  },

  /**
   * Post payment
   */
  postPayment: async (
    tenantId: string,
    id: string,
    data: PostApPaymentRequest
  ): Promise<ApPaymentDto> => {
    const response = await apiClient.postRaw<ApPaymentDto>(
      `${getBaseUrl(tenantId)}/${id}/post`,
      data
    )
    return response.data
  },

  /**
   * Void payment
   */
  voidPayment: async (
    tenantId: string,
    id: string,
    data: VoidApPaymentRequest
  ): Promise<ApPaymentDto> => {
    const response = await apiClient.postRaw<ApPaymentDto>(
      `${getBaseUrl(tenantId)}/${id}/void`,
      data
    )
    return response.data
  },

  /**
   * Auto-allocate payment using FIFO
   */
  autoAllocate: async (
    tenantId: string,
    data: AutoAllocateRequest
  ): Promise<AutoAllocateResult> => {
    const response = await apiClient.postRaw<AutoAllocateResult>(
      `${getBaseUrl(tenantId)}/auto-allocate`,
      data
    )
    return response.data
  },

  /**
   * Validate payment
   */
  validatePayment: async (
    tenantId: string,
    data: CreateApPaymentRequest
  ): Promise<string[]> => {
    const response = await apiClient.postRaw<string[]>(
      `${getBaseUrl(tenantId)}/validate`,
      data
    )
    return response.data
  },

  /**
   * Get next payment number
   */
  getNextPaymentNumber: async (
    tenantId: string,
    date?: string
  ): Promise<{ paymentNumber: string }> => {
    const params = date ? `?date=${date}` : ""
    const response = await apiClient.getRaw<{ paymentNumber: string }>(
      `${getBaseUrl(tenantId)}/next-number${params}`
    )
    return response.data
  },

  /**
   * Calculate exchange gain/loss
   */
  calculateExchangeGainLoss: async (
    tenantId: string,
    invoiceId: string,
    allocationAmount: number,
    paymentExchangeRate: number
  ): Promise<{ exchangeGainLoss: number }> => {
    const params = new URLSearchParams({
      invoiceId,
      allocationAmount: String(allocationAmount),
      paymentExchangeRate: String(paymentExchangeRate),
    })
    const response = await apiClient.getRaw<{ exchangeGainLoss: number }>(
      `${getBaseUrl(tenantId)}/exchange-gain-loss?${params.toString()}`
    )
    return response.data
  },
}
