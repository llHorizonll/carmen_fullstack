using Carmen.Domain.Entities.Common;

namespace Carmen.Domain.Entities.Workflow;

/// <summary>
/// Defines a workflow template with approval steps for a specific entity type
/// </summary>
public class WorkflowDefinition : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public WorkflowEntityType EntityType { get; set; }
    public decimal? AmountThreshold { get; set; }
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public virtual ICollection<WorkflowStep> Steps { get; set; } = new List<WorkflowStep>();
}
