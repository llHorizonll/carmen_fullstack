import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/auth-store"
import { workflowApi } from "./api"
import type {
  CreateWorkflowDefinitionRequest,
  UpdateWorkflowDefinitionRequest,
  WorkflowActionRequest,
} from "./types"

function useTenantId() {
  return useAuthStore((s) => s.activeTenantId) ?? ""
}

// === Definitions ===

export function useWorkflowDefinitions() {
  const tenantId = useTenantId()
  return useQuery({
    queryKey: ["workflow-definitions", tenantId],
    queryFn: () => workflowApi.getDefinitions(tenantId),
    enabled: !!tenantId,
  })
}

export function useWorkflowDefinition(id: string) {
  const tenantId = useTenantId()
  return useQuery({
    queryKey: ["workflow-definitions", tenantId, id],
    queryFn: () => workflowApi.getDefinition(tenantId, id),
    enabled: !!tenantId && !!id,
  })
}

export function useCreateWorkflowDefinition() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateWorkflowDefinitionRequest) =>
      workflowApi.createDefinition(tenantId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-definitions"] })
      toast.success("Workflow definition created")
    },
    onError: () => {
      toast.error("Failed to create workflow definition")
    },
  })
}

export function useUpdateWorkflowDefinition() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateWorkflowDefinitionRequest }) =>
      workflowApi.updateDefinition(tenantId, id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-definitions"] })
      toast.success("Workflow definition updated")
    },
    onError: () => {
      toast.error("Failed to update workflow definition")
    },
  })
}

export function useDeleteWorkflowDefinition() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => workflowApi.deleteDefinition(tenantId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-definitions"] })
      toast.success("Workflow definition deleted")
    },
    onError: () => {
      toast.error("Failed to delete workflow definition")
    },
  })
}

// === Approvals ===

export function usePendingApprovals(page = 1, pageSize = 20) {
  const tenantId = useTenantId()
  return useQuery({
    queryKey: ["pending-approvals", tenantId, page, pageSize],
    queryFn: () => workflowApi.getPendingApprovals(tenantId, page, pageSize),
    enabled: !!tenantId,
  })
}

export function useWorkflowInstance(instanceId: string) {
  const tenantId = useTenantId()
  return useQuery({
    queryKey: ["workflow-instance", tenantId, instanceId],
    queryFn: () => workflowApi.getInstance(tenantId, instanceId),
    enabled: !!tenantId && !!instanceId,
  })
}

export function useApprove() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ instanceId, request }: { instanceId: string; request?: WorkflowActionRequest }) =>
      workflowApi.approve(tenantId, instanceId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] })
      queryClient.invalidateQueries({ queryKey: ["workflow-instance"] })
      queryClient.invalidateQueries({ queryKey: ["approval-history"] })
      toast.success("Approved successfully")
    },
    onError: () => {
      toast.error("Failed to approve")
    },
  })
}

export function useReject() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ instanceId, request }: { instanceId: string; request?: WorkflowActionRequest }) =>
      workflowApi.reject(tenantId, instanceId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] })
      queryClient.invalidateQueries({ queryKey: ["workflow-instance"] })
      queryClient.invalidateQueries({ queryKey: ["approval-history"] })
      toast.success("Rejected successfully")
    },
    onError: () => {
      toast.error("Failed to reject")
    },
  })
}

export function useDelegate() {
  const tenantId = useTenantId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ instanceId, request }: { instanceId: string; request: WorkflowActionRequest }) =>
      workflowApi.delegate(tenantId, instanceId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] })
      queryClient.invalidateQueries({ queryKey: ["workflow-instance"] })
      toast.success("Delegated successfully")
    },
    onError: () => {
      toast.error("Failed to delegate")
    },
  })
}

export function useApprovalHistory(page = 1, pageSize = 20) {
  const tenantId = useTenantId()
  return useQuery({
    queryKey: ["approval-history", tenantId, page, pageSize],
    queryFn: () => workflowApi.getApprovalHistory(tenantId, page, pageSize),
    enabled: !!tenantId,
  })
}
