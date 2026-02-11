import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apInvoicesApi } from "./api"
import type {
  ApInvoiceQueryParams,
  CreateApInvoiceRequest,
  UpdateApInvoiceRequest,
  SubmitApInvoiceRequest,
  ApproveApInvoiceRequest,
  RejectApInvoiceRequest,
  VoidApInvoiceRequest,
  CalculateTaxRequest,
} from "./types"
import { useTenantId } from "@/hooks/useTenantId"
import { toast } from "sonner"

const INVOICES_QUERY_KEY = "ap-invoices"

/**
 * Hook for fetching paginated AP invoices list
 */
export function useApInvoices(params?: ApInvoiceQueryParams) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [INVOICES_QUERY_KEY, tenantId, params],
    queryFn: () => apInvoicesApi.getInvoices(tenantId, params),
  })
}

/**
 * Hook for fetching a single AP invoice by ID
 */
export function useApInvoice(id: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [INVOICES_QUERY_KEY, tenantId, id],
    queryFn: () => apInvoicesApi.getInvoice(tenantId, id!),
    enabled: !!id,
  })
}

/**
 * Hook for fetching unpaid invoices for a vendor
 */
export function useUnpaidInvoices(vendorId: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [INVOICES_QUERY_KEY, tenantId, "unpaid", vendorId],
    queryFn: () => apInvoicesApi.getUnpaidInvoices(tenantId, vendorId!),
    enabled: !!vendorId,
  })
}

/**
 * Hook for creating a new AP invoice
 */
export function useCreateApInvoice() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateApInvoiceRequest) =>
      apInvoicesApi.createInvoice(tenantId, data),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY, tenantId] })
      toast.success(`Invoice "${invoice.invoiceNumber}" created successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create invoice")
    },
  })
}

/**
 * Hook for updating an AP invoice
 */
export function useUpdateApInvoice() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApInvoiceRequest }) =>
      apInvoicesApi.updateInvoice(tenantId, id, data),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY, tenantId] })
      toast.success(`Invoice "${invoice.invoiceNumber}" updated successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update invoice")
    },
  })
}

/**
 * Hook for deleting an AP invoice
 */
export function useDeleteApInvoice() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apInvoicesApi.deleteInvoice(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY, tenantId] })
      toast.success("Invoice deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete invoice")
    },
  })
}

/**
 * Hook for submitting invoice for approval
 */
export function useSubmitInvoiceForApproval() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubmitApInvoiceRequest }) =>
      apInvoicesApi.submitForApproval(tenantId, id, data),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY, tenantId] })
      toast.success(`Invoice "${invoice.invoiceNumber}" submitted for approval`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit for approval")
    },
  })
}

/**
 * Hook for approving an invoice
 */
export function useApproveInvoice() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveApInvoiceRequest }) =>
      apInvoicesApi.approveInvoice(tenantId, id, data),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY, tenantId] })
      toast.success(`Invoice "${invoice.invoiceNumber}" approved`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to approve invoice")
    },
  })
}

/**
 * Hook for rejecting an invoice
 */
export function useRejectInvoice() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectApInvoiceRequest }) =>
      apInvoicesApi.rejectInvoice(tenantId, id, data),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY, tenantId] })
      toast.success(`Invoice "${invoice.invoiceNumber}" rejected`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject invoice")
    },
  })
}

/**
 * Hook for voiding an invoice
 */
export function useVoidInvoice() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VoidApInvoiceRequest }) =>
      apInvoicesApi.voidInvoice(tenantId, id, data),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY, tenantId] })
      toast.success(`Invoice "${invoice.invoiceNumber}" voided`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to void invoice")
    },
  })
}

/**
 * Hook for calculating taxes
 */
export function useCalculateTax() {
  const tenantId = useTenantId()

  return useMutation({
    mutationFn: (data: CalculateTaxRequest) =>
      apInvoicesApi.calculateTax(tenantId, data),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to calculate taxes")
    },
  })
}

/**
 * Hook for checking credit limit
 */
export function useCreditLimitCheck(vendorId: string | undefined, invoiceAmount: number) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [INVOICES_QUERY_KEY, tenantId, "credit-limit", vendorId, invoiceAmount],
    queryFn: () => apInvoicesApi.checkCreditLimit(tenantId, vendorId!, invoiceAmount),
    enabled: !!vendorId && invoiceAmount > 0,
  })
}

/**
 * Hook for getting next invoice number
 */
export function useNextInvoiceNumber(date?: string) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [INVOICES_QUERY_KEY, tenantId, "next-number", date],
    queryFn: () => apInvoicesApi.getNextInvoiceNumber(tenantId, date),
  })
}
