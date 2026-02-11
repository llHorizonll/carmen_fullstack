using Carmen.Application.DTOs.Report;
using Carmen.Domain.Entities.Report;

namespace Carmen.Application.Services.Report;

public interface IReportTemplateService
{
    Task<List<ReportTemplateListDto>> GetTemplatesAsync();
    Task<ReportTemplateDto?> GetTemplateAsync(Guid id);
    Task<ReportTemplateDto> CreateTemplateAsync(CreateReportTemplateRequest request);
    Task<ReportTemplateDto> UpdateTemplateAsync(Guid id, UpdateReportTemplateRequest request);
    Task DeleteTemplateAsync(Guid id);
    Task<ReportDataSet> PreviewAsync(Guid templateId, Dictionary<string, string>? runtimeFilters = null);
    Task<byte[]> GenerateAsync(Guid templateId, OutputFormat format, Dictionary<string, string>? runtimeFilters = null);
    List<ReportFieldDefinition> GetAvailableFields(DataSourceType dataSource);
}
