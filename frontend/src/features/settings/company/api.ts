import { apiClient } from "@/lib/api-client"
import type { TenantSettingsDto, UpdateTenantSettingsRequest } from "./types"

const BASE_URL = "/v1/settings/tenant"

export const tenantSettingsApi = {
  /**
   * Get current tenant settings
   */
  getTenantSettings: async (): Promise<TenantSettingsDto> => {
    const response = await apiClient.getRaw<TenantSettingsDto>(BASE_URL)
    return response.data
  },

  /**
   * Update tenant settings
   */
  updateTenantSettings: async (
    data: UpdateTenantSettingsRequest
  ): Promise<TenantSettingsDto> => {
    const response = await apiClient.putRaw<TenantSettingsDto>(BASE_URL, data)
    return response.data
  },
}
