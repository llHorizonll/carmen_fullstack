import { uuid } from './common'
import type {
  WorkflowDefinitionDto,
  WorkflowStepDto,
  PendingApprovalDto,
  WorkflowHistoryDto,
  WorkflowInstanceDto,
  WorkflowEntityType,
  WorkflowStepAction,
  WorkflowStatus,
} from '../../features/workflow/types'

// ── Workflow Definitions ────────────────────────────────────

const jvSteps: WorkflowStepDto[] = [
  {
    id: uuid('wfst', 1),
    stepOrder: 1,
    stepName: 'Finance Manager Review',
    approverUserId: uuid('user', 2),
    approverUserName: 'Waraporn Thongchai',
    approverRoleId: undefined,
    approverRoleName: undefined,
    allowDelegation: true,
  },
  {
    id: uuid('wfst', 2),
    stepOrder: 2,
    stepName: 'Financial Controller Approval',
    approverUserId: undefined,
    approverUserName: undefined,
    approverRoleId: uuid('role', 2),
    approverRoleName: 'Finance Manager',
    allowDelegation: false,
  },
]

const apInvoiceSteps: WorkflowStepDto[] = [
  {
    id: uuid('wfst', 3),
    stepOrder: 1,
    stepName: 'Department Head Verification',
    approverUserId: undefined,
    approverUserName: undefined,
    approverRoleId: uuid('role', 2),
    approverRoleName: 'Finance Manager',
    allowDelegation: true,
  },
  {
    id: uuid('wfst', 4),
    stepOrder: 2,
    stepName: 'Finance Manager Approval',
    approverUserId: uuid('user', 2),
    approverUserName: 'Waraporn Thongchai',
    approverRoleId: undefined,
    approverRoleName: undefined,
    allowDelegation: true,
  },
  {
    id: uuid('wfst', 5),
    stepOrder: 3,
    stepName: 'GM Final Approval',
    approverUserId: uuid('user', 1),
    approverUserName: 'Priya Charoensuk',
    approverRoleId: undefined,
    approverRoleName: undefined,
    allowDelegation: false,
  },
]

const apPaymentSteps: WorkflowStepDto[] = [
  {
    id: uuid('wfst', 6),
    stepOrder: 1,
    stepName: 'AP Clerk Preparation',
    approverUserId: uuid('user', 3),
    approverUserName: 'Natthapong Suwan',
    approverRoleId: undefined,
    approverRoleName: undefined,
    allowDelegation: false,
  },
  {
    id: uuid('wfst', 7),
    stepOrder: 2,
    stepName: 'Finance Manager Sign-off',
    approverUserId: uuid('user', 2),
    approverUserName: 'Waraporn Thongchai',
    approverRoleId: undefined,
    approverRoleName: undefined,
    allowDelegation: true,
  },
]

export const mockWorkflowDefinitions: WorkflowDefinitionDto[] = [
  {
    id: uuid('wfdf', 1),
    name: 'Journal Voucher Approval',
    description: 'Two-step approval for all journal vouchers exceeding THB 100,000',
    entityType: 1 as WorkflowEntityType, // Journal Voucher
    amountThreshold: 100000,
    isDefault: true,
    isActive: true,
    steps: jvSteps,
    createdAt: '2024-02-01T08:00:00Z',
  },
  {
    id: uuid('wfdf', 2),
    name: 'AP Invoice Approval',
    description: 'Three-step approval for AP invoices: department, finance, and GM',
    entityType: 2 as WorkflowEntityType, // AP Invoice
    amountThreshold: 50000,
    isDefault: true,
    isActive: true,
    steps: apInvoiceSteps,
    createdAt: '2024-02-01T08:00:00Z',
  },
  {
    id: uuid('wfdf', 3),
    name: 'AP Payment Approval',
    description: 'Two-step approval for payment batches',
    entityType: 4 as WorkflowEntityType, // AP Payment
    amountThreshold: undefined,
    isDefault: true,
    isActive: true,
    steps: apPaymentSteps,
    createdAt: '2024-02-01T08:00:00Z',
  },
]

// ── Pending Approvals ───────────────────────────────────────

export const mockPendingApprovals: PendingApprovalDto[] = [
  {
    instanceId: uuid('wfin', 1),
    entityType: 1 as WorkflowEntityType,
    entityId: uuid('jvch', 42),
    entityNumber: 'JV-2025-0042',
    definitionName: 'Journal Voucher Approval',
    currentStepOrder: 2,
    currentStepName: 'Financial Controller Approval',
    submittedByUserName: 'Natthapong Suwan',
    submittedAt: '2025-12-18T09:30:00Z',
  },
  {
    instanceId: uuid('wfin', 2),
    entityType: 2 as WorkflowEntityType,
    entityId: uuid('apiv', 88),
    entityNumber: 'AP-2025-0088',
    definitionName: 'AP Invoice Approval',
    currentStepOrder: 1,
    currentStepName: 'Department Head Verification',
    submittedByUserName: 'Natthapong Suwan',
    submittedAt: '2025-12-19T14:15:00Z',
  },
  {
    instanceId: uuid('wfin', 3),
    entityType: 2 as WorkflowEntityType,
    entityId: uuid('apiv', 89),
    entityNumber: 'AP-2025-0089',
    definitionName: 'AP Invoice Approval',
    currentStepOrder: 2,
    currentStepName: 'Finance Manager Approval',
    submittedByUserName: 'Kanokwan Prasert',
    submittedAt: '2025-12-17T11:00:00Z',
  },
  {
    instanceId: uuid('wfin', 4),
    entityType: 4 as WorkflowEntityType,
    entityId: uuid('appm', 15),
    entityNumber: 'PAY-2025-0015',
    definitionName: 'AP Payment Approval',
    currentStepOrder: 2,
    currentStepName: 'Finance Manager Sign-off',
    submittedByUserName: 'Natthapong Suwan',
    submittedAt: '2025-12-20T08:45:00Z',
  },
  {
    instanceId: uuid('wfin', 5),
    entityType: 1 as WorkflowEntityType,
    entityId: uuid('jvch', 43),
    entityNumber: 'JV-2025-0043',
    definitionName: 'Journal Voucher Approval',
    currentStepOrder: 1,
    currentStepName: 'Finance Manager Review',
    submittedByUserName: 'Kanokwan Prasert',
    submittedAt: '2025-12-20T10:00:00Z',
  },
]

