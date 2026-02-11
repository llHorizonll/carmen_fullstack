import { apiClient } from "@/lib/api-client"
import type {
  WorkflowDefinitionDto,
  WorkflowDefinitionListDto,
  WorkflowInstanceDto,
  PendingApprovalDto,
  PaginatedResult,
  CreateWorkflowDefinitionRequest,
  UpdateWorkflowDefinitionRequest,
  WorkflowActionRequest,
} from "./types"

const getBaseUrl = (tenantId: string) => `/v1/tenants/${tenantId}/workflows`

export const workflowApi = {
  // === Definitions ===
  getDefinitions: async (tenantId: string): Promise<WorkflowDefinitionListDto[]> => {
    const response = await apiClient.getRaw<WorkflowDefinitionListDto[]>(
      `${getBaseUrl(tenantId)}/definitions`
    )
    return response.data
  },

  getDefinition: async (tenantId: string, id: string): Promise<WorkflowDefinitionDto> => {
    const response = await apiClient.getRaw<WorkflowDefinitionDto>(
      `${getBaseUrl(tenantId)}/definitions/${id}`
    )
    return response.data
  },

  createDefinition: async (
    tenantId: string,
    request: CreateWorkflowDefinitionRequest
  ): Promise<WorkflowDefinitionDto> => {
    const response = await apiClient.postRaw<WorkflowDefinitionDto>(
      `${getBaseUrl(tenantId)}/definitions`,
      request
    )
    return response.data
  },

  updateDefinition: async (
    tenantId: string,
    id: string,
    request: UpdateWorkflowDefinitionRequest
  ): Promise<WorkflowDefinitionDto> => {
    const response = await apiClient.putRaw<WorkflowDefinitionDto>(
      `${getBaseUrl(tenantId)}/definitions/${id}`,
      request
    )
    return response.data
  },

  deleteDefinition: async (tenantId: string, id: string): Promise<void> => {
    await apiClient.deleteRaw(`${getBaseUrl(tenantId)}/definitions/${id}`)
  },

  // === Approval Actions ===
  getPendingApprovals: async (
    tenantId: string,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResult<PendingApprovalDto>> => {
    const response = await apiClient.getRaw<PaginatedResult<PendingApprovalDto>>(
      `${getBaseUrl(tenantId)}/pending?page=${page}&pageSize=${pageSize}`
    )
    return response.data
  },

  getInstance: async (
    tenantId: string,
    instanceId: string
  ): Promise<WorkflowInstanceDto> => {
    const response = await apiClient.getRaw<WorkflowInstanceDto>(
      `${getBaseUrl(tenantId)}/instances/${instanceId}`
    )
    return response.data
  },

  approve: async (
    tenantId: string,
    instanceId: string,
    request?: WorkflowActionRequest
  ): Promise<WorkflowInstanceDto> => {
    const response = await apiClient.postRaw<WorkflowInstanceDto>(
      `${getBaseUrl(tenantId)}/instances/${instanceId}/approve`,
      request ?? {}
    )
    return response.data
  },

  reject: async (
    tenantId: string,
    instanceId: string,
    request?: WorkflowActionRequest
  ): Promise<WorkflowInstanceDto> => {
    const response = await apiClient.postRaw<WorkflowInstanceDto>(
      `${getBaseUrl(tenantId)}/instances/${instanceId}/reject`,
      request ?? {}
    )
    return response.data
  },

  delegate: async (
    tenantId: string,
    instanceId: string,
    request: WorkflowActionRequest
  ): Promise<WorkflowInstanceDto> => {
    const response = await apiClient.postRaw<WorkflowInstanceDto>(
      `${getBaseUrl(tenantId)}/instances/${instanceId}/delegate`,
      request
    )
    return response.data
  },

  getApprovalHistory: async (
    tenantId: string,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResult<PendingApprovalDto>> => {
    const response = await apiClient.getRaw<PaginatedResult<PendingApprovalDto>>(
      `${getBaseUrl(tenantId)}/history?page=${page}&pageSize=${pageSize}`
    )
    return response.data
  },
}
