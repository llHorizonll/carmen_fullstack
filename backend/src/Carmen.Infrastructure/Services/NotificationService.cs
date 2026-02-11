using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.Notification;
using Carmen.Application.Services.Notification;
using Carmen.Domain.Entities.Notification;
using Carmen.Infrastructure.Data;
using Carmen.Infrastructure.Hubs;
using Carmen.Infrastructure.Jobs;
using Hangfire;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly CarmenDbContext _context;
    private readonly IHubContext<NotificationHub, INotificationHubClient> _hubContext;
    private readonly IBackgroundJobClient _backgroundJobClient;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        CarmenDbContext context,
        IHubContext<NotificationHub, INotificationHubClient> hubContext,
        IBackgroundJobClient backgroundJobClient,
        ILogger<NotificationService> logger)
    {
        _context = context;
        _hubContext = hubContext;
        _backgroundJobClient = backgroundJobClient;
        _logger = logger;
    }

    public async Task<NotificationDto> CreateAsync(Guid tenantId, CreateNotificationRequest request)
    {
        // Check user preferences
        var preference = await _context.NotificationPreferences
            .FirstOrDefaultAsync(p => p.UserId == request.UserId && p.Type == request.Type);

        // If preference exists and in-app is disabled, skip creation
        if (preference != null && !preference.InAppEnabled)
        {
            _logger.LogInformation("Skipping in-app notification for user {UserId} - disabled by preference", request.UserId);
            // Still return a DTO so callers don't break, but don't persist
            return new NotificationDto
            {
                Id = Guid.Empty,
                UserId = request.UserId,
                Type = request.Type,
                Priority = request.Priority,
                Title = request.Title,
                Message = request.Message,
                CreatedAt = DateTime.UtcNow,
            };
        }

        var notification = new Domain.Entities.Notification.Notification
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            UserId = request.UserId,
            Type = request.Type,
            Priority = request.Priority,
            Title = request.Title,
            Message = request.Message,
            ActionUrl = request.ActionUrl,
            EntityType = request.EntityType,
            EntityId = request.EntityId,
            Data = request.Data,
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system",
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        var dto = MapToDto(notification);

        // Push real-time via SignalR
        try
        {
            await _hubContext.Clients.Group($"user_{request.UserId}")
                .ReceiveNotification(dto);

            var unreadCount = await GetUnreadCountAsync(tenantId, request.UserId);
            await _hubContext.Clients.Group($"user_{request.UserId}")
                .UpdateUnreadCount(unreadCount);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to push SignalR notification to user {UserId}", request.UserId);
        }

        // Enqueue email notification via Hangfire
        _backgroundJobClient.Enqueue<ISendNotificationEmailJob>(
            job => job.ExecuteAsync(tenantId, notification.Id));

        _logger.LogInformation("Created notification {NotificationId} for user {UserId}", notification.Id, request.UserId);

        return dto;
    }

    public async Task<PaginatedResult<NotificationDto>> GetUserNotificationsAsync(
        Guid tenantId, Guid userId, NotificationQueryParams? queryParams = null)
    {
        var query = _context.Notifications
            .Where(n => n.TenantId == tenantId && n.UserId == userId);

        if (queryParams?.Type.HasValue == true)
            query = query.Where(n => n.Type == queryParams.Type.Value);

        if (queryParams?.IsRead.HasValue == true)
            query = query.Where(n => n.IsRead == queryParams.IsRead.Value);

        var totalCount = await query.CountAsync();

        var page = queryParams?.Page ?? 1;
        var pageSize = queryParams?.PageSize ?? 20;

        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => MapToDto(n))
            .ToListAsync();

        return new PaginatedResult<NotificationDto>(
            items, totalCount, page, pageSize,
            (int)Math.Ceiling(totalCount / (double)pageSize));
    }

    public async Task<int> GetUnreadCountAsync(Guid tenantId, Guid userId)
    {
        return await _context.Notifications
            .CountAsync(n => n.TenantId == tenantId && n.UserId == userId && !n.IsRead);
    }

    public async Task MarkAsReadAsync(Guid tenantId, Guid notificationId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.TenantId == tenantId && n.Id == notificationId);

        if (notification != null && !notification.IsRead)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    public async Task MarkAllReadAsync(Guid tenantId, Guid userId)
    {
        var unread = await _context.Notifications
            .Where(n => n.TenantId == tenantId && n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var notification in unread)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Marked {Count} notifications as read for user {UserId}", unread.Count, userId);
    }

    public async Task DeleteAsync(Guid tenantId, Guid notificationId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.TenantId == tenantId && n.Id == notificationId);

        if (notification != null)
        {
            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<List<NotificationPreferenceDto>> GetPreferencesAsync(Guid userId)
    {
        var existing = await _context.NotificationPreferences
            .Where(p => p.UserId == userId)
            .ToListAsync();

        // Ensure all notification types have a preference entry
        var allTypes = Enum.GetValues<NotificationType>();
        var result = new List<NotificationPreferenceDto>();

        foreach (var type in allTypes)
        {
            var pref = existing.FirstOrDefault(p => p.Type == type);
            result.Add(new NotificationPreferenceDto
            {
                Id = pref?.Id ?? Guid.Empty,
                Type = type,
                TypeName = type.ToString(),
                InAppEnabled = pref?.InAppEnabled ?? true,
                EmailEnabled = pref?.EmailEnabled ?? true,
            });
        }

        return result;
    }

    public async Task UpdatePreferencesAsync(Guid userId, List<UpdatePreferenceRequest> requests)
    {
        foreach (var req in requests)
        {
            var existing = await _context.NotificationPreferences
                .FirstOrDefaultAsync(p => p.UserId == userId && p.Type == req.Type);

            if (existing != null)
            {
                existing.InAppEnabled = req.InAppEnabled;
                existing.EmailEnabled = req.EmailEnabled;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                _context.NotificationPreferences.Add(new NotificationPreference
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Type = req.Type,
                    InAppEnabled = req.InAppEnabled,
                    EmailEnabled = req.EmailEnabled,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "system",
                });
            }
        }

        await _context.SaveChangesAsync();
    }

    private static NotificationDto MapToDto(Domain.Entities.Notification.Notification n)
    {
        return new NotificationDto
        {
            Id = n.Id,
            UserId = n.UserId,
            Type = n.Type,
            Priority = n.Priority,
            Title = n.Title,
            Message = n.Message,
            ActionUrl = n.ActionUrl,
            EntityType = n.EntityType,
            EntityId = n.EntityId,
            IsRead = n.IsRead,
            ReadAt = n.ReadAt,
            Data = n.Data,
            CreatedAt = n.CreatedAt,
        };
    }
}
