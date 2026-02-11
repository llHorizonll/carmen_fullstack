import { apiClient } from "@/lib/api-client"
import type {
  FiscalYearDto,
  FiscalYearListDto,
  CreateFiscalYearRequest,
  FiscalPeriodDto,
  FiscalPeriodListDto,
  FiscalPeriodLookupDto,
  FiscalPeriodQueryParams,
  ClosePeriodRequest,
  ReopenPeriodRequest,
  PeriodCloseValidationResult,
  PeriodBlockingVouchersDto,
  PaginatedResult,
} from "./types"

const getBaseUrl = (tenantId: string) => `/v1/tenants/${tenantId}/fiscal-periods`

export const fiscalPeriodsApi = {
  // Fiscal Year endpoints

  /**
   * Get all fiscal years
   */
  getFiscalYears: async (tenantId: string): Promise<FiscalYearListDto[]> => {
    const response = await apiClient.getRaw<FiscalYearListDto[]>(
      `${getBaseUrl(tenantId)}/years`
    )
    return response.data
  },

  /**
   * Get fiscal year by ID
   */
  getFiscalYear: async (
    tenantId: string,
    id: string
  ): Promise<FiscalYearDto> => {
    const response = await apiClient.getRaw<FiscalYearDto>(
      `${getBaseUrl(tenantId)}/years/${id}`
    )
    return response.data
  },

  /**
   * Create a new fiscal year
   */
  createFiscalYear: async (
    tenantId: string,
    data: CreateFiscalYearRequest
  ): Promise<FiscalYearDto> => {
    const response = await apiClient.postRaw<FiscalYearDto>(
      `${getBaseUrl(tenantId)}/years`,
      data
    )
    return response.data
  },

  // Fiscal Period endpoints

  /**
   * Get paginated list of fiscal periods
   */
  getPeriods: async (
    tenantId: string,
    params?: FiscalPeriodQueryParams
  ): Promise<PaginatedResult<FiscalPeriodListDto>> => {
    const searchParams = new URLSearchParams()
    if (params?.fiscalYearId) searchParams.set("fiscalYearId", params.fiscalYearId)
    if (params?.status !== undefined) searchParams.set("status", String(params.status))
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize))

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<PaginatedResult<FiscalPeriodListDto>>(url)
    return response.data
  },

  /**
   * Get fiscal period by ID
   */
  getPeriod: async (tenantId: string, id: string): Promise<FiscalPeriodDto> => {
    const response = await apiClient.getRaw<FiscalPeriodDto>(
      `${getBaseUrl(tenantId)}/${id}`
    )
    return response.data
  },

  /**
   * Get periods for lookup (dropdown)
   */
  getPeriodLookup: async (
    tenantId: string,
    fiscalYearId?: string,
    openOnly?: boolean
  ): Promise<FiscalPeriodLookupDto[]> => {
    const searchParams = new URLSearchParams()
    if (fiscalYearId) searchParams.set("fiscalYearId", fiscalYearId)
    if (openOnly !== undefined) searchParams.set("openOnly", String(openOnly))

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}/lookup${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<FiscalPeriodLookupDto[]>(url)
    return response.data
  },

  /**
   * Get current open period
   */
  getCurrentPeriod: async (tenantId: string): Promise<FiscalPeriodDto | null> => {
    try {
      const response = await apiClient.getRaw<FiscalPeriodDto>(
        `${getBaseUrl(tenantId)}/current`
      )
      return response.data
    } catch {
      return null
    }
  },

  /**
   * Get period by date
   */
  getPeriodByDate: async (
    tenantId: string,
    date: string
  ): Promise<FiscalPeriodDto | null> => {
    try {
      const response = await apiClient.getRaw<FiscalPeriodDto>(
        `${getBaseUrl(tenantId)}/by-date?date=${date}`
      )
      return response.data
    } catch {
      return null
    }
  },

  // Period Closing endpoints

  /**
   * Validate if a period can be closed
   */
  validatePeriodClose: async (
    tenantId: string,
    id: string
  ): Promise<PeriodCloseValidationResult> => {
    const response = await apiClient.getRaw<PeriodCloseValidationResult>(
      `${getBaseUrl(tenantId)}/${id}/close-validation`
    )
    return response.data
  },

  /**
   * Get vouchers blocking period close
   */
  getBlockingVouchers: async (
    tenantId: string,
    id: string
  ): Promise<PeriodBlockingVouchersDto> => {
    const response = await apiClient.getRaw<PeriodBlockingVouchersDto>(
      `${getBaseUrl(tenantId)}/${id}/blocking-vouchers`
    )
    return response.data
  },

  /**
   * Close a fiscal period
   */
  closePeriod: async (
    tenantId: string,
    id: string,
    data: ClosePeriodRequest
  ): Promise<FiscalPeriodDto> => {
    const response = await apiClient.postRaw<FiscalPeriodDto>(
      `${getBaseUrl(tenantId)}/${id}/close`,
      data
    )
    return response.data
  },

  /**
   * Reopen a closed fiscal period
   */
  reopenPeriod: async (
    tenantId: string,
    id: string,
    data: ReopenPeriodRequest
  ): Promise<FiscalPeriodDto> => {
    const response = await apiClient.postRaw<FiscalPeriodDto>(
      `${getBaseUrl(tenantId)}/${id}/reopen`,
      data
    )
    return response.data
  },

  /**
   * Lock a fiscal period permanently
   */
  lockPeriod: async (
    tenantId: string,
    id: string
  ): Promise<FiscalPeriodDto> => {
    const response = await apiClient.postRaw<FiscalPeriodDto>(
      `${getBaseUrl(tenantId)}/${id}/lock`,
      {}
    )
    return response.data
  },
}
