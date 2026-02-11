using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Jobs;

/// <summary>
/// Recurring Hangfire job that cleans up old read notifications and email logs
/// </summary>
public interface INotificationCleanupJob
{
    Task ExecuteAsync();
}

public class NotificationCleanupJob : INotificationCleanupJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<NotificationCleanupJob> _logger;

    public NotificationCleanupJob(
        IServiceProvider serviceProvider,
        ILogger<NotificationCleanupJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task ExecuteAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var dbOptions = scope.ServiceProvider.GetRequiredService<DbContextOptions<CarmenDbContext>>();

        // Use a context without tenant filter to clean up across all tenants
        using var context = new CarmenDbContext(dbOptions);

        var cutoffDate = DateTime.UtcNow.AddDays(-90);

        // Delete read notifications older than 90 days
        var oldNotifications = await context.Notifications
            .Where(n => n.IsRead && n.CreatedAt < cutoffDate)
            .ToListAsync();

        if (oldNotifications.Count > 0)
        {
            context.Notifications.RemoveRange(oldNotifications);
            _logger.LogInformation("Cleaning up {Count} old read notifications", oldNotifications.Count);
        }

        // Delete sent email logs older than 90 days
        var oldEmailLogs = await context.EmailLogs
            .Where(e => e.Status == Domain.Entities.Notification.EmailStatus.Sent && e.CreatedAt < cutoffDate)
            .ToListAsync();

        if (oldEmailLogs.Count > 0)
        {
            context.EmailLogs.RemoveRange(oldEmailLogs);
            _logger.LogInformation("Cleaning up {Count} old email logs", oldEmailLogs.Count);
        }

        await context.SaveChangesAsync();

        _logger.LogInformation("Notification cleanup completed. Removed {NotifCount} notifications, {EmailCount} email logs",
            oldNotifications.Count, oldEmailLogs.Count);
    }
}
