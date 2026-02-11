import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { journalVouchersApi } from "./api"
import type {
  JournalVoucherQueryParams,
  CreateJournalVoucherRequest,
  UpdateJournalVoucherRequest,
  SubmitForApprovalRequest,
  ApproveVoucherRequest,
  RejectVoucherRequest,
  PostVoucherRequest,
  ReverseVoucherRequest,
  VoucherType,
} from "./types"
import { useTenantId } from "@/hooks/useTenantId"
import { toast } from "sonner"

const VOUCHERS_QUERY_KEY = "journal-vouchers"

/**
 * Hook for fetching paginated journal vouchers list
 */
export function useJournalVouchers(params?: JournalVoucherQueryParams) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [VOUCHERS_QUERY_KEY, tenantId, params],
    queryFn: () => journalVouchersApi.getVouchers(tenantId, params),
  })
}

/**
 * Hook for fetching a single journal voucher by ID
 */
export function useJournalVoucher(id: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [VOUCHERS_QUERY_KEY, tenantId, id],
    queryFn: () => journalVouchersApi.getVoucher(tenantId, id!),
    enabled: !!id,
  })
}

/**
 * Hook for creating a new journal voucher
 */
export function useCreateJournalVoucher() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateJournalVoucherRequest) =>
      journalVouchersApi.createVoucher(tenantId, data),
    onSuccess: (voucher) => {
      queryClient.invalidateQueries({ queryKey: [VOUCHERS_QUERY_KEY, tenantId] })
      toast.success(`Journal voucher "${voucher.voucherNumber}" created successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create journal voucher")
    },
  })
}

/**
 * Hook for updating a journal voucher
 */
export function useUpdateJournalVoucher() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJournalVoucherRequest }) =>
      journalVouchersApi.updateVoucher(tenantId, id, data),
    onSuccess: (voucher) => {
      queryClient.invalidateQueries({ queryKey: [VOUCHERS_QUERY_KEY, tenantId] })
      toast.success(`Journal voucher "${voucher.voucherNumber}" updated successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update journal voucher")
    },
  })
}

/**
 * Hook for deleting a journal voucher
 */
export function useDeleteJournalVoucher() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => journalVouchersApi.deleteVoucher(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VOUCHERS_QUERY_KEY, tenantId] })
      toast.success("Journal voucher deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete journal voucher")
    },
  })
}

/**
 * Hook for submitting voucher for approval
 */
export function useSubmitForApproval() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubmitForApprovalRequest }) =>
      journalVouchersApi.submitForApproval(tenantId, id, data),
    onSuccess: (voucher) => {
      queryClient.invalidateQueries({ queryKey: [VOUCHERS_QUERY_KEY, tenantId] })
      toast.success(`Voucher "${voucher.voucherNumber}" submitted for approval`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit for approval")
    },
  })
}

/**
 * Hook for approving a voucher
 */
export function useApproveVoucher() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveVoucherRequest }) =>
      journalVouchersApi.approveVoucher(tenantId, id, data),
    onSuccess: (voucher) => {
      queryClient.invalidateQueries({ queryKey: [VOUCHERS_QUERY_KEY, tenantId] })
      toast.success(`Voucher "${voucher.voucherNumber}" approved`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to approve voucher")
    },
  })
}

/**
 * Hook for rejecting a voucher
 */
export function useRejectVoucher() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectVoucherRequest }) =>
      journalVouchersApi.rejectVoucher(tenantId, id, data),
    onSuccess: (voucher) => {
      queryClient.invalidateQueries({ queryKey: [VOUCHERS_QUERY_KEY, tenantId] })
      toast.success(`Voucher "${voucher.voucherNumber}" rejected`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject voucher")
    },
  })
}

/**
 * Hook for posting a voucher
 */
export function usePostVoucher() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PostVoucherRequest }) =>
      journalVouchersApi.postVoucher(tenantId, id, data),
    onSuccess: (voucher) => {
      queryClient.invalidateQueries({ queryKey: [VOUCHERS_QUERY_KEY, tenantId] })
      toast.success(`Voucher "${voucher.voucherNumber}" posted successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to post voucher")
    },
  })
}

/**
 * Hook for reversing a voucher
 */
export function useReverseVoucher() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReverseVoucherRequest }) =>
      journalVouchersApi.reverseVoucher(tenantId, id, data),
    onSuccess: (voucher) => {
      queryClient.invalidateQueries({ queryKey: [VOUCHERS_QUERY_KEY, tenantId] })
      toast.success(`Reversal voucher "${voucher.voucherNumber}" created`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reverse voucher")
    },
  })
}

/**
 * Hook for voiding a voucher
 */
export function useVoidVoucher() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      journalVouchersApi.voidVoucher(tenantId, id, reason),
    onSuccess: (voucher) => {
      queryClient.invalidateQueries({ queryKey: [VOUCHERS_QUERY_KEY, tenantId] })
      toast.success(`Voucher "${voucher.voucherNumber}" voided`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to void voucher")
    },
  })
}

/**
 * Hook for getting next voucher number
 */
export function useNextVoucherNumber(voucherType?: VoucherType, date?: string) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [VOUCHERS_QUERY_KEY, tenantId, "next-number", voucherType, date],
    queryFn: () => journalVouchersApi.getNextVoucherNumber(tenantId, voucherType, date),
  })
}
