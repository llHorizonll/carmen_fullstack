namespace Carmen.Domain.Entities.Notification;

public enum NotificationType
{
    Approval = 1,
    Alert = 2,
    System = 3,
    Report = 4,
    User = 5,
}

public enum NotificationPriority
{
    Low = 1,
    Normal = 2,
    High = 3,
    Urgent = 4,
}

public enum EmailStatus
{
    Pending = 1,
    Sent = 2,
    Failed = 3,
    Skipped = 4,
}
