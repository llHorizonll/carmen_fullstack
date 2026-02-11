namespace Carmen.Application.Services.Notification;

public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string subject, string body, Guid? tenantId = null);
    Task SendTemplatedEmailAsync(string toEmail, string subject, string templateName, Dictionary<string, string> templateData, Guid? tenantId = null);
}
