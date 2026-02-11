import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { arReceiptsApi } from "./api"
import type {
  ArReceiptQueryParams,
  CreateArReceiptRequest,
  UpdateArReceiptRequest,
  ApproveArReceiptRequest,
  PostArReceiptRequest,
  VoidArReceiptRequest,
  ArAutoAllocateRequest,
} from "./types"
import { useTenantId } from "@/hooks/useTenantId"
import { toast } from "sonner"

const RECEIPTS_QUERY_KEY = "ar-receipts"

/**
 * Hook for fetching paginated AR receipts list
 */
export function useArReceipts(params?: ArReceiptQueryParams) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [RECEIPTS_QUERY_KEY, tenantId, params],
    queryFn: () => arReceiptsApi.getReceipts(tenantId, params),
  })
}

/**
 * Hook for fetching a single AR receipt by ID
 */
export function useArReceipt(id: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [RECEIPTS_QUERY_KEY, tenantId, id],
    queryFn: () => arReceiptsApi.getReceipt(tenantId, id!),
    enabled: !!id,
  })
}

/**
 * Hook for creating a new AR receipt
 */
export function useCreateArReceipt() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateArReceiptRequest) =>
      arReceiptsApi.createReceipt(tenantId, data),
    onSuccess: (receipt) => {
      queryClient.invalidateQueries({ queryKey: [RECEIPTS_QUERY_KEY, tenantId] })
      toast.success(`Receipt "${receipt.receiptNumber}" created successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create receipt")
    },
  })
}

/**
 * Hook for updating an AR receipt
 */
export function useUpdateArReceipt() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateArReceiptRequest }) =>
      arReceiptsApi.updateReceipt(tenantId, id, data),
    onSuccess: (receipt) => {
      queryClient.invalidateQueries({ queryKey: [RECEIPTS_QUERY_KEY, tenantId] })
      toast.success(`Receipt "${receipt.receiptNumber}" updated successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update receipt")
    },
  })
}

/**
 * Hook for deleting an AR receipt
 */
export function useDeleteArReceipt() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => arReceiptsApi.deleteReceipt(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECEIPTS_QUERY_KEY, tenantId] })
      toast.success("Receipt deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete receipt")
    },
  })
}

/**
 * Hook for approving a receipt
 */
export function useApproveArReceipt() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveArReceiptRequest }) =>
      arReceiptsApi.approveReceipt(tenantId, id, data),
    onSuccess: (receipt) => {
      queryClient.invalidateQueries({ queryKey: [RECEIPTS_QUERY_KEY, tenantId] })
      toast.success(`Receipt "${receipt.receiptNumber}" approved`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to approve receipt")
    },
  })
}

/**
 * Hook for posting a receipt
 */
export function usePostArReceipt() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PostArReceiptRequest }) =>
      arReceiptsApi.postReceipt(tenantId, id, data),
    onSuccess: (receipt) => {
      queryClient.invalidateQueries({ queryKey: [RECEIPTS_QUERY_KEY, tenantId] })
      queryClient.invalidateQueries({ queryKey: ["ar-invoices"] })
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      toast.success(`Receipt "${receipt.receiptNumber}" posted successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to post receipt")
    },
  })
}

/**
 * Hook for voiding a receipt
 */
export function useVoidArReceipt() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VoidArReceiptRequest }) =>
      arReceiptsApi.voidReceipt(tenantId, id, data),
    onSuccess: (receipt) => {
      queryClient.invalidateQueries({ queryKey: [RECEIPTS_QUERY_KEY, tenantId] })
      queryClient.invalidateQueries({ queryKey: ["ar-invoices"] })
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      toast.success(`Receipt "${receipt.receiptNumber}" voided`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to void receipt")
    },
  })
}

/**
 * Hook for auto-allocating receipt
 */
export function useArAutoAllocate() {
  const tenantId = useTenantId()

  return useMutation({
    mutationFn: (data: ArAutoAllocateRequest) =>
      arReceiptsApi.autoAllocate(tenantId, data),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to auto-allocate receipt")
    },
  })
}

/**
 * Hook for getting next receipt number
 */
export function useNextArReceiptNumber(date?: string) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [RECEIPTS_QUERY_KEY, tenantId, "next-number", date],
    queryFn: () => arReceiptsApi.getNextReceiptNumber(tenantId, date),
  })
}

/**
 * Hook for calculating exchange gain/loss
 */
export function useArExchangeGainLoss(
  invoiceId: string | undefined,
  allocationAmount: number,
  receiptExchangeRate: number
) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [RECEIPTS_QUERY_KEY, tenantId, "exchange-gain-loss", invoiceId, allocationAmount, receiptExchangeRate],
    queryFn: () => arReceiptsApi.calculateExchangeGainLoss(
      tenantId,
      invoiceId!,
      allocationAmount,
      receiptExchangeRate
    ),
    enabled: !!invoiceId && allocationAmount > 0 && receiptExchangeRate > 0,
  })
}
