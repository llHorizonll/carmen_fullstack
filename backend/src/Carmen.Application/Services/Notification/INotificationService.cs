using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.Notification;

namespace Carmen.Application.Services.Notification;

public interface INotificationService
{
    Task<NotificationDto> CreateAsync(Guid tenantId, CreateNotificationRequest request);
    Task<PaginatedResult<NotificationDto>> GetUserNotificationsAsync(Guid tenantId, Guid userId, NotificationQueryParams? queryParams = null);
    Task<int> GetUnreadCountAsync(Guid tenantId, Guid userId);
    Task MarkAsReadAsync(Guid tenantId, Guid notificationId);
    Task MarkAllReadAsync(Guid tenantId, Guid userId);
    Task DeleteAsync(Guid tenantId, Guid notificationId);
    Task<List<NotificationPreferenceDto>> GetPreferencesAsync(Guid userId);
    Task UpdatePreferencesAsync(Guid userId, List<UpdatePreferenceRequest> requests);
}
