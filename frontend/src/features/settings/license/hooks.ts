import { useQuery } from "@tanstack/react-query"
import { licenseApi } from "./api"

const LICENSE_QUERY_KEY = "license"

/**
 * Hook for fetching license information
 */
export function useLicense() {
  return useQuery({
    queryKey: [LICENSE_QUERY_KEY],
    queryFn: () => licenseApi.getLicenseInfo(),
  })
}
