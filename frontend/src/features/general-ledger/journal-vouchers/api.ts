import { apiClient } from "@/lib/api-client"
import type {
  JournalVoucherDto,
  JournalVoucherListDto,
  JournalVoucherQueryParams,
  CreateJournalVoucherRequest,
  UpdateJournalVoucherRequest,
  SubmitForApprovalRequest,
  ApproveVoucherRequest,
  RejectVoucherRequest,
  PostVoucherRequest,
  ReverseVoucherRequest,
  PaginatedResult,
  VoucherType,
} from "./types"

const getBaseUrl = (tenantId: string) => `/v1/tenants/${tenantId}/journal-vouchers`

export const journalVouchersApi = {
  /**
   * Get paginated list of journal vouchers
   */
  getVouchers: async (
    tenantId: string,
    params?: JournalVoucherQueryParams
  ): Promise<PaginatedResult<JournalVoucherListDto>> => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.status !== undefined) searchParams.set("status", String(params.status))
    if (params?.voucherType !== undefined) searchParams.set("voucherType", String(params.voucherType))
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom)
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo)
    if (params?.fiscalPeriodId) searchParams.set("fiscalPeriodId", params.fiscalPeriodId)
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize))
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy)
    if (params?.sortDescending !== undefined) searchParams.set("sortDescending", String(params.sortDescending))

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<PaginatedResult<JournalVoucherListDto>>(url)
    return response.data
  },

  /**
   * Get journal voucher by ID
   */
  getVoucher: async (tenantId: string, id: string): Promise<JournalVoucherDto> => {
    const response = await apiClient.getRaw<JournalVoucherDto>(`${getBaseUrl(tenantId)}/${id}`)
    return response.data
  },

  /**
   * Get journal voucher by number
   */
  getVoucherByNumber: async (tenantId: string, voucherNumber: string): Promise<JournalVoucherDto> => {
    const response = await apiClient.getRaw<JournalVoucherDto>(
      `${getBaseUrl(tenantId)}/by-number/${voucherNumber}`
    )
    return response.data
  },

  /**
   * Create a new journal voucher
   */
  createVoucher: async (
    tenantId: string,
    data: CreateJournalVoucherRequest
  ): Promise<JournalVoucherDto> => {
    const response = await apiClient.postRaw<JournalVoucherDto>(getBaseUrl(tenantId), data)
    return response.data
  },

  /**
   * Update an existing journal voucher
   */
  updateVoucher: async (
    tenantId: string,
    id: string,
    data: UpdateJournalVoucherRequest
  ): Promise<JournalVoucherDto> => {
    const response = await apiClient.putRaw<JournalVoucherDto>(
      `${getBaseUrl(tenantId)}/${id}`,
      data
    )
    return response.data
  },

  /**
   * Delete a journal voucher
   */
  deleteVoucher: async (tenantId: string, id: string): Promise<void> => {
    await apiClient.deleteRaw(`${getBaseUrl(tenantId)}/${id}`)
  },

  /**
   * Submit for approval
   */
  submitForApproval: async (
    tenantId: string,
    id: string,
    data: SubmitForApprovalRequest
  ): Promise<JournalVoucherDto> => {
    const response = await apiClient.postRaw<JournalVoucherDto>(
      `${getBaseUrl(tenantId)}/${id}/submit`,
      data
    )
    return response.data
  },

  /**
   * Approve voucher
   */
  approveVoucher: async (
    tenantId: string,
    id: string,
    data: ApproveVoucherRequest
  ): Promise<JournalVoucherDto> => {
    const response = await apiClient.postRaw<JournalVoucherDto>(
      `${getBaseUrl(tenantId)}/${id}/approve`,
      data
    )
    return response.data
  },

  /**
   * Reject voucher
   */
  rejectVoucher: async (
    tenantId: string,
    id: string,
    data: RejectVoucherRequest
  ): Promise<JournalVoucherDto> => {
    const response = await apiClient.postRaw<JournalVoucherDto>(
      `${getBaseUrl(tenantId)}/${id}/reject`,
      data
    )
    return response.data
  },

  /**
   * Post voucher
   */
  postVoucher: async (
    tenantId: string,
    id: string,
    data: PostVoucherRequest
  ): Promise<JournalVoucherDto> => {
    const response = await apiClient.postRaw<JournalVoucherDto>(
      `${getBaseUrl(tenantId)}/${id}/post`,
      data
    )
    return response.data
  },

  /**
   * Reverse voucher
   */
  reverseVoucher: async (
    tenantId: string,
    id: string,
    data: ReverseVoucherRequest
  ): Promise<JournalVoucherDto> => {
    const response = await apiClient.postRaw<JournalVoucherDto>(
      `${getBaseUrl(tenantId)}/${id}/reverse`,
      data
    )
    return response.data
  },

  /**
   * Void voucher
   */
  voidVoucher: async (
    tenantId: string,
    id: string,
    reason: string
  ): Promise<JournalVoucherDto> => {
    const response = await apiClient.postRaw<JournalVoucherDto>(
      `${getBaseUrl(tenantId)}/${id}/void`,
      reason
    )
    return response.data
  },

  /**
   * Validate voucher
   */
  validateVoucher: async (
    tenantId: string,
    data: CreateJournalVoucherRequest
  ): Promise<{ valid: boolean; errors: string[] }> => {
    const response = await apiClient.postRaw<{ valid: boolean; errors: string[] }>(
      `${getBaseUrl(tenantId)}/validate`,
      data
    )
    return response.data
  },

  /**
   * Get next voucher number
   */
  getNextVoucherNumber: async (
    tenantId: string,
    voucherType: VoucherType = 1,
    date?: string
  ): Promise<{ voucherNumber: string }> => {
    const params = new URLSearchParams()
    params.set("voucherType", String(voucherType))
    if (date) params.set("date", date)

    const response = await apiClient.getRaw<{ voucherNumber: string }>(
      `${getBaseUrl(tenantId)}/next-number?${params.toString()}`
    )
    return response.data
  },
}
