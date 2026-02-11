import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { tenantSettingsApi } from "./api"
import type { UpdateTenantSettingsRequest } from "./types"
import { toast } from "sonner"

const TENANT_SETTINGS_QUERY_KEY = "tenant-settings"

/**
 * Hook for fetching tenant settings
 */
export function useTenantSettings() {
  return useQuery({
    queryKey: [TENANT_SETTINGS_QUERY_KEY],
    queryFn: () => tenantSettingsApi.getTenantSettings(),
  })
}

/**
 * Hook for updating tenant settings
 */
export function useUpdateTenantSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateTenantSettingsRequest) =>
      tenantSettingsApi.updateTenantSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TENANT_SETTINGS_QUERY_KEY] })
      toast.success("Company settings updated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update company settings")
    },
  })
}
