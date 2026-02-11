import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { paymentTermsApi } from "./api"
import type {
  PaymentTermQueryParams,
  CreatePaymentTermRequest,
  UpdatePaymentTermRequest,
} from "./types"
import { useTenantId } from "@/hooks/useTenantId"
import { toast } from "sonner"

const PAYMENT_TERMS_QUERY_KEY = "payment-terms"

/**
 * Hook for fetching paginated payment terms list
 */
export function usePaymentTerms(params?: PaymentTermQueryParams) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [PAYMENT_TERMS_QUERY_KEY, tenantId, params],
    queryFn: () => paymentTermsApi.getPaymentTerms(tenantId, params),
  })
}

/**
 * Hook for fetching a single payment term by ID
 */
export function usePaymentTerm(id: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [PAYMENT_TERMS_QUERY_KEY, tenantId, id],
    queryFn: () => paymentTermsApi.getPaymentTerm(tenantId, id!),
    enabled: !!id,
  })
}

/**
 * Hook for fetching a payment term by code
 */
export function usePaymentTermByCode(code: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [PAYMENT_TERMS_QUERY_KEY, tenantId, "code", code],
    queryFn: () => paymentTermsApi.getPaymentTermByCode(tenantId, code!),
    enabled: !!code,
  })
}

/**
 * Hook for fetching payment terms for lookup (dropdown)
 */
export function usePaymentTermLookup(isActive?: boolean) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [PAYMENT_TERMS_QUERY_KEY, tenantId, "lookup", isActive],
    queryFn: () => paymentTermsApi.getPaymentTermLookup(tenantId, isActive),
  })
}

/**
 * Hook for creating a new payment term
 */
export function useCreatePaymentTerm() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePaymentTermRequest) =>
      paymentTermsApi.createPaymentTerm(tenantId, data),
    onSuccess: (paymentTerm) => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_TERMS_QUERY_KEY, tenantId] })
      toast.success(`Payment term "${paymentTerm.termCode}" created successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create payment term")
    },
  })
}

/**
 * Hook for updating a payment term
 */
export function useUpdatePaymentTerm() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaymentTermRequest }) =>
      paymentTermsApi.updatePaymentTerm(tenantId, id, data),
    onSuccess: (paymentTerm) => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_TERMS_QUERY_KEY, tenantId] })
      toast.success(`Payment term "${paymentTerm.termCode}" updated successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update payment term")
    },
  })
}

/**
 * Hook for deleting a payment term
 */
export function useDeletePaymentTerm() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => paymentTermsApi.deletePaymentTerm(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENT_TERMS_QUERY_KEY, tenantId] })
      toast.success("Payment term deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete payment term")
    },
  })
}

/**
 * Hook for checking if term code exists
 */
export function useCheckTermCode(code: string | undefined, excludeId?: string) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [PAYMENT_TERMS_QUERY_KEY, tenantId, "check-code", code, excludeId],
    queryFn: () => paymentTermsApi.checkTermCode(tenantId, code!, excludeId),
    enabled: !!code && code.length > 0,
  })
}

/**
 * Hook for checking if payment term has transactions
 */
export function useCheckPaymentTermHasTransactions(id: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [PAYMENT_TERMS_QUERY_KEY, tenantId, id, "has-transactions"],
    queryFn: () => paymentTermsApi.checkHasTransactions(tenantId, id!),
    enabled: !!id,
  })
}
