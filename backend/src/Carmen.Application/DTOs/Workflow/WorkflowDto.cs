using Carmen.Domain.Entities.Workflow;

namespace Carmen.Application.DTOs.Workflow;

public class WorkflowDefinitionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public WorkflowEntityType EntityType { get; set; }
    public decimal? AmountThreshold { get; set; }
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; }
    public List<WorkflowStepDto> Steps { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class WorkflowDefinitionListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public WorkflowEntityType EntityType { get; set; }
    public decimal? AmountThreshold { get; set; }
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; }
    public int StepCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class WorkflowStepDto
{
    public Guid Id { get; set; }
    public int StepOrder { get; set; }
    public string StepName { get; set; } = string.Empty;
    public Guid? ApproverUserId { get; set; }
    public string? ApproverUserName { get; set; }
    public Guid? ApproverRoleId { get; set; }
    public string? ApproverRoleName { get; set; }
    public bool AllowDelegation { get; set; }
}

public class WorkflowInstanceDto
{
    public Guid Id { get; set; }
    public Guid DefinitionId { get; set; }
    public string DefinitionName { get; set; } = string.Empty;
    public WorkflowEntityType EntityType { get; set; }
    public Guid EntityId { get; set; }
    public string EntityNumber { get; set; } = string.Empty;
    public int CurrentStepOrder { get; set; }
    public string? CurrentStepName { get; set; }
    public WorkflowStatus Status { get; set; }
    public Guid SubmittedByUserId { get; set; }
    public string? SubmittedByUserName { get; set; }
    public DateTime SubmittedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public List<WorkflowHistoryDto> History { get; set; } = new();
}

public class WorkflowHistoryDto
{
    public Guid Id { get; set; }
    public int StepOrder { get; set; }
    public string StepName { get; set; } = string.Empty;
    public Guid ActionByUserId { get; set; }
    public string? ActionByUserName { get; set; }
    public WorkflowStepAction Action { get; set; }
    public string? Comment { get; set; }
    public DateTime ActionAt { get; set; }
}

public class PendingApprovalDto
{
    public Guid InstanceId { get; set; }
    public WorkflowEntityType EntityType { get; set; }
    public Guid EntityId { get; set; }
    public string EntityNumber { get; set; } = string.Empty;
    public string DefinitionName { get; set; } = string.Empty;
    public int CurrentStepOrder { get; set; }
    public string CurrentStepName { get; set; } = string.Empty;
    public string? SubmittedByUserName { get; set; }
    public DateTime SubmittedAt { get; set; }
}

public class WorkflowActionRequest
{
    public string? Comment { get; set; }
    public Guid? DelegateToUserId { get; set; }
}

public class CreateWorkflowDefinitionRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public WorkflowEntityType EntityType { get; set; }
    public decimal? AmountThreshold { get; set; }
    public bool IsDefault { get; set; }
    public List<CreateWorkflowStepRequest> Steps { get; set; } = new();
}

public class CreateWorkflowStepRequest
{
    public int StepOrder { get; set; }
    public string StepName { get; set; } = string.Empty;
    public Guid? ApproverUserId { get; set; }
    public Guid? ApproverRoleId { get; set; }
    public bool AllowDelegation { get; set; } = true;
}

public class UpdateWorkflowDefinitionRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal? AmountThreshold { get; set; }
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; }
    public List<CreateWorkflowStepRequest> Steps { get; set; } = new();
}
