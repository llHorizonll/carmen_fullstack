import { apiClient } from "@/lib/api-client"
import type {
  JobStatusDto,
  JobHistoryDto,
  TriggerDepreciationRequest,
  TriggerRecurringVouchersRequest,
  TriggerAmortizationRequest,
  JobTriggerResponse,
  JobHistoryQueryParams,
} from "./types"

const getBaseUrl = (tenantId: string) => `/v1/tenants/${tenantId}/jobs`

export const jobsApi = {
  /**
   * Get list of available jobs and their status
   */
  getJobs: async (tenantId: string): Promise<JobStatusDto[]> => {
    const response = await apiClient.getRaw<JobStatusDto[]>(getBaseUrl(tenantId))
    return response.data
  },

  /**
   * Trigger depreciation job manually
   */
  triggerDepreciation: async (
    tenantId: string,
    data: TriggerDepreciationRequest
  ): Promise<JobTriggerResponse> => {
    const response = await apiClient.postRaw<JobTriggerResponse>(
      `${getBaseUrl(tenantId)}/depreciation/run`,
      data
    )
    return response.data
  },

  /**
   * Trigger post all depreciation job
   */
  triggerPostAllDepreciation: async (
    tenantId: string,
    data: TriggerDepreciationRequest
  ): Promise<JobTriggerResponse> => {
    const response = await apiClient.postRaw<JobTriggerResponse>(
      `${getBaseUrl(tenantId)}/depreciation/post-all`,
      data
    )
    return response.data
  },

  /**
   * Trigger recurring voucher processing job
   */
  triggerRecurringVouchers: async (
    tenantId: string,
    data: TriggerRecurringVouchersRequest
  ): Promise<JobTriggerResponse> => {
    const response = await apiClient.postRaw<JobTriggerResponse>(
      `${getBaseUrl(tenantId)}/recurring-vouchers/run`,
      data
    )
    return response.data
  },

  /**
   * Trigger amortization job manually
   */
  triggerAmortization: async (
    tenantId: string,
    data: TriggerAmortizationRequest
  ): Promise<JobTriggerResponse> => {
    const response = await apiClient.postRaw<JobTriggerResponse>(
      `${getBaseUrl(tenantId)}/amortization/run`,
      data
    )
    return response.data
  },

  /**
   * Get job execution history
   */
  getJobHistory: async (
    tenantId: string,
    params?: JobHistoryQueryParams
  ): Promise<JobHistoryDto[]> => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set("page", String(params.page))
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize))

    const queryString = searchParams.toString()
    const url = `${getBaseUrl(tenantId)}/history${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.getRaw<JobHistoryDto[]>(url)
    return response.data
  },

  /**
   * Get status of a specific job by ID
   */
  getJobStatus: async (
    tenantId: string,
    jobId: string
  ): Promise<{ jobId: string; state: string; createdAt: string; job: string }> => {
    const response = await apiClient.getRaw<{
      jobId: string
      state: string
      createdAt: string
      job: string
    }>(`${getBaseUrl(tenantId)}/${jobId}/status`)
    return response.data
  },
}
