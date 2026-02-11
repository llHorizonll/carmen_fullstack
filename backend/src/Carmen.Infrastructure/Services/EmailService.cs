using Carmen.Application.Services.Notification;
using Carmen.Domain.Entities.Notification;
using Carmen.Infrastructure.Data;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace Carmen.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly CarmenDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly IEmailTemplateService _templateService;

    public EmailService(
        CarmenDbContext context,
        IConfiguration configuration,
        ILogger<EmailService> logger,
        IEmailTemplateService templateService)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
        _templateService = templateService;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body, Guid? tenantId = null)
    {
        var emailLog = new EmailLog
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId ?? Guid.Empty,
            ToEmail = toEmail,
            Subject = subject,
            Body = body,
            Status = EmailStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system",
        };

        _context.EmailLogs.Add(emailLog);
        await _context.SaveChangesAsync();

        try
        {
            await SendViaSmtpAsync(toEmail, subject, body);

            emailLog.Status = EmailStatus.Sent;
            emailLog.SentAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Email sent to {ToEmail}: {Subject}", toEmail, subject);
        }
        catch (Exception ex)
        {
            emailLog.Status = EmailStatus.Failed;
            emailLog.ErrorMessage = ex.Message;
            emailLog.RetryCount++;
            await _context.SaveChangesAsync();

            _logger.LogError(ex, "Failed to send email to {ToEmail}: {Subject}", toEmail, subject);
            throw;
        }
    }

    public async Task SendTemplatedEmailAsync(
        string toEmail, string subject, string templateName,
        Dictionary<string, string> templateData, Guid? tenantId = null)
    {
        // Ensure Subject is available for the layout
        templateData.TryAdd("Subject", subject);

        // Render using the template service (loads from embedded resources + applies layout)
        var availableTemplates = _templateService.GetAvailableTemplates();
        string body;

        if (availableTemplates.Contains(templateName))
        {
            body = _templateService.RenderTemplate(templateName, templateData);
        }
        else
        {
            // Fallback: treat templateName as inline HTML and apply {{key}} replacement
            body = templateName;
            foreach (var kvp in templateData)
            {
                body = body.Replace($"{{{{{kvp.Key}}}}}", kvp.Value);
            }
        }

        var emailLog = new EmailLog
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId ?? Guid.Empty,
            ToEmail = toEmail,
            Subject = subject,
            Body = body,
            TemplateName = templateName,
            Status = EmailStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system",
        };

        _context.EmailLogs.Add(emailLog);
        await _context.SaveChangesAsync();

        try
        {
            await SendViaSmtpAsync(toEmail, subject, body);

            emailLog.Status = EmailStatus.Sent;
            emailLog.SentAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Templated email sent to {ToEmail}: {Subject}", toEmail, subject);
        }
        catch (Exception ex)
        {
            emailLog.Status = EmailStatus.Failed;
            emailLog.ErrorMessage = ex.Message;
            emailLog.RetryCount++;
            await _context.SaveChangesAsync();

            _logger.LogError(ex, "Failed to send templated email to {ToEmail}: {Subject}", toEmail, subject);
            throw;
        }
    }

    private async Task SendViaSmtpAsync(string toEmail, string subject, string body)
    {
        var smtpSection = _configuration.GetSection("Smtp");
        var host = smtpSection["Host"];

        // If SMTP is not configured, log and skip
        if (string.IsNullOrEmpty(host))
        {
            _logger.LogWarning("SMTP not configured. Email to {ToEmail} will be logged but not sent.", toEmail);
            return;
        }

        var port = int.Parse(smtpSection["Port"] ?? "587");
        var fromEmail = smtpSection["FromEmail"] ?? "noreply@carmen.com";
        var fromName = smtpSection["FromName"] ?? "Carmen";
        var username = smtpSection["Username"];
        var password = smtpSection["Password"];
        var useSsl = bool.Parse(smtpSection["UseSsl"] ?? "true");

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(fromName, fromEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;

        var bodyBuilder = new BodyBuilder { HtmlBody = body };
        message.Body = bodyBuilder.ToMessageBody();

        using var client = new SmtpClient();
        await client.ConnectAsync(host, port, useSsl ? MailKit.Security.SecureSocketOptions.StartTls : MailKit.Security.SecureSocketOptions.Auto);

        if (!string.IsNullOrEmpty(username))
        {
            await client.AuthenticateAsync(username, password);
        }

        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
