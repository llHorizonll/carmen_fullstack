using Carmen.Application.DTOs.Notification;

namespace Carmen.Infrastructure.Hubs;

/// <summary>
/// Strongly-typed SignalR hub client methods for notifications
/// </summary>
public interface INotificationHubClient
{
    Task ReceiveNotification(NotificationDto notification);
    Task UpdateUnreadCount(int count);
}
