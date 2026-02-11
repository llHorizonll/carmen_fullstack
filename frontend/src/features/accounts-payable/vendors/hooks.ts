import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { vendorsApi } from "./api"
import type {
  VendorQueryParams,
  CreateVendorRequest,
  UpdateVendorRequest,
} from "./types"
import { useTenantId } from "@/hooks/useTenantId"
import { toast } from "sonner"

const VENDORS_QUERY_KEY = "vendors"

/**
 * Hook for fetching paginated vendors list
 */
export function useVendors(params?: VendorQueryParams) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [VENDORS_QUERY_KEY, tenantId, params],
    queryFn: () => vendorsApi.getVendors(tenantId, params),
  })
}

/**
 * Hook for fetching a single vendor by ID
 */
export function useVendor(id: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [VENDORS_QUERY_KEY, tenantId, id],
    queryFn: () => vendorsApi.getVendor(tenantId, id!),
    enabled: !!id,
  })
}

/**
 * Hook for fetching vendor lookup list
 */
export function useVendorLookup(search?: string) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [VENDORS_QUERY_KEY, tenantId, "lookup", search],
    queryFn: () => vendorsApi.getVendorLookup(tenantId, search),
  })
}

/**
 * Hook for creating a new vendor
 */
export function useCreateVendor() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateVendorRequest) =>
      vendorsApi.createVendor(tenantId, data),
    onSuccess: (vendor) => {
      queryClient.invalidateQueries({ queryKey: [VENDORS_QUERY_KEY, tenantId] })
      toast.success(`Vendor "${vendor.vendorCode}" created successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create vendor")
    },
  })
}

/**
 * Hook for updating a vendor
 */
export function useUpdateVendor() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVendorRequest }) =>
      vendorsApi.updateVendor(tenantId, id, data),
    onSuccess: (vendor) => {
      queryClient.invalidateQueries({ queryKey: [VENDORS_QUERY_KEY, tenantId] })
      toast.success(`Vendor "${vendor.vendorCode}" updated successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update vendor")
    },
  })
}

/**
 * Hook for deleting a vendor
 */
export function useDeleteVendor() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => vendorsApi.deleteVendor(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VENDORS_QUERY_KEY, tenantId] })
      toast.success("Vendor deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete vendor")
    },
  })
}

/**
 * Hook for fetching vendor aging
 */
export function useVendorAging(vendorId: string | undefined, asOfDate?: string) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [VENDORS_QUERY_KEY, tenantId, vendorId, "aging", asOfDate],
    queryFn: () => vendorsApi.getVendorAging(tenantId, vendorId!, asOfDate),
    enabled: !!vendorId,
  })
}

/**
 * Hook for fetching aging report
 */
export function useAgingReport(asOfDate?: string) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [VENDORS_QUERY_KEY, tenantId, "aging-report", asOfDate],
    queryFn: () => vendorsApi.getAgingReport(tenantId, asOfDate),
  })
}

/**
 * Hook for checking vendor code uniqueness
 */
export function useCheckVendorCode(vendorCode: string, excludeId?: string) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [VENDORS_QUERY_KEY, tenantId, "check-code", vendorCode, excludeId],
    queryFn: () => vendorsApi.isVendorCodeUnique(tenantId, vendorCode, excludeId),
    enabled: vendorCode.length >= 2,
  })
}
