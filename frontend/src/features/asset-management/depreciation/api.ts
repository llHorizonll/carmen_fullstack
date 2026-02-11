import { apiClient } from "@/lib/api-client"
import type { DepreciationScheduleDto, PaginatedResult } from "../assets/types"
import type {
  DepreciationScheduleListDto,
  DepreciationQueryParams,
  RunDepreciationRequest,
  DepreciationSummaryDto,
  DepreciationForecastDto,
} from "./types"

const getBaseUrl = (tenantId: string) => `/v1/tenants/${tenantId}/depreciation`

export const depreciationApi = {
  /**
   * Get paginated list of depreciation schedules
   */
  getSchedules: async (
    tenantId: string,
    params?: DepreciationQueryParams
  ): Promise<PaginatedResult<DepreciationScheduleListDto>> => {
    const searchParams = new URLSearchParams()
    if (params?.assetId) searchParams.set("assetId", params.assetId)
    if (params?.fiscalPeriodId) searchParams.set("fiscalPeriodId", params.fiscalPeriodId)
    if (params?.isPosted !== undefined) searchParams.set("isPosted", String(params.isPosted))
    if (params?.dateFrom) searchParams.set("dateFrom", params.dateFrom)
    if (params?.dateTo) searchParams.set("dateTo", params.dateTo)
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize))
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy)
    if (params?.sortDescending !== undefined) searchParams.set("sortDescending", String(params.sortDescending))

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}/schedules${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<PaginatedResult<DepreciationScheduleListDto>>(url)
    return response.data
  },

  /**
   * Get schedule by ID
   */
  getSchedule: async (tenantId: string, id: string): Promise<DepreciationScheduleDto> => {
    const response = await apiClient.getRaw<DepreciationScheduleDto>(
      `${getBaseUrl(tenantId)}/schedules/${id}`
    )
    return response.data
  },

  /**
   * Get all schedules for an asset
   */
  getSchedulesByAsset: async (
    tenantId: string,
    assetId: string
  ): Promise<DepreciationScheduleDto[]> => {
    const response = await apiClient.getRaw<DepreciationScheduleDto[]>(
      `${getBaseUrl(tenantId)}/by-asset/${assetId}`
    )
    return response.data
  },

  /**
   * Generate depreciation schedule for an asset
   */
  generateSchedule: async (
    tenantId: string,
    assetId: string
  ): Promise<DepreciationScheduleDto[]> => {
    const response = await apiClient.postRaw<DepreciationScheduleDto[]>(
      `${getBaseUrl(tenantId)}/generate/${assetId}`,
      {}
    )
    return response.data
  },

  /**
   * Run monthly depreciation for all active assets
   */
  runMonthlyDepreciation: async (
    tenantId: string,
    data: RunDepreciationRequest
  ): Promise<DepreciationScheduleDto[]> => {
    const response = await apiClient.postRaw<DepreciationScheduleDto[]>(
      `${getBaseUrl(tenantId)}/run`,
      data
    )
    return response.data
  },

  /**
   * Post a single depreciation schedule
   */
  postSchedule: async (
    tenantId: string,
    id: string
  ): Promise<DepreciationScheduleDto> => {
    const response = await apiClient.postRaw<DepreciationScheduleDto>(
      `${getBaseUrl(tenantId)}/schedules/${id}/post`,
      {}
    )
    return response.data
  },

  /**
   * Post all depreciation schedules for a fiscal period
   */
  postAllDepreciation: async (
    tenantId: string,
    fiscalPeriodId: string
  ): Promise<{ postedCount: number; message: string }> => {
    const response = await apiClient.postRaw<{ postedCount: number; message: string }>(
      `${getBaseUrl(tenantId)}/post-all/${fiscalPeriodId}`,
      {}
    )
    return response.data
  },

  /**
   * Reverse a posted depreciation schedule
   */
  reverseSchedule: async (
    tenantId: string,
    id: string
  ): Promise<DepreciationScheduleDto> => {
    const response = await apiClient.postRaw<DepreciationScheduleDto>(
      `${getBaseUrl(tenantId)}/schedules/${id}/reverse`,
      {}
    )
    return response.data
  },

  /**
   * Get depreciation summary for a fiscal period
   */
  getDepreciationSummary: async (
    tenantId: string,
    fiscalPeriodId: string
  ): Promise<DepreciationSummaryDto> => {
    const response = await apiClient.getRaw<DepreciationSummaryDto>(
      `${getBaseUrl(tenantId)}/summary/${fiscalPeriodId}`
    )
    return response.data
  },

  /**
   * Get depreciation forecast for an asset
   */
  getDepreciationForecast: async (
    tenantId: string,
    assetId: string,
    months?: number
  ): Promise<DepreciationForecastDto[]> => {
    const params = months ? `?months=${months}` : ""
    const response = await apiClient.getRaw<DepreciationForecastDto[]>(
      `${getBaseUrl(tenantId)}/forecast/${assetId}${params}`
    )
    return response.data
  },

  /**
   * Calculate depreciation amount for an asset
   */
  calculateDepreciation: async (
    tenantId: string,
    assetId: string,
    periodEndDate?: string
  ): Promise<{ depreciationAmount: number; assetId: string; periodEndDate: string }> => {
    const params = periodEndDate ? `?periodEndDate=${periodEndDate}` : ""
    const response = await apiClient.getRaw<{ depreciationAmount: number; assetId: string; periodEndDate: string }>(
      `${getBaseUrl(tenantId)}/calculate/${assetId}${params}`
    )
    return response.data
  },
}
