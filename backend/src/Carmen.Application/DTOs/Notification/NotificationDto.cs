using Carmen.Domain.Entities.Notification;

namespace Carmen.Application.DTOs.Notification;

public class NotificationDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public NotificationType Type { get; set; }
    public NotificationPriority Priority { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? ActionUrl { get; set; }
    public string? EntityType { get; set; }
    public Guid? EntityId { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public string? Data { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UnreadCountDto
{
    public int Count { get; set; }
}

public class NotificationPreferenceDto
{
    public Guid Id { get; set; }
    public NotificationType Type { get; set; }
    public string TypeName { get; set; } = string.Empty;
    public bool InAppEnabled { get; set; }
    public bool EmailEnabled { get; set; }
}

public class UpdatePreferenceRequest
{
    public NotificationType Type { get; set; }
    public bool InAppEnabled { get; set; }
    public bool EmailEnabled { get; set; }
}

public class CreateNotificationRequest
{
    public Guid UserId { get; set; }
    public NotificationType Type { get; set; }
    public NotificationPriority Priority { get; set; } = NotificationPriority.Normal;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? ActionUrl { get; set; }
    public string? EntityType { get; set; }
    public Guid? EntityId { get; set; }
    public string? Data { get; set; }
}

public class NotificationQueryParams
{
    public NotificationType? Type { get; set; }
    public bool? IsRead { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
