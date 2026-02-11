import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fiscalPeriodsApi } from "./api"
import type {
  FiscalPeriodQueryParams,
  CreateFiscalYearRequest,
  ClosePeriodRequest,
  ReopenPeriodRequest,
} from "./types"
import { useTenantId } from "@/hooks/useTenantId"
import { toast } from "sonner"

const FISCAL_PERIODS_QUERY_KEY = "fiscal-periods"
const FISCAL_YEARS_QUERY_KEY = "fiscal-years"

// Fiscal Year Hooks

/**
 * Hook for fetching all fiscal years
 */
export function useFiscalYears() {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [FISCAL_YEARS_QUERY_KEY, tenantId],
    queryFn: () => fiscalPeriodsApi.getFiscalYears(tenantId),
  })
}

/**
 * Hook for fetching a single fiscal year by ID
 */
export function useFiscalYear(id: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [FISCAL_YEARS_QUERY_KEY, tenantId, id],
    queryFn: () => fiscalPeriodsApi.getFiscalYear(tenantId, id!),
    enabled: !!id,
  })
}

/**
 * Hook for creating a new fiscal year
 */
export function useCreateFiscalYear() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFiscalYearRequest) =>
      fiscalPeriodsApi.createFiscalYear(tenantId, data),
    onSuccess: (year) => {
      queryClient.invalidateQueries({ queryKey: [FISCAL_YEARS_QUERY_KEY, tenantId] })
      queryClient.invalidateQueries({ queryKey: [FISCAL_PERIODS_QUERY_KEY, tenantId] })
      toast.success(`Fiscal year "${year.name}" created successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create fiscal year")
    },
  })
}

// Fiscal Period Hooks

/**
 * Hook for fetching paginated fiscal periods
 */
export function useFiscalPeriods(params?: FiscalPeriodQueryParams) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [FISCAL_PERIODS_QUERY_KEY, tenantId, params],
    queryFn: () => fiscalPeriodsApi.getPeriods(tenantId, params),
  })
}

/**
 * Hook for fetching a single fiscal period by ID
 */
export function useFiscalPeriod(id: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [FISCAL_PERIODS_QUERY_KEY, tenantId, id],
    queryFn: () => fiscalPeriodsApi.getPeriod(tenantId, id!),
    enabled: !!id,
  })
}

/**
 * Hook for fetching periods for lookup (dropdown)
 */
export function useFiscalPeriodLookup(fiscalYearId?: string, openOnly?: boolean) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [FISCAL_PERIODS_QUERY_KEY, tenantId, "lookup", fiscalYearId, openOnly],
    queryFn: () => fiscalPeriodsApi.getPeriodLookup(tenantId, fiscalYearId, openOnly),
  })
}

/**
 * Hook for fetching current open period
 */
export function useCurrentPeriod() {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [FISCAL_PERIODS_QUERY_KEY, tenantId, "current"],
    queryFn: () => fiscalPeriodsApi.getCurrentPeriod(tenantId),
  })
}

// Period Closing Hooks

/**
 * Hook for validating period close
 */
export function usePeriodCloseValidation(id: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [FISCAL_PERIODS_QUERY_KEY, tenantId, id, "close-validation"],
    queryFn: () => fiscalPeriodsApi.validatePeriodClose(tenantId, id!),
    enabled: !!id,
  })
}

/**
 * Hook for fetching blocking vouchers
 */
export function useBlockingVouchers(id: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [FISCAL_PERIODS_QUERY_KEY, tenantId, id, "blocking-vouchers"],
    queryFn: () => fiscalPeriodsApi.getBlockingVouchers(tenantId, id!),
    enabled: !!id,
  })
}

/**
 * Hook for closing a fiscal period
 */
export function useClosePeriod() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ClosePeriodRequest }) =>
      fiscalPeriodsApi.closePeriod(tenantId, id, data),
    onSuccess: (period) => {
      queryClient.invalidateQueries({ queryKey: [FISCAL_PERIODS_QUERY_KEY, tenantId] })
      toast.success(`Period "${period.name}" closed successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to close period")
    },
  })
}

/**
 * Hook for reopening a fiscal period
 */
export function useReopenPeriod() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReopenPeriodRequest }) =>
      fiscalPeriodsApi.reopenPeriod(tenantId, id, data),
    onSuccess: (period) => {
      queryClient.invalidateQueries({ queryKey: [FISCAL_PERIODS_QUERY_KEY, tenantId] })
      toast.success(`Period "${period.name}" reopened successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reopen period")
    },
  })
}

/**
 * Hook for locking a fiscal period
 */
export function useLockPeriod() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => fiscalPeriodsApi.lockPeriod(tenantId, id),
    onSuccess: (period) => {
      queryClient.invalidateQueries({ queryKey: [FISCAL_PERIODS_QUERY_KEY, tenantId] })
      toast.success(`Period "${period.name}" locked permanently`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to lock period")
    },
  })
}
