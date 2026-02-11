import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { customersApi } from "./api"
import type {
  CustomerQueryParams,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "./types"
import { useTenantId } from "@/hooks/useTenantId"
import { toast } from "sonner"

const CUSTOMERS_QUERY_KEY = "customers"

/**
 * Hook for fetching paginated customers list
 */
export function useCustomers(params?: CustomerQueryParams) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEY, tenantId, params],
    queryFn: () => customersApi.getCustomers(tenantId, params),
  })
}

/**
 * Hook for fetching a single customer by ID
 */
export function useCustomer(id: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEY, tenantId, id],
    queryFn: () => customersApi.getCustomer(tenantId, id!),
    enabled: !!id,
  })
}

/**
 * Hook for fetching customer lookup list
 */
export function useCustomerLookup(search?: string) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEY, tenantId, "lookup", search],
    queryFn: () => customersApi.getCustomerLookup(tenantId, search),
  })
}

/**
 * Hook for creating a new customer
 */
export function useCreateCustomer() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCustomerRequest) =>
      customersApi.createCustomer(tenantId, data),
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY, tenantId] })
      toast.success(`Customer "${customer.customerCode}" created successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create customer")
    },
  })
}

/**
 * Hook for updating a customer
 */
export function useUpdateCustomer() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerRequest }) =>
      customersApi.updateCustomer(tenantId, id, data),
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY, tenantId] })
      toast.success(`Customer "${customer.customerCode}" updated successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update customer")
    },
  })
}

/**
 * Hook for deleting a customer
 */
export function useDeleteCustomer() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => customersApi.deleteCustomer(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_QUERY_KEY, tenantId] })
      toast.success("Customer deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete customer")
    },
  })
}

/**
 * Hook for fetching customer aging
 */
export function useCustomerAging(customerId: string | undefined, asOfDate?: string) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEY, tenantId, customerId, "aging", asOfDate],
    queryFn: () => customersApi.getCustomerAging(tenantId, customerId!, asOfDate),
    enabled: !!customerId,
  })
}

/**
 * Hook for fetching aging report
 */
export function useAgingReport(asOfDate?: string) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEY, tenantId, "aging-report", asOfDate],
    queryFn: () => customersApi.getAgingReport(tenantId, asOfDate),
  })
}

/**
 * Hook for checking customer code uniqueness
 */
export function useCheckCustomerCode(customerCode: string, excludeId?: string) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEY, tenantId, "check-code", customerCode, excludeId],
    queryFn: () => customersApi.isCustomerCodeUnique(tenantId, customerCode, excludeId),
    enabled: customerCode.length >= 2,
  })
}
