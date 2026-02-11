using Carmen.Application.DTOs.Report;

namespace Carmen.Infrastructure.Services.Reports.Predefined;

public interface IPredefinedReportProvider
{
    PredefinedReportType ReportType { get; }
    List<ReportParameterDefinition> GetParameters();
    Task<ReportDataSet> GenerateAsync(Dictionary<string, string> parameters);
}
