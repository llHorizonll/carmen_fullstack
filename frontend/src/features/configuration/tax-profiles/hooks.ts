import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { taxProfilesApi } from "./api"
import type {
  TaxProfileQueryParams,
  CreateTaxProfileRequest,
  UpdateTaxProfileRequest,
} from "./types"
import { useTenantId } from "@/hooks/useTenantId"
import { toast } from "sonner"

const TAX_PROFILES_QUERY_KEY = "tax-profiles"

/**
 * Hook for fetching paginated tax profiles list
 */
export function useTaxProfiles(params?: TaxProfileQueryParams) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [TAX_PROFILES_QUERY_KEY, tenantId, params],
    queryFn: () => taxProfilesApi.getTaxProfiles(tenantId, params),
  })
}

/**
 * Hook for fetching a single tax profile by ID
 */
export function useTaxProfile(id: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [TAX_PROFILES_QUERY_KEY, tenantId, id],
    queryFn: () => taxProfilesApi.getTaxProfile(tenantId, id!),
    enabled: !!id,
  })
}

/**
 * Hook for fetching a tax profile by code
 */
export function useTaxProfileByCode(code: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [TAX_PROFILES_QUERY_KEY, tenantId, "code", code],
    queryFn: () => taxProfilesApi.getTaxProfileByCode(tenantId, code!),
    enabled: !!code,
  })
}

/**
 * Hook for fetching tax profiles for lookup (dropdown)
 */
export function useTaxProfileLookup(isActive?: boolean) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [TAX_PROFILES_QUERY_KEY, tenantId, "lookup", isActive],
    queryFn: () => taxProfilesApi.getTaxProfileLookup(tenantId, isActive),
  })
}

/**
 * Hook for creating a new tax profile
 */
export function useCreateTaxProfile() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTaxProfileRequest) =>
      taxProfilesApi.createTaxProfile(tenantId, data),
    onSuccess: (taxProfile) => {
      queryClient.invalidateQueries({ queryKey: [TAX_PROFILES_QUERY_KEY, tenantId] })
      toast.success(`Tax profile "${taxProfile.taxCode}" created successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create tax profile")
    },
  })
}

/**
 * Hook for updating a tax profile
 */
export function useUpdateTaxProfile() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaxProfileRequest }) =>
      taxProfilesApi.updateTaxProfile(tenantId, id, data),
    onSuccess: (taxProfile) => {
      queryClient.invalidateQueries({ queryKey: [TAX_PROFILES_QUERY_KEY, tenantId] })
      toast.success(`Tax profile "${taxProfile.taxCode}" updated successfully`)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update tax profile")
    },
  })
}

/**
 * Hook for deleting a tax profile
 */
export function useDeleteTaxProfile() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => taxProfilesApi.deleteTaxProfile(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TAX_PROFILES_QUERY_KEY, tenantId] })
      toast.success("Tax profile deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete tax profile")
    },
  })
}

/**
 * Hook for checking if tax code exists
 */
export function useCheckTaxCode(code: string | undefined, excludeId?: string) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [TAX_PROFILES_QUERY_KEY, tenantId, "check-code", code, excludeId],
    queryFn: () => taxProfilesApi.checkTaxCode(tenantId, code!, excludeId),
    enabled: !!code && code.length > 0,
  })
}

/**
 * Hook for checking if tax profile has transactions
 */
export function useCheckTaxProfileHasTransactions(id: string | undefined) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [TAX_PROFILES_QUERY_KEY, tenantId, id, "has-transactions"],
    queryFn: () => taxProfilesApi.checkHasTransactions(tenantId, id!),
    enabled: !!id,
  })
}
