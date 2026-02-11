using Carmen.Application.DTOs.Report;
using Carmen.Domain.Entities.Report;

namespace Carmen.Application.Services.Report;

public interface IReportDataProvider
{
    DataSourceType DataSource { get; }
    List<ReportFieldDefinition> GetAvailableFields();
    Task<ReportDataSet> ExecuteQueryAsync(ReportQueryRequest request);
}
