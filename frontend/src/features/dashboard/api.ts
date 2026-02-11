import { apiClient } from "@/lib/api-client"
import type { DashboardSummaryDto } from "./types"

const getBaseUrl = (tenantId: string) => `/v1/tenants/${tenantId}/dashboard`

export const dashboardApi = {
  getSummary: async (tenantId: string, asOfDate?: string): Promise<DashboardSummaryDto> => {
    const params = asOfDate ? `?asOfDate=${asOfDate}` : ""
    return apiClient.get<DashboardSummaryDto>(`${getBaseUrl(tenantId)}/summary${params}`)
  },
}
