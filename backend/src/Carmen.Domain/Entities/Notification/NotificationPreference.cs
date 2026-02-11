using Carmen.Domain.Entities.Common;

namespace Carmen.Domain.Entities.Notification;

/// <summary>
/// User preferences for notification delivery per type
/// </summary>
public class NotificationPreference : BaseEntity
{
    public Guid UserId { get; set; }
    public NotificationType Type { get; set; }
    public bool InAppEnabled { get; set; } = true;
    public bool EmailEnabled { get; set; } = true;
}
