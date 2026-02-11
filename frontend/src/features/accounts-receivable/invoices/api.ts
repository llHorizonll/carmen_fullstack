import { apiClient } from "@/lib/api-client"
import type {
  ArInvoiceDto,
  ArInvoiceListDto,
  ArInvoiceQueryParams,
  CreateArInvoiceRequest,
  UpdateArInvoiceRequest,
  SubmitArInvoiceRequest,
  ApproveArInvoiceRequest,
  RejectArInvoiceRequest,
  VoidArInvoiceRequest,
  CalculateTaxRequest,
  TaxCalculationResult,
  UnpaidArInvoiceDto,
  PaginatedResult,
} from "./types"

const getBaseUrl = (tenantId: string) => `/v1/tenants/${tenantId}/ar/invoices`

export const arInvoicesApi = {
  /**
   * Get paginated list of AR invoices
   */
  getInvoices: async (
    tenantId: string,
    params?: ArInvoiceQueryParams
  ): Promise<PaginatedResult<ArInvoiceListDto>> => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.status !== undefined) searchParams.set("status", String(params.status))
    if (params?.customerId) searchParams.set("customerId", params.customerId)
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

    const response = await apiClient.getRaw<PaginatedResult<ArInvoiceListDto>>(url)
    return response.data
  },

  /**
   * Get AR invoice by ID
   */
  getInvoice: async (tenantId: string, id: string): Promise<ArInvoiceDto> => {
    const response = await apiClient.getRaw<ArInvoiceDto>(`${getBaseUrl(tenantId)}/${id}`)
    return response.data
  },

  /**
   * Get AR invoice by number
   */
  getInvoiceByNumber: async (tenantId: string, invoiceNumber: string): Promise<ArInvoiceDto> => {
    const response = await apiClient.getRaw<ArInvoiceDto>(
      `${getBaseUrl(tenantId)}/by-number/${invoiceNumber}`
    )
    return response.data
  },

  /**
   * Create a new AR invoice
   */
  createInvoice: async (
    tenantId: string,
    data: CreateArInvoiceRequest
  ): Promise<ArInvoiceDto> => {
    const response = await apiClient.postRaw<ArInvoiceDto>(getBaseUrl(tenantId), data)
    return response.data
  },

  /**
   * Update an existing AR invoice
   */
  updateInvoice: async (
    tenantId: string,
    id: string,
    data: UpdateArInvoiceRequest
  ): Promise<ArInvoiceDto> => {
    const response = await apiClient.putRaw<ArInvoiceDto>(
      `${getBaseUrl(tenantId)}/${id}`,
      data
    )
    return response.data
  },

  /**
   * Delete an AR invoice
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
    data: SubmitArInvoiceRequest
  ): Promise<ArInvoiceDto> => {
    const response = await apiClient.postRaw<ArInvoiceDto>(
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
    data: ApproveArInvoiceRequest
  ): Promise<ArInvoiceDto> => {
    const response = await apiClient.postRaw<ArInvoiceDto>(
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
    data: RejectArInvoiceRequest
  ): Promise<ArInvoiceDto> => {
    const response = await apiClient.postRaw<ArInvoiceDto>(
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
    data: VoidArInvoiceRequest
  ): Promise<ArInvoiceDto> => {
    const response = await apiClient.postRaw<ArInvoiceDto>(
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
   * Get unpaid invoices for a customer
   */
  getUnpaidInvoices: async (
    tenantId: string,
    customerId: string
  ): Promise<UnpaidArInvoiceDto[]> => {
    const response = await apiClient.getRaw<UnpaidArInvoiceDto[]>(
      `${getBaseUrl(tenantId)}/unpaid?customerId=${customerId}`
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
}
