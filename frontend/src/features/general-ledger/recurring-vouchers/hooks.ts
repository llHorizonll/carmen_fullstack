import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { recurringVouchersApi } from "./api"
import type {
  RecurringVoucherQueryParams,
  CreateRecurringVoucherRequest,
  UpdateRecurringVoucherRequest,
} from "./types"
import { useTenantId } from "@/hooks/useTenantId"
import { toast } from "sonner"

const RECURRING_VOUCHERS_KEY = "recurring-vouchers"

export function useRecurringVouchers(params?: RecurringVoucherQueryParams) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [RECURRING_VOUCHERS_KEY, tenantId, params],
    queryFn: () => recurringVouchersApi.getRecurringVouchers(tenantId, params),
  })
}

export function useRecurringVoucher(id: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [RECURRING_VOUCHERS_KEY, tenantId, id],
    queryFn: () => recurringVouchersApi.getRecurringVoucher(tenantId, id!),
    enabled: !!id,
  })
}

export function useCreateRecurringVoucher() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRecurringVoucherRequest) =>
      recurringVouchersApi.createRecurringVoucher(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECURRING_VOUCHERS_KEY, tenantId] })
      toast.success("Recurring voucher created successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create recurring voucher")
    },
  })
}

export function useUpdateRecurringVoucher() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecurringVoucherRequest }) =>
      recurringVouchersApi.updateRecurringVoucher(tenantId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECURRING_VOUCHERS_KEY, tenantId] })
      toast.success("Recurring voucher updated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update recurring voucher")
    },
  })
}

export function useDeleteRecurringVoucher() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => recurringVouchersApi.deleteRecurringVoucher(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECURRING_VOUCHERS_KEY, tenantId] })
      toast.success("Recurring voucher deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete recurring voucher")
    },
  })
}

export function useActivateRecurringVoucher() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => recurringVouchersApi.activate(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECURRING_VOUCHERS_KEY, tenantId] })
      toast.success("Recurring voucher activated")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to activate recurring voucher")
    },
  })
}

export function useDeactivateRecurringVoucher() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => recurringVouchersApi.deactivate(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [RECURRING_VOUCHERS_KEY, tenantId] })
      toast.success("Recurring voucher deactivated")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to deactivate recurring voucher")
    },
  })
}
