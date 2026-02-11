import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { arInvoicesApi } from "./api"
import type {
  ArInvoiceQueryParams,
  CreateArInvoiceRequest,
  UpdateArInvoiceRequest,
  SubmitArInvoiceRequest,
  ApproveArInvoiceRequest,
  RejectArInvoiceRequest,
  VoidArInvoiceRequest,
  CalculateTaxRequest,
} from "./types"
import { useTenantId } from "@/hooks/useTenantId"
import { toast } from "sonner"

const INVOICES_QUERY_KEY = "ar-invoices"

/**
 * Hook for fetching paginated AR invoices list
 */
export function useArInvoices(params?: ArInvoiceQueryParams) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [INVOICES_QUERY_KEY, tenantId, params],
    queryFn: () => arInvoicesApi.getInvoices(tenantId, params),
  })
}

/**
 * Hook for fetching a single AR invoice by ID
 */
export function useArInvoice(id: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [INVOICES_QUERY_KEY, tenantId, id],
    queryFn: () => arInvoicesApi.getInvoice(tenantId, id!),
    enabled: !!id,
  })
}

/**
 * Hook for fetching unpaid invoices for a customer
 */
export function useUnpaidArInvoices(customerId: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [INVOICES_QUERY_KEY, tenantId, "unpaid", customerId],
    queryFn: () => arInvoicesApi.getUnpaidInvoices(tenantId, customerId!),
    enabled: !!customerId,
  })
}

/**
 * Hook for creating a new AR invoice
 */
export function useCreateArInvoice() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateArInvoiceRequest) =>
      arInvoicesApi.createInvoice(tenantId, data),
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
 * Hook for updating an AR invoice
 */
export function useUpdateArInvoice() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateArInvoiceRequest }) =>
      arInvoicesApi.updateInvoice(tenantId, id, data),
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
 * Hook for deleting an AR invoice
 */
export function useDeleteArInvoice() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => arInvoicesApi.deleteInvoice(tenantId, id),
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
export function useSubmitArInvoiceForApproval() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubmitArInvoiceRequest }) =>
      arInvoicesApi.submitForApproval(tenantId, id, data),
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
export function useApproveArInvoice() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveArInvoiceRequest }) =>
      arInvoicesApi.approveInvoice(tenantId, id, data),
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
export function useRejectArInvoice() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectArInvoiceRequest }) =>
      arInvoicesApi.rejectInvoice(tenantId, id, data),
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
export function useVoidArInvoice() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VoidArInvoiceRequest }) =>
      arInvoicesApi.voidInvoice(tenantId, id, data),
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
export function useCalculateArTax() {
  const tenantId = useTenantId()

  return useMutation({
    mutationFn: (data: CalculateTaxRequest) =>
      arInvoicesApi.calculateTax(tenantId, data),
    onError: (error: Error) => {
      toast.error(error.message || "Failed to calculate taxes")
    },
  })
}

/**
 * Hook for getting next invoice number
 */
export function useNextArInvoiceNumber(date?: string) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [INVOICES_QUERY_KEY, tenantId, "next-number", date],
    queryFn: () => arInvoicesApi.getNextInvoiceNumber(tenantId, date),
  })
}
