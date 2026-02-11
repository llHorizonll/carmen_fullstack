import { apiClient } from "@/lib/api-client"
import type {
  ApInvoiceDto,
  ApInvoiceListDto,
  ApInvoiceQueryParams,
  CreateApInvoiceRequest,
  UpdateApInvoiceRequest,
  SubmitApInvoiceRequest,
  ApproveApInvoiceRequest,
  RejectApInvoiceRequest,
  VoidApInvoiceRequest,
  CalculateTaxRequest,
  TaxCalculationResult,
  CreditLimitCheckResult,
  UnpaidInvoiceDto,
  PaginatedResult,
} from "./types"

const getBaseUrl = (tenantId: string) => `/v1/tenants/${tenantId}/ap/invoices`

export const apInvoicesApi = {
  /**
   * Get paginated list of AP invoices
   */
  getInvoices: async (
    tenantId: string,
    params?: ApInvoiceQueryParams
  ): Promise<PaginatedResult<ApInvoiceListDto>> => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.status !== undefined) searchParams.set("status", String(params.status))
    if (params?.vendorId) searchParams.set("vendorId", params.vendorId)
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom)
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo)
    if (params?.dueDateFrom) searchParams.set("dueDateFrom", params.dueDateFrom)
    if (params?.dueDateTo) searchParams.set("dueDateTo", params.dueDateTo)
    if (params?.fiscalPeriodId) searchParams.set("fiscalPeriodId", params.fiscalPeriodId)
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize))
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy)
    if (params?.sortDescending !== undefined) searchParams.set("sortDescending", String(params.sortDescending))

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<PaginatedResult<ApInvoiceListDto>>(url)
    return response.data
  },

  /**
   * Get AP invoice by ID
   */
  getInvoice: async (tenantId: string, id: string): Promise<ApInvoiceDto> => {
    const response = await apiClient.getRaw<ApInvoiceDto>(`${getBaseUrl(tenantId)}/${id}`)
    return response.data
  },

  /**
   * Get AP invoice by number
   */
  getInvoiceByNumber: async (tenantId: string, invoiceNumber: string): Promise<ApInvoiceDto> => {
    const response = await apiClient.getRaw<ApInvoiceDto>(
      `${getBaseUrl(tenantId)}/by-number/${invoiceNumber}`
    )
    return response.data
  },

  /**
   * Create a new AP invoice
   */
  createInvoice: async (
    tenantId: string,
    data: CreateApInvoiceRequest
  ): Promise<ApInvoiceDto> => {
    const response = await apiClient.postRaw<ApInvoiceDto>(getBaseUrl(tenantId), data)
    return response.data
  },

  /**
   * Update an existing AP invoice
   */
  updateInvoice: async (
    tenantId: string,
    id: string,
    data: UpdateApInvoiceRequest
  ): Promise<ApInvoiceDto> => {
    const response = await apiClient.putRaw<ApInvoiceDto>(
      `${getBaseUrl(tenantId)}/${id}`,
      data
    )
    return response.data
  },

  /**
   * Delete an AP invoice
   */
  deleteInvoice: async (tenantId: string, id: string): Promise<void> => {
    await apiClient.deleteRaw(`${getBaseUrl(tenantId)}/${id}`)
  },

  /**
   * Submit invoice for approval
   */
  submitForApproval: async (
    tenantId: string,
    id: string,
    data: SubmitApInvoiceRequest
  ): Promise<ApInvoiceDto> => {
    const response = await apiClient.postRaw<ApInvoiceDto>(
      `${getBaseUrl(tenantId)}/${id}/submit`,
      data
    )
    return response.data
  },

  /**
   * Approve invoice
   */
  approveInvoice: async (
    tenantId: string,
    id: string,
    data: ApproveApInvoiceRequest
  ): Promise<ApInvoiceDto> => {
    const response = await apiClient.postRaw<ApInvoiceDto>(
      `${getBaseUrl(tenantId)}/${id}/approve`,
      data
    )
    return response.data
  },

  /**
   * Reject invoice
   */
  rejectInvoice: async (
    tenantId: string,
    id: string,
    data: RejectApInvoiceRequest
  ): Promise<ApInvoiceDto> => {
    const response = await apiClient.postRaw<ApInvoiceDto>(
      `${getBaseUrl(tenantId)}/${id}/reject`,
      data
    )
    return response.data
  },

  /**
   * Void invoice
   */
  voidInvoice: async (
    tenantId: string,
    id: string,
    data: VoidApInvoiceRequest
  ): Promise<ApInvoiceDto> => {
    const response = await apiClient.postRaw<ApInvoiceDto>(
      `${getBaseUrl(tenantId)}/${id}/void`,
      data
    )
    return response.data
  },

  /**
   * Calculate taxes
   */
  calculateTax: async (
    tenantId: string,
    data: CalculateTaxRequest
  ): Promise<TaxCalculationResult> => {
    const response = await apiClient.postRaw<TaxCalculationResult>(
      `${getBaseUrl(tenantId)}/calculate-tax`,
      data
    )
    return response.data
  },

  /**
   * Check credit limit
   */
  checkCreditLimit: async (
    tenantId: string,
    vendorId: string,
    invoiceAmount: number
  ): Promise<CreditLimitCheckResult> => {
    const response = await apiClient.getRaw<CreditLimitCheckResult>(
      `${getBaseUrl(tenantId)}/check-credit-limit?vendorId=${vendorId}&invoiceAmount=${invoiceAmount}`
    )
    return response.data
  },

  /**
   * Get unpaid invoices for a vendor
   */
  getUnpaidInvoices: async (
    tenantId: string,
    vendorId: string
  ): Promise<UnpaidInvoiceDto[]> => {
    const response = await apiClient.getRaw<UnpaidInvoiceDto[]>(
      `${getBaseUrl(tenantId)}/unpaid?vendorId=${vendorId}`
    )
    return response.data
  },

  /**
   * Get next invoice number
   */
  getNextInvoiceNumber: async (
    tenantId: string,
    date?: string
  ): Promise<{ invoiceNumber: string }> => {
    const params = date ? `?date=${date}` : ""
    const response = await apiClient.getRaw<{ invoiceNumber: string }>(
      `${getBaseUrl(tenantId)}/next-number${params}`
    )
    return response.data
  },

  /**
   * Validate invoice
   */
  validateInvoice: async (
    tenantId: string,
    data: CreateApInvoiceRequest
  ): Promise<string[]> => {
    const response = await apiClient.postRaw<string[]>(
      `${getBaseUrl(tenantId)}/validate`,
      data
    )
    return response.data
  },
}
