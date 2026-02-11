import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { blueLedgerApi } from "./api"
import type {
  PostInventoryToGlRequest,
  BlueLedgerReconciliationRequest,
} from "./types"
import { useTenantId } from "@/hooks/useTenantId"
import { toast } from "sonner"

const BLUELEDGER_QUERY_KEY = "blueledger"

export function useBlueLedgerStatus() {
  const tenantId = useTenantId()

  return useQuery({
    queryKey: [BLUELEDGER_QUERY_KEY, tenantId, "status"],
    queryFn: () => blueLedgerApi.getStatus(tenantId),
    refetchInterval: 30000,
  })
}

export function usePostInventoryToGl() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PostInventoryToGlRequest) =>
      blueLedgerApi.postInventoryToGl(tenantId, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [BLUELEDGER_QUERY_KEY, tenantId] })
      toast.success(
        `Posted ${result.movementsProcessed} inventory movements ($${result.totalAmount.toLocaleString()})`
      )
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to post inventory to GL")
    },
  })
}

export function useRunReconciliation() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BlueLedgerReconciliationRequest) =>
      blueLedgerApi.runReconciliation(tenantId, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [BLUELEDGER_QUERY_KEY, tenantId] })
      if (result.discrepancies.length > 0) {
        toast.warning(`Reconciliation found ${result.discrepancies.length} discrepancies`)
      } else {
        toast.success("Reconciliation completed successfully")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to run reconciliation")
    },
  })
}

export function useScheduleReconciliation() {
  const tenantId = useTenantId()

  return useMutation({
    mutationFn: () => blueLedgerApi.scheduleReconciliation(tenantId),
    onSuccess: (result) => {
      toast.success(result.message)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to schedule reconciliation")
    },
  })
}
