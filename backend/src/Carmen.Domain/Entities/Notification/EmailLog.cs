using Carmen.Domain.Entities.Common;

namespace Carmen.Domain.Entities.Notification;

/// <summary>
/// Log of all outbound emails sent by the system
/// </summary>
public class EmailLog : TenantEntity
{
    public string ToEmail { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? TemplateName { get; set; }
    public EmailStatus Status { get; set; } = EmailStatus.Pending;
    public DateTime? SentAt { get; set; }
    public string? ErrorMessage { get; set; }
    public int RetryCount { get; set; }
}
