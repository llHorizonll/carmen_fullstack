using Carmen.Domain.Entities.Common;

namespace Carmen.Domain.Entities.Report;

public class ReportTemplateFilter : TenantEntity
{
    public Guid ReportTemplateId { get; set; }
    public string FieldName { get; set; } = string.Empty;
    public FilterOperator Operator { get; set; }
    public string? Value { get; set; }
    public string? Value2 { get; set; } // For Between operator

    // Navigation
    public virtual ReportTemplate ReportTemplate { get; set; } = null!;
}
