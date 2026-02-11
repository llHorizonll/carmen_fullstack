using Carmen.Domain.Entities.Common;

namespace Carmen.Domain.Entities.Report;

public class ReportTemplateColumn : TenantEntity
{
    public Guid ReportTemplateId { get; set; }
    public string FieldName { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public ColumnType ColumnType { get; set; } = ColumnType.Text;
    public int Width { get; set; } = 100;
    public int Order { get; set; }
    public AggregateFunction AggregateFunction { get; set; } = AggregateFunction.None;
    public SortDirection? SortDirection { get; set; }
    public int? SortOrder { get; set; }

    // Navigation
    public virtual ReportTemplate ReportTemplate { get; set; } = null!;
}
