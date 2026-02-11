import { useQuery } from "@tanstack/react-query"
import { dashboardApi } from "./api"
import { useTenantId } from "@/hooks/useTenantId"

const DASHBOARD_QUERY_KEY = "dashboard"

export function useDashboardSummary(asOfDate?: string) {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, tenantId, asOfDate],
    queryFn: () => dashboardApi.getSummary(tenantId, asOfDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
