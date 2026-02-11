using System.Collections.Concurrent;
using System.Reflection;
using Carmen.Application.Services.Notification;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Services;

public class EmailTemplateService : IEmailTemplateService
{
    private readonly ILogger<EmailTemplateService> _logger;
    private readonly ConcurrentDictionary<string, string> _templateCache = new();
    private readonly Assembly _assembly;
    private readonly string _resourcePrefix;

    public EmailTemplateService(ILogger<EmailTemplateService> logger)
    {
        _logger = logger;
        _assembly = typeof(EmailTemplateService).Assembly;
        _resourcePrefix = "Carmen.Infrastructure.EmailTemplates.";
    }

    public string RenderTemplate(string templateName, Dictionary<string, string> data)
    {
        var layout = LoadTemplate("_layout");
        var content = LoadTemplate(templateName);

        if (string.IsNullOrEmpty(layout))
        {
            _logger.LogWarning("Base layout template not found, returning content only for template {TemplateName}", templateName);
            return ApplyData(content, data);
        }

        if (string.IsNullOrEmpty(content))
        {
            _logger.LogWarning("Template {TemplateName} not found, returning empty body in layout", templateName);
            content = $"<p>{data.GetValueOrDefault("Subject", "Notification")}</p>";
        }

        // First apply data to the content template
        var renderedContent = ApplyData(content, data);

        // Then inject rendered content into the layout
        data["Content"] = renderedContent;
        var renderedHtml = ApplyData(layout, data);

        return renderedHtml;
    }

    public IReadOnlyList<string> GetAvailableTemplates()
    {
        var names = _assembly.GetManifestResourceNames()
            .Where(n => n.StartsWith(_resourcePrefix) && n.EndsWith(".html"))
            .Select(n => n
                .Replace(_resourcePrefix, "")
                .Replace(".html", ""))
            .Where(n => !n.StartsWith("_")) // Exclude layout
            .OrderBy(n => n)
            .ToList();

        return names;
    }

    private string LoadTemplate(string templateName)
    {
        return _templateCache.GetOrAdd(templateName, name =>
        {
            var resourceName = $"{_resourcePrefix}{name}.html";
            using var stream = _assembly.GetManifestResourceStream(resourceName);

            if (stream == null)
            {
                _logger.LogWarning("Email template resource not found: {ResourceName}", resourceName);
                return string.Empty;
            }

            using var reader = new StreamReader(stream);
            return reader.ReadToEnd();
        });
    }

    private static string ApplyData(string template, Dictionary<string, string> data)
    {
        var result = template;
        foreach (var kvp in data)
        {
            result = result.Replace($"{{{{{kvp.Key}}}}}", kvp.Value);
        }
        return result;
    }
}
