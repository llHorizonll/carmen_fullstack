import { apiClient } from "@/lib/api-client"
import type {
  RecurringVoucherDto,
  RecurringVoucherListDto,
  RecurringVoucherQueryParams,
  CreateRecurringVoucherRequest,
  UpdateRecurringVoucherRequest,
  PaginatedResult,
} from "./types"

const getBaseUrl = (tenantId: string) => `/v1/tenants/${tenantId}/gl/recurring-vouchers`

export const recurringVouchersApi = {
  getRecurringVouchers: async (
    tenantId: string,
    params?: RecurringVoucherQueryParams
  ): Promise<PaginatedResult<RecurringVoucherListDto>> => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set("search", params.search)
    if (params?.isActive !== undefined) searchParams.set("isActive", String(params.isActive))
    if (params?.frequency !== undefined) searchParams.set("frequency", String(params.frequency))
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize))
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy)
    if (params?.sortDescending !== undefined) searchParams.set("sortDescending", String(params.sortDescending))

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<PaginatedResult<RecurringVoucherListDto>>(url)
    return response.data
  },

  getRecurringVoucher: async (tenantId: string, id: string): Promise<RecurringVoucherDto> => {
    const response = await apiClient.getRaw<RecurringVoucherDto>(`${getBaseUrl(tenantId)}/${id}`)
    return response.data
  },

  createRecurringVoucher: async (
    tenantId: string,
    data: CreateRecurringVoucherRequest
  ): Promise<RecurringVoucherDto> => {
    const response = await apiClient.postRaw<RecurringVoucherDto>(getBaseUrl(tenantId), data)
    return response.data
  },

  updateRecurringVoucher: async (
    tenantId: string,
    id: string,
    data: UpdateRecurringVoucherRequest
  ): Promise<RecurringVoucherDto> => {
    const response = await apiClient.putRaw<RecurringVoucherDto>(
      `${getBaseUrl(tenantId)}/${id}`,
      data
    )
    return response.data
  },

  deleteRecurringVoucher: async (tenantId: string, id: string): Promise<void> => {
    await apiClient.deleteRaw(`${getBaseUrl(tenantId)}/${id}`)
  },

  activate: async (tenantId: string, id: string): Promise<RecurringVoucherDto> => {
    const response = await apiClient.postRaw<RecurringVoucherDto>(
      `${getBaseUrl(tenantId)}/${id}/activate`
    )
    return response.data
  },

  deactivate: async (tenantId: string, id: string): Promise<RecurringVoucherDto> => {
    const response = await apiClient.postRaw<RecurringVoucherDto>(
      `${getBaseUrl(tenantId)}/${id}/deactivate`
    )
    return response.data
  },
}
