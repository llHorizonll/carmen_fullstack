namespace Carmen.Domain.Entities.Workflow;

public enum WorkflowEntityType
{
    JournalVoucher = 1,
    ApInvoice = 2,
    ArInvoice = 3,
    ApPayment = 4,
    ArReceipt = 5,
}

public enum WorkflowStepAction
{
    Approved = 1,
    Rejected = 2,
    Delegated = 3,
    Returned = 4,
}

public enum ApprovalStatus
{
    Pending = 1,
    Approved = 2,
    Rejected = 3,
    Delegated = 4,
}

public enum WorkflowStatus
{
    Pending = 1,
    InProgress = 2,
    Approved = 3,
    Rejected = 4,
    Cancelled = 5,
}
