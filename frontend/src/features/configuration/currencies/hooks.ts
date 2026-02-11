import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { currenciesApi } from "./api"
import type {
  CurrencyQueryParams,
  CreateCurrencyRequest,
  UpdateCurrencyRequest,
} from "./types"
import { useTenantId } from "@/hooks/useTenantId"
import { toast } from "sonner"

const CURRENCIES_QUERY_KEY = "currencies"

/**
 * Hook for fetching paginated currencies list
 */
export function useCurrencies(params?: CurrencyQueryParams) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [CURRENCIES_QUERY_KEY, tenantId, params],
    queryFn: () => currenciesApi.getCurrencies(tenantId, params),
  })
}

/**
 * Hook for fetching a single currency by ID
 */
export function useCurrency(id: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [CURRENCIES_QUERY_KEY, tenantId, id],
    queryFn: () => currenciesApi.getCurrency(tenantId, id!),
    enabled: !!id,
  })
}

/**
 * Hook for fetching a currency by code
 */
export function useCurrencyByCode(code: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [CURRENCIES_QUERY_KEY, tenantId, "code", code],
    queryFn: () => currenciesApi.getCurrencyByCode(tenantId, code!),
    enabled: !!code,
  })
}

/**
 * Hook for fetching currencies for lookup (dropdown)
 */
export function useCurrencyLookup(isActive?: boolean) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [CURRENCIES_QUERY_KEY, tenantId, "lookup", isActive],
    queryFn: () => currenciesApi.getCurrencyLookup(tenantId, isActive),
  })
}

/**
 * Hook for creating a new currency
 */
export function useCreateCurrency() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCurrencyRequest) =>
      currenciesApi.createCurrency(tenantId, data),
    onSuccess: (currency) => {
      queryClient.invalidateQueries({ queryKey: [CURRENCIES_QUERY_KEY, tenantId] })
      toast.success(`Currency "${currency.currencyCode}" created successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create currency")
    },
  })
}

/**
 * Hook for updating a currency
 */
export function useUpdateCurrency() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCurrencyRequest }) =>
      currenciesApi.updateCurrency(tenantId, id, data),
    onSuccess: (currency) => {
      queryClient.invalidateQueries({ queryKey: [CURRENCIES_QUERY_KEY, tenantId] })
      toast.success(`Currency "${currency.currencyCode}" updated successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update currency")
    },
  })
}

/**
 * Hook for deleting a currency
 */
export function useDeleteCurrency() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => currenciesApi.deleteCurrency(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CURRENCIES_QUERY_KEY, tenantId] })
      toast.success("Currency deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete currency")
    },
  })
}

/**
 * Hook for checking if currency code exists
 */
export function useCheckCurrencyCode(code: string | undefined, excludeId?: string) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [CURRENCIES_QUERY_KEY, tenantId, "check-code", code, excludeId],
    queryFn: () => currenciesApi.checkCurrencyCode(tenantId, code!, excludeId),
    enabled: !!code && code.length > 0,
  })
}

/**
 * Hook for checking if currency has transactions
 */
export function useCheckCurrencyHasTransactions(id: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [CURRENCIES_QUERY_KEY, tenantId, id, "has-transactions"],
    queryFn: () => currenciesApi.checkHasTransactions(tenantId, id!),
    enabled: !!id,
  })
}

/**
 * Hook for updating exchange rate
 */
export function useUpdateExchangeRate() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, exchangeRate }: { id: string; exchangeRate: number }) =>
      currenciesApi.updateExchangeRate(tenantId, id, exchangeRate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CURRENCIES_QUERY_KEY, tenantId] })
      toast.success("Exchange rate updated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update exchange rate")
    },
  })
}
