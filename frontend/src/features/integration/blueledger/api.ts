import { apiClient } from "@/lib/api-client"
import type {
  BlueLedgerStatusDto,
  PostInventoryToGlRequest,
  PostInventoryToGlResponse,
  BlueLedgerReconciliationRequest,
  BlueLedgerReconciliationResponse,
} from "./types"

const getBaseUrl = (tenantId: string) =>
  `/v1/tenants/${tenantId}/integration/blueledger`

export const blueLedgerApi = {
  getStatus: async (tenantId: string): Promise<BlueLedgerStatusDto> => {
    const response = await apiClient.getRaw<BlueLedgerStatusDto>(
      `${getBaseUrl(tenantId)}/status`
    )
    return response.data
  },

  postInventoryToGl: async (
    tenantId: string,
    data: PostInventoryToGlRequest
  ): Promise<PostInventoryToGlResponse> => {
    const response = await apiClient.postRaw<PostInventoryToGlResponse>(
      `${getBaseUrl(tenantId)}/inventory/post-to-gl`,
      data
    )
    return response.data
  },

  runReconciliation: async (
    tenantId: string,
    data: BlueLedgerReconciliationRequest
  ): Promise<BlueLedgerReconciliationResponse> => {
    const response = await apiClient.postRaw<BlueLedgerReconciliationResponse>(
      `${getBaseUrl(tenantId)}/reconcile`,
      data
    )
    return response.data
  },

  scheduleReconciliation: async (
    tenantId: string
  ): Promise<{ jobId: string; message: string }> => {
    const response = await apiClient.postRaw<{
      jobId: string
      message: string
    }>(`${getBaseUrl(tenantId)}/reconcile/schedule`, {})
    return response.data
  },
}
