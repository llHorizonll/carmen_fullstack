using Carmen.Domain.Entities.Common;

namespace Carmen.Domain.Entities.Report;

public class ScheduledReport : TenantEntity
{
    public Guid ReportTemplateId { get; set; }
    public ScheduleFrequency Frequency { get; set; }
    public string? CronExpression { get; set; }
    public bool IsActive { get; set; } = true;
    public string Recipients { get; set; } = string.Empty; // JSON array of email addresses
    public OutputFormat OutputFormat { get; set; } = OutputFormat.Pdf;
    public DateTime? LastRunAt { get; set; }
    public DateTime? NextRunAt { get; set; }

    // Navigation
    public virtual ReportTemplate ReportTemplate { get; set; } = null!;
}
