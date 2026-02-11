using Carmen.Domain.Entities.Common;

namespace Carmen.Domain.Entities.Workflow;

/// <summary>
/// Represents an active workflow instance for a specific document
/// </summary>
public class WorkflowInstance : TenantEntity
{
    public Guid DefinitionId { get; set; }
    public WorkflowEntityType EntityType { get; set; }
    public Guid EntityId { get; set; }
    public string EntityNumber { get; set; } = string.Empty;
    public int CurrentStepOrder { get; set; } = 1;
    public WorkflowStatus Status { get; set; } = WorkflowStatus.Pending;
    public Guid SubmittedByUserId { get; set; }
    public DateTime SubmittedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    // Navigation properties
    public virtual WorkflowDefinition Definition { get; set; } = null!;
    public virtual ICollection<WorkflowHistory> History { get; set; } = new List<WorkflowHistory>();
}