// ── Approval History ────────────────────────────────────────

export const mockApprovalHistory: WorkflowHistoryDto[] = [
  {
    id: uuid('wfhi', 1),
    stepOrder: 1,
    stepName: 'Finance Manager Review',
    actionByUserId: uuid('user', 2),
    actionByUserName: 'Waraporn Thongchai',
    action: 1 as WorkflowStepAction, // Approved
    comment: 'Verified supporting documents. Approved.',
    actionAt: '2025-12-10T09:00:00Z',
  },
  {
    id: uuid('wfhi', 2),
    stepOrder: 2,
    stepName: 'Financial Controller Approval',
    actionByUserId: uuid('user', 1),
    actionByUserName: 'Priya Charoensuk',
    action: 1 as WorkflowStepAction, // Approved
    comment: 'Final approval granted.',
    actionAt: '2025-12-10T14:30:00Z',
  },
  {
    id: uuid('wfhi', 3),
    stepOrder: 1,
    stepName: 'Department Head Verification',
    actionByUserId: uuid('user', 2),
    actionByUserName: 'Waraporn Thongchai',
    action: 1 as WorkflowStepAction,
    comment: undefined,
    actionAt: '2025-12-12T10:15:00Z',
  },
  {
    id: uuid('wfhi', 4),
    stepOrder: 2,
    stepName: 'Finance Manager Approval',
    actionByUserId: uuid('user', 2),
    actionByUserName: 'Waraporn Thongchai',
    action: 2 as WorkflowStepAction, // Rejected
    comment: 'Missing vendor tax invoice. Please resubmit with proper documentation.',
    actionAt: '2025-12-13T11:45:00Z',
  },
  {
    id: uuid('wfhi', 5),
    stepOrder: 1,
    stepName: 'AP Clerk Preparation',
    actionByUserId: uuid('user', 3),
    actionByUserName: 'Natthapong Suwan',
    action: 1 as WorkflowStepAction,
    comment: 'Payment batch prepared. 12 invoices totalling USD 85,400.',
    actionAt: '2025-12-15T08:30:00Z',
  },
  {
    id: uuid('wfhi', 6),
    stepOrder: 2,
    stepName: 'Finance Manager Sign-off',
    actionByUserId: uuid('user', 2),
    actionByUserName: 'Waraporn Thongchai',
    action: 1 as WorkflowStepAction,
    comment: 'Payment batch approved for processing.',
    actionAt: '2025-12-15T15:00:00Z',
  },
  {
    id: uuid('wfhi', 7),
    stepOrder: 1,
    stepName: 'Finance Manager Review',
    actionByUserId: uuid('user', 2),
    actionByUserName: 'Waraporn Thongchai',
    action: 4 as WorkflowStepAction, // Returned
    comment: 'Account mapping needs correction. Returning for revision.',
    actionAt: '2025-12-16T09:20:00Z',
  },
  {
    id: uuid('wfhi', 8),
    stepOrder: 1,
    stepName: 'Finance Manager Review',
    actionByUserId: uuid('user', 2),
    actionByUserName: 'Waraporn Thongchai',
    action: 1 as WorkflowStepAction,
    comment: 'Re-reviewed after correction. Approved.',
    actionAt: '2025-12-17T10:00:00Z',
  },
]

// ── Full Workflow Instance (for detail views) ───────────────

export const mockWorkflowInstances: WorkflowInstanceDto[] = [
  {
    id: uuid('wfin', 1),
    definitionId: uuid('wfdf', 1),
    definitionName: 'Journal Voucher Approval',
    entityType: 1 as WorkflowEntityType,
    entityId: uuid('jvch', 42),
    entityNumber: 'JV-2025-0042',
    currentStepOrder: 2,
    currentStepName: 'Financial Controller Approval',
    status: 2 as WorkflowStatus, // In Progress
    submittedByUserId: uuid('user', 3),
    submittedByUserName: 'Natthapong Suwan',
    submittedAt: '2025-12-18T09:30:00Z',
    completedAt: undefined,
    history: [mockApprovalHistory[0]],
  },
  {
    id: uuid('wfin', 6),
    definitionId: uuid('wfdf', 2),
    definitionName: 'AP Invoice Approval',
    entityType: 2 as WorkflowEntityType,
    entityId: uuid('apiv', 80),
    entityNumber: 'AP-2025-0080',
    currentStepOrder: 3,
    currentStepName: 'GM Final Approval',
    status: 3 as WorkflowStatus, // Approved
    submittedByUserId: uuid('user', 3),
    submittedByUserName: 'Natthapong Suwan',
    submittedAt: '2025-12-10T08:00:00Z',
    completedAt: '2025-12-10T14:30:00Z',
    history: [mockApprovalHistory[0], mockApprovalHistory[1]],
  },
]
