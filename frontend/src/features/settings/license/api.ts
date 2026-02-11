import { apiClient } from "@/lib/api-client"
import type { LicenseDto } from "./types"

const BASE_URL = "/v1/settings/license"

export const licenseApi = {
  /**
   * Get current tenant license information
   */
  getLicenseInfo: async (): Promise<LicenseDto> => {
    const response = await apiClient.getRaw<LicenseDto>(BASE_URL)
    return response.data
  },
}
