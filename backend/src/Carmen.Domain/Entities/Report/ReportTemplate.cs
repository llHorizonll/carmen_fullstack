using Carmen.Domain.Entities.Common;

namespace Carmen.Domain.Entities.Report;

public class ReportTemplate : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DataSourceType DataSourceType { get; set; }
    public bool IsPublic { get; set; }
    public OutputFormat DefaultOutputFormat { get; set; } = OutputFormat.Pdf;
    public PageOrientation PageOrientation { get; set; } = PageOrientation.Portrait;

    // Navigation properties
    public virtual ICollection<ReportTemplateColumn> Columns { get; set; } = new List<ReportTemplateColumn>();
    public virtual ICollection<ReportTemplateFilter> Filters { get; set; } = new List<ReportTemplateFilter>();
    public virtual ICollection<ReportTemplateGroup> Groups { get; set; } = new List<ReportTemplateGroup>();
    public virtual ICollection<ScheduledReport> ScheduledReports { get; set; } = new List<ScheduledReport>();
}
