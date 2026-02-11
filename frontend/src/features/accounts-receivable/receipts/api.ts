import { apiClient } from "@/lib/api-client"
import type {
  ArReceiptDto,
  ArReceiptListDto,
  ArReceiptQueryParams,
  CreateArReceiptRequest,
  UpdateArReceiptRequest,
  ApproveArReceiptRequest,
  PostArReceiptRequest,
  VoidArReceiptRequest,
  ArAutoAllocateRequest,
  ArAutoAllocateResult,
  PaginatedResult,
} from "./types"

const getBaseUrl = (tenantId: string) => `/v1/tenants/${tenantId}/ar/receipts`

export const arReceiptsApi = {
  /**
   * Get paginated list of AR receipts
   */
  getReceipts: async (
    tenantId: string,
    params?: ArReceiptQueryParams
  ): Promise<PaginatedResult<ArReceiptListDto>> => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.status !== undefined) searchParams.set("status", String(params.status))
    if (params?.customerId) searchParams.set("customerId", params.customerId)
    if (params?.receiptMethod !== undefined) searchParams.set("receiptMethod", String(params.receiptMethod))
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom)
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo)
    if (params?.fiscalPeriodId) searchParams.set("fiscalPeriodId", params.fiscalPeriodId)
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize))
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy)
    if (params?.sortDescending !== undefined) searchParams.set("sortDescending", String(params.sortDescending))

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<PaginatedResult<ArReceiptListDto>>(url)
    return response.data
  },

  /**
   * Get AR receipt by ID
   */
  getReceipt: async (tenantId: string, id: string): Promise<ArReceiptDto> => {
    const response = await apiClient.getRaw<ArReceiptDto>(`${getBaseUrl(tenantId)}/${id}`)
    return response.data
  },

  /**
   * Get AR receipt by number
   */
  getReceiptByNumber: async (tenantId: string, receiptNumber: string): Promise<ArReceiptDto> => {
    const response = await apiClient.getRaw<ArReceiptDto>(
      `${getBaseUrl(tenantId)}/by-number/${receiptNumber}`
    )
    return response.data
  },

  /**
   * Create a new AR receipt
   */
  createReceipt: async (
    tenantId: string,
    data: CreateArReceiptRequest
  ): Promise<ArReceiptDto> => {
    const response = await apiClient.postRaw<ArReceiptDto>(getBaseUrl(tenantId), data)
    return response.data
  },

  /**
   * Update an existing AR receipt
   */
  updateReceipt: async (
    tenantId: string,
    id: string,
    data: UpdateArReceiptRequest
  ): Promise<ArReceiptDto> => {
    const response = await apiClient.putRaw<ArReceiptDto>(
      `${getBaseUrl(tenantId)}/${id}`,
      data
    )
    return response.data
  },

  /**
   * Delete an AR receipt
   */
  deleteReceipt: async (tenantId: string, id: string): Promise<void> => {
    await apiClient.deleteRaw(`${getBaseUrl(tenantId)}/${id}`)
  },

  /**
   * Approve receipt
   */
  approveReceipt: async (
    tenantId: string,
    id: string,
    data: ApproveArReceiptRequest
  ): Promise<ArReceiptDto> => {
    const response = await apiClient.postRaw<ArReceiptDto>(
      `${getBaseUrl(tenantId)}/${id}/approve`,
      data
    )
    return response.data
  },

  /**
   * Post receipt
   */
  postReceipt: async (
    tenantId: string,
    id: string,
    data: PostArReceiptRequest
  ): Promise<ArReceiptDto> => {
    const response = await apiClient.postRaw<ArReceiptDto>(
      `${getBaseUrl(tenantId)}/${id}/post`,
      data
    )
    return response.data
  },

  /**
   * Void receipt
   */
  voidReceipt: async (
    tenantId: string,
    id: string,
    data: VoidArReceiptRequest
  ): Promise<ArReceiptDto> => {
    const response = await apiClient.postRaw<ArReceiptDto>(
      `${getBaseUrl(tenantId)}/${id}/void`,
      data
    )
    return response.data
  },

  /**
   * Auto-allocate receipt using FIFO
   */
  autoAllocate: async (
    tenantId: string,
    data: ArAutoAllocateRequest
  ): Promise<ArAutoAllocateResult> => {
    const response = await apiClient.postRaw<ArAutoAllocateResult>(
      `${getBaseUrl(tenantId)}/auto-allocate`,
      data
    )
    return response.data
  },

  /**
   * Get next receipt number
   */
  getNextReceiptNumber: async (
    tenantId: string,
    date?: string
  ): Promise<{ receiptNumber: string }> => {
    const params = date ? `?date=${date}` : ""
    const response = await apiClient.getRaw<{ receiptNumber: string }>(
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
    receiptExchangeRate: number
  ): Promise<{ exchangeGainLoss: number }> => {
    const params = new URLSearchParams({
      invoiceId,
      allocationAmount: String(allocationAmount),
      receiptExchangeRate: String(receiptExchangeRate),
    })
    const response = await apiClient.getRaw<{ exchangeGainLoss: number }>(
      `${getBaseUrl(tenantId)}/calculate-exchange-gain-loss?${params.toString()}`
    )
    return response.data
  },
}
