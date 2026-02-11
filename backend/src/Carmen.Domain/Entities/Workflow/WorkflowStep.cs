using Carmen.Domain.Entities.Common;

namespace Carmen.Domain.Entities.Workflow;

/// <summary>
/// Defines a single approval step within a workflow definition
/// </summary>
public class WorkflowStep : TenantEntity
{
    public Guid DefinitionId { get; set; }
    public int StepOrder { get; set; }
    public string StepName { get; set; } = string.Empty;
    public Guid? ApproverUserId { get; set; }
    public Guid? ApproverRoleId { get; set; }
    public bool AllowDelegation { get; set; } = true;

    // Navigation properties
    public virtual WorkflowDefinition Definition { get; set; } = null!;
}
