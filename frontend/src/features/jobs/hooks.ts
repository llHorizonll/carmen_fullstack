import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { jobsApi } from "./api"
import type {
  TriggerDepreciationRequest,
  TriggerRecurringVouchersRequest,
  TriggerAmortizationRequest,
  JobHistoryQueryParams,
} from "./types"
import { useTenantId } from "@/hooks/useTenantId"
import { toast } from "sonner"

const JOBS_QUERY_KEY = "jobs"

/**
 * Hook for fetching list of available jobs
 */
export function useJobs() {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [JOBS_QUERY_KEY, tenantId, "list"],
    queryFn: () => jobsApi.getJobs(tenantId),
  })
}

/**
 * Hook for triggering depreciation job
 */
export function useTriggerDepreciation() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TriggerDepreciationRequest) =>
      jobsApi.triggerDepreciation(tenantId, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [JOBS_QUERY_KEY, tenantId] })
      toast.success(result.message)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to trigger depreciation job")
    },
  })
}

/**
 * Hook for triggering post all depreciation job
 */
export function useTriggerPostAllDepreciation() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TriggerDepreciationRequest) =>
      jobsApi.triggerPostAllDepreciation(tenantId, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [JOBS_QUERY_KEY, tenantId] })
      toast.success(result.message)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to trigger post all depreciation job")
    },
  })
}

/**
 * Hook for triggering recurring vouchers job
 */
export function useTriggerRecurringVouchers() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TriggerRecurringVouchersRequest) =>
      jobsApi.triggerRecurringVouchers(tenantId, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [JOBS_QUERY_KEY, tenantId] })
      toast.success(result.message)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to trigger recurring vouchers job")
    },
  })
}

/**
 * Hook for triggering amortization job
 */
export function useTriggerAmortization() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TriggerAmortizationRequest) =>
      jobsApi.triggerAmortization(tenantId, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [JOBS_QUERY_KEY, tenantId] })
      toast.success(result.message)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to trigger amortization job")
    },
  })
}

/**
 * Hook for fetching job history
 */
export function useJobHistory(params?: JobHistoryQueryParams) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [JOBS_QUERY_KEY, tenantId, "history", params],
    queryFn: () => jobsApi.getJobHistory(tenantId, params),
  })
}

/**
 * Hook for fetching job status by ID
 */
export function useJobStatus(jobId: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [JOBS_QUERY_KEY, tenantId, "status", jobId],
    queryFn: () => jobsApi.getJobStatus(tenantId, jobId!),
    enabled: !!jobId,
    refetchInterval: 5000, // Refetch every 5 seconds while a job is running
  })
}
