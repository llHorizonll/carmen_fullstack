import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apPaymentsApi } from "./api"
import type {
  ApPaymentQueryParams,
  CreateApPaymentRequest,
  UpdateApPaymentRequest,
  ApproveApPaymentRequest,
  PostApPaymentRequest,
  VoidApPaymentRequest,
  AutoAllocateRequest,
} from "./types"
import { useTenantId } from "@/hooks/useTenantId"
import { toast } from "sonner"

const PAYMENTS_QUERY_KEY = "ap-payments"

/**
 * Hook for fetching paginated AP payments list
 */
export function useApPayments(params?: ApPaymentQueryParams) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [PAYMENTS_QUERY_KEY, tenantId, params],
    queryFn: () => apPaymentsApi.getPayments(tenantId, params),
  })
}

/**
 * Hook for fetching a single AP payment by ID
 */
export function useApPayment(id: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [PAYMENTS_QUERY_KEY, tenantId, id],
    queryFn: () => apPaymentsApi.getPayment(tenantId, id!),
    enabled: !!id,
  })
}

/**
 * Hook for creating a new AP payment
 */
export function useCreateApPayment() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateApPaymentRequest) =>
      apPaymentsApi.createPayment(tenantId, data),
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_QUERY_KEY, tenantId] })
      toast.success(`Payment "${payment.paymentNumber}" created successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create payment")
    },
  })
}

/**
 * Hook for updating an AP payment
 */
export function useUpdateApPayment() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApPaymentRequest }) =>
      apPaymentsApi.updatePayment(tenantId, id, data),
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_QUERY_KEY, tenantId] })
      toast.success(`Payment "${payment.paymentNumber}" updated successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update payment")
    },
  })
}

/**
 * Hook for deleting an AP payment
 */
export function useDeleteApPayment() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apPaymentsApi.deletePayment(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_QUERY_KEY, tenantId] })
      toast.success("Payment deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete payment")
    },
  })
}

/**
 * Hook for approving a payment
 */
export function useApprovePayment() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveApPaymentRequest }) =>
      apPaymentsApi.approvePayment(tenantId, id, data),
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_QUERY_KEY, tenantId] })
      toast.success(`Payment "${payment.paymentNumber}" approved`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to approve payment")
    },
  })
}

/**
 * Hook for posting a payment
 */
export function usePostPayment() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PostApPaymentRequest }) =>
      apPaymentsApi.postPayment(tenantId, id, data),
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_QUERY_KEY, tenantId] })
      queryClient.invalidateQueries({ queryKey: ["ap-invoices"] })
      queryClient.invalidateQueries({ queryKey: ["vendors"] })
      toast.success(`Payment "${payment.paymentNumber}" posted successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to post payment")
    },
  })
}

/**
 * Hook for voiding a payment
 */
export function useVoidPayment() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VoidApPaymentRequest }) =>
      apPaymentsApi.voidPayment(tenantId, id, data),
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_QUERY_KEY, tenantId] })
      queryClient.invalidateQueries({ queryKey: ["ap-invoices"] })
      queryClient.invalidateQueries({ queryKey: ["vendors"] })
      toast.success(`Payment "${payment.paymentNumber}" voided`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to void payment")
    },
  })
}

/**
 * Hook for auto-allocating payment
 */
export function useAutoAllocate() {
  const tenantId = useTenantId()

  return useMutation({
    mutationFn: (data: AutoAllocateRequest) =>
      apPaymentsApi.autoAllocate(tenantId, data),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to auto-allocate payment")
    },
  })
}

/**
 * Hook for getting next payment number
 */
export function useNextPaymentNumber(date?: string) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [PAYMENTS_QUERY_KEY, tenantId, "next-number", date],
    queryFn: () => apPaymentsApi.getNextPaymentNumber(tenantId, date),
  })
}

/**
 * Hook for calculating exchange gain/loss
 */
export function useExchangeGainLoss(
  invoiceId: string | undefined,
  allocationAmount: number,
  paymentExchangeRate: number
) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [PAYMENTS_QUERY_KEY, tenantId, "exchange-gain-loss", invoiceId, allocationAmount, paymentExchangeRate],
    queryFn: () => apPaymentsApi.calculateExchangeGainLoss(
      tenantId,
      invoiceId!,
      allocationAmount,
      paymentExchangeRate
    ),
    enabled: !!invoiceId && allocationAmount > 0 && paymentExchangeRate > 0,
  })
}
