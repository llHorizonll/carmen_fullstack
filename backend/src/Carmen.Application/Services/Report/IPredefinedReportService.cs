using Carmen.Application.DTOs.Report;
using Carmen.Domain.Entities.Report;

namespace Carmen.Application.Services.Report;

public interface IPredefinedReportService
{
    List<PredefinedReportInfo> GetAvailableReports();
    List<ReportParameterDefinition> GetParameters(PredefinedReportType reportType);
    Task<ReportDataSet> PreviewAsync(PredefinedReportType reportType, Dictionary<string, string> parameters);
    Task<byte[]> GenerateAsync(PredefinedReportType reportType, OutputFormat format, Dictionary<string, string> parameters);
}
