using Carmen.Domain.Entities.Common;

namespace Carmen.Domain.Entities.Notification;

/// <summary>
/// Represents an in-app notification for a user
/// </summary>
public class Notification : TenantEntity
{
    public Guid UserId { get; set; }
    public NotificationType Type { get; set; }
    public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? ActionUrl { get; set; }
    public string? EntityType { get; set; }
    public Guid? EntityId { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public string? Data { get; set; } // JSON for additional metadata
}
