import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { depreciationApi } from "./api"
import type {
  DepreciationQueryParams,
  RunDepreciationRequest,
} from "./types"
import { useTenantId } from "@/hooks/useTenantId"
import { toast } from "sonner"

const DEPRECIATION_QUERY_KEY = "depreciation"
const ASSETS_QUERY_KEY = "assets"

/**
 * Hook for fetching paginated depreciation schedules list
 */
export function useDepreciationSchedules(params?: DepreciationQueryParams) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [DEPRECIATION_QUERY_KEY, tenantId, "schedules", params],
    queryFn: () => depreciationApi.getSchedules(tenantId, params),
  })
}

/**
 * Hook for fetching a single depreciation schedule by ID
 */
export function useDepreciationSchedule(id: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [DEPRECIATION_QUERY_KEY, tenantId, "schedule", id],
    queryFn: () => depreciationApi.getSchedule(tenantId, id!),
    enabled: !!id,
  })
}

/**
 * Hook for fetching depreciation schedules by asset
 */
export function useDepreciationSchedulesByAsset(assetId: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [DEPRECIATION_QUERY_KEY, tenantId, "by-asset", assetId],
    queryFn: () => depreciationApi.getSchedulesByAsset(tenantId, assetId!),
    enabled: !!assetId,
  })
}

/**
 * Hook for generating depreciation schedule
 */
export function useGenerateDepreciationSchedule() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assetId: string) =>
      depreciationApi.generateSchedule(tenantId, assetId),
    onSuccess: (schedules) => {
      queryClient.invalidateQueries({ queryKey: [DEPRECIATION_QUERY_KEY, tenantId] })
      queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY, tenantId] })
      toast.success(`Generated ${schedules.length} depreciation schedule entries`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate depreciation schedule")
    },
  })
}

/**
 * Hook for running monthly depreciation
 */
export function useRunMonthlyDepreciation() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RunDepreciationRequest) =>
      depreciationApi.runMonthlyDepreciation(tenantId, data),
    onSuccess: (schedules) => {
      queryClient.invalidateQueries({ queryKey: [DEPRECIATION_QUERY_KEY, tenantId] })
      queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY, tenantId] })
      toast.success(`Monthly depreciation run completed with ${schedules.length} entries`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to run monthly depreciation")
    },
  })
}

/**
 * Hook for posting a depreciation schedule
 */
export function usePostDepreciationSchedule() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      depreciationApi.postSchedule(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEPRECIATION_QUERY_KEY, tenantId] })
      queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY, tenantId] })
      toast.success("Depreciation schedule posted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to post depreciation schedule")
    },
  })
}

/**
 * Hook for posting all depreciation schedules for a period
 */
export function usePostAllDepreciation() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (fiscalPeriodId: string) =>
      depreciationApi.postAllDepreciation(tenantId, fiscalPeriodId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [DEPRECIATION_QUERY_KEY, tenantId] })
      queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY, tenantId] })
      toast.success(result.message)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to post all depreciation")
    },
  })
}

/**
 * Hook for reversing a depreciation schedule
 */
export function useReverseDepreciationSchedule() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      depreciationApi.reverseSchedule(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEPRECIATION_QUERY_KEY, tenantId] })
      queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY, tenantId] })
      toast.success("Depreciation schedule reversed successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reverse depreciation schedule")
    },
  })
}

/**
 * Hook for fetching depreciation summary
 */
export function useDepreciationSummary(fiscalPeriodId: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [DEPRECIATION_QUERY_KEY, tenantId, "summary", fiscalPeriodId],
    queryFn: () => depreciationApi.getDepreciationSummary(tenantId, fiscalPeriodId!),
    enabled: !!fiscalPeriodId,
  })
}

/**
 * Hook for fetching depreciation forecast
 */
export function useDepreciationForecast(assetId: string | undefined, months?: number) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [DEPRECIATION_QUERY_KEY, tenantId, "forecast", assetId, months],
    queryFn: () => depreciationApi.getDepreciationForecast(tenantId, assetId!, months),
    enabled: !!assetId,
  })
}

/**
 * Hook for calculating depreciation amount
 */
export function useCalculateDepreciation(assetId: string | undefined, periodEndDate?: string) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [DEPRECIATION_QUERY_KEY, tenantId, "calculate", assetId, periodEndDate],
    queryFn: () => depreciationApi.calculateDepreciation(tenantId, assetId!, periodEndDate),
    enabled: !!assetId,
  })
}

// Aliases for convenience
export const useRunDepreciation = useRunMonthlyDepreciation
export const usePostDepreciation = usePostDepreciationSchedule
export const useReverseDepreciation = useReverseDepreciationSchedule
