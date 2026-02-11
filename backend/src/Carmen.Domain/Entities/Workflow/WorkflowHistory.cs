using Carmen.Domain.Entities.Common;

namespace Carmen.Domain.Entities.Workflow;

/// <summary>
/// Records each action taken in a workflow instance
/// </summary>
public class WorkflowHistory : TenantEntity
{
    public Guid InstanceId { get; set; }
    public int StepOrder { get; set; }
    public string StepName { get; set; } = string.Empty;
    public Guid ActionByUserId { get; set; }
    public WorkflowStepAction Action { get; set; }
    public string? Comment { get; set; }
    public DateTime ActionAt { get; set; }

    // Navigation properties
    public virtual WorkflowInstance Instance { get; set; } = null!;
}
