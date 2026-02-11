export type WorkflowEntityType = 1 | 2 | 3 | 4 | 5

export const WorkflowEntityTypeLabels: Record<WorkflowEntityType, string> = {
  1: "Journal Voucher",
  2: "AP Invoice",
  3: "AR Invoice",
  4: "AP Payment",
  5: "AR Receipt",
}

export type WorkflowStepAction = 1 | 2 | 3 | 4

export const WorkflowStepActionLabels: Record<WorkflowStepAction, string> = {
  1: "Approved",
  2: "Rejected",
  3: "Delegated",
  4: "Returned",
}

export type WorkflowStatus = 1 | 2 | 3 | 4 | 5

export const WorkflowStatusLabels: Record<WorkflowStatus, string> = {
  1: "Pending",
  2: "In Progress",
  3: "Approved",
  4: "Rejected",
  5: "Cancelled",
}

export interface WorkflowDefinitionDto {
  id: string
  name: string
  description?: string
  entityType: WorkflowEntityType
  amountThreshold?: number
  isDefault: boolean
  isActive: boolean
  steps: WorkflowStepDto[]
  createdAt: string
}

export interface WorkflowDefinitionListDto {
  id: string
  name: string
  entityType: WorkflowEntityType
  amountThreshold?: number
  isDefault: boolean
  isActive: boolean
  stepCount: number
  createdAt: string
}

export interface WorkflowStepDto {
  id: string
  stepOrder: number
  stepName: string
  approverUserId?: string
  approverUserName?: string
  approverRoleId?: string
  approverRoleName?: string
  allowDelegation: boolean
}

export interface WorkflowInstanceDto {
  id: string
  definitionId: string
  definitionName: string
  entityType: WorkflowEntityType
  entityId: string
  entityNumber: string
  currentStepOrder: number
  currentStepName?: string
  status: WorkflowStatus
  submittedByUserId: string
  submittedByUserName?: string
  submittedAt: string
  completedAt?: string
  history: WorkflowHistoryDto[]
}

export interface WorkflowHistoryDto {
  id: string
  stepOrder: number
  stepName: string
  actionByUserId: string
  actionByUserName?: string
  action: WorkflowStepAction
  comment?: string
  actionAt: string
}

export interface PendingApprovalDto {
  instanceId: string
  entityType: WorkflowEntityType
  entityId: string
  entityNumber: string
  definitionName: string
  currentStepOrder: number
  currentStepName: string
  submittedByUserName?: string
  submittedAt: string
}

export interface WorkflowActionRequest {
  comment?: string
  delegateToUserId?: string
}

export interface CreateWorkflowDefinitionRequest {
  name: string
  description?: string
  entityType: WorkflowEntityType
  amountThreshold?: number
  isDefault: boolean
  steps: CreateWorkflowStepRequest[]
}

export interface CreateWorkflowStepRequest {
  stepOrder: number
  stepName: string
  approverUserId?: string
  approverRoleId?: string
  allowDelegation: boolean
}

export interface UpdateWorkflowDefinitionRequest {
  name: string
  description?: string
  amountThreshold?: number
  isDefault: boolean
  isActive: boolean
  steps: CreateWorkflowStepRequest[]
}

export interface PaginatedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}
