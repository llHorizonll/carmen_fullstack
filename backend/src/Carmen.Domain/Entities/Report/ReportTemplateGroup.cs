using Carmen.Domain.Entities.Common;

namespace Carmen.Domain.Entities.Report;

public class ReportTemplateGroup : TenantEntity
{
    public Guid ReportTemplateId { get; set; }
    public string FieldName { get; set; } = string.Empty;
    public int Order { get; set; }
    public bool ShowSubtotals { get; set; } = true;
    public SortDirection SortDirection { get; set; } = SortDirection.Ascending;

    // Navigation
    public virtual ReportTemplate ReportTemplate { get; set; } = null!;
}
