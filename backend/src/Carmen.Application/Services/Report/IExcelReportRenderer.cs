using Carmen.Application.DTOs.Report;

namespace Carmen.Application.Services.Report;

public interface IExcelReportRenderer
{
    Task<byte[]> RenderAsync(ReportDataSet dataSet);
}
