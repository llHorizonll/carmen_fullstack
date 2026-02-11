using Carmen.Application.Services.Notification;
using Carmen.Domain.Entities.Notification;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Jobs;

/// <summary>
/// Hangfire job that sends email for a specific notification based on user preferences
/// </summary>
public interface ISendNotificationEmailJob
{
    Task ExecuteAsync(Guid tenantId, Guid notificationId);
}

public class SendNotificationEmailJob : ISendNotificationEmailJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<SendNotificationEmailJob> _logger;

    public SendNotificationEmailJob(
        IServiceProvider serviceProvider,
        ILogger<SendNotificationEmailJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task ExecuteAsync(Guid tenantId, Guid notificationId)
    {
        using var scope = _serviceProvider.CreateScope();

        var dbOptions = scope.ServiceProvider.GetRequiredService<DbContextOptions<CarmenDbContext>>();
        using var context = new CarmenDbContext(dbOptions, tenantId);

        var notification = await context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId);

        if (notification == null)
        {
            _logger.LogWarning("Notification {NotificationId} not found for email sending", notificationId);
            return;
        }

        // Check email preferences
        var preference = await context.NotificationPreferences
            .FirstOrDefaultAsync(p => p.UserId == notification.UserId && p.Type == notification.Type);

        if (preference != null && !preference.EmailEnabled)
        {
            _logger.LogInformation("Email for notification {NotificationId} skipped - disabled by user preference",
                notificationId);
            return;
        }

        // Get user email
        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == notification.UserId);
        if (user == null || string.IsNullOrEmpty(user.Email))
        {
            _logger.LogWarning("User {UserId} not found or has no email for notification {NotificationId}",
                notification.UserId, notificationId);
            return;
        }

        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
        var templateService = scope.ServiceProvider.GetRequiredService<IEmailTemplateService>();

        // Build template data from notification metadata
        var templateData = new Dictionary<string, string>
        {
            ["Subject"] = notification.Title,
            ["RecipientName"] = user.FullName ?? user.Email,
            ["ActionUrl"] = notification.ActionUrl ?? "#",
        };

        // Parse additional data from notification JSON metadata
        if (!string.IsNullOrEmpty(notification.Data))
        {
            try
            {
                var extraData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(notification.Data);
                if (extraData != null)
                {
                    foreach (var kvp in extraData)
                    {
                        templateData.TryAdd(kvp.Key, kvp.Value);
                    }
                }
            }
            catch
            {
                // Ignore malformed JSON in notification data
            }
        }

        // Resolve template name from notification type and data
        var templateName = ResolveTemplateName(notification, templateData);

        string body;
        var availableTemplates = templateService.GetAvailableTemplates();
        if (availableTemplates.Contains(templateName))
        {
            body = templateService.RenderTemplate(templateName, templateData);
        }
        else
        {
            // Fallback: render with layout using generic content
            var genericContent = $"<h2>{notification.Title}</h2><p>{notification.Message}</p>" +
                (string.IsNullOrEmpty(notification.ActionUrl) ? "" :
                    $"<p style=\"text-align: center; margin-top: 24px;\"><a href=\"{notification.ActionUrl}\" class=\"btn\">View Details</a></p>");

            templateData["Content"] = genericContent;
            body = templateService.RenderTemplate("_layout_only", templateData);

            // If template rendering returned empty (no layout found), use inline HTML
            if (string.IsNullOrEmpty(body))
            {
                body = $@"
<html>
<body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
    <h2 style='color: #1a1a2e;'>{notification.Title}</h2>
    <p>{notification.Message}</p>
    {(string.IsNullOrEmpty(notification.ActionUrl) ? "" : $"<p><a href='{notification.ActionUrl}' style='color: #0066cc;'>View Details</a></p>")}
    <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;' />
    <p style='color: #999; font-size: 12px;'>This is an automated notification from Carmen.</p>
</body>
</html>";
            }
        }

        try
        {
            await emailService.SendEmailAsync(user.Email, notification.Title, body, tenantId);
            _logger.LogInformation("Sent email notification {NotificationId} to {Email} using template {Template}",
                notificationId, user.Email, templateName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email notification {NotificationId} to {Email}",
                notificationId, user.Email);
        }
    }

    private static string ResolveTemplateName(Notification notification, Dictionary<string, string> data)
    {
        // Check if a specific template is requested via notification metadata
        if (data.TryGetValue("TemplateName", out var explicitTemplate) && !string.IsNullOrEmpty(explicitTemplate))
        {
            return explicitTemplate;
        }

        // Map notification type + entity type to template name
        return notification.Type switch
        {
            NotificationType.Approval when data.ContainsKey("Status") => "approval_completed",
            NotificationType.Approval => "approval_pending",
            NotificationType.Alert when notification.EntityType == "Invoice" && data.ContainsKey("DaysOverdue") => "invoice_overdue",
            NotificationType.Alert when notification.EntityType == "Invoice" => "payment_due",
            NotificationType.Alert when notification.EntityType == "Budget" => "budget_exceeded",
            NotificationType.System when data.ContainsKey("StartTime") => "system_maintenance",
            NotificationType.Report => "report_ready",
            NotificationType.User when data.ContainsKey("ResetUrl") => "password_reset",
            NotificationType.User when data.ContainsKey("LoginUrl") => "welcome_user",
            _ => "generic",
        };
    }
}
