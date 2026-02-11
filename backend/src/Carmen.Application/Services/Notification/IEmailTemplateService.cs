namespace Carmen.Application.Services.Notification;

public interface IEmailTemplateService
{
    /// <summary>
    /// Renders the named template with the given data, wrapped in the base layout.
    /// </summary>
    string RenderTemplate(string templateName, Dictionary<string, string> data);

    /// <summary>
    /// Returns the list of available template names.
    /// </summary>
    IReadOnlyList<string> GetAvailableTemplates();
}
