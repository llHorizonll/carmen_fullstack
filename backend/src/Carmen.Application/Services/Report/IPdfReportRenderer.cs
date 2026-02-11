using Carmen.Application.DTOs.Report;
using Carmen.Domain.Entities.Report;

namespace Carmen.Application.Services.Report;

public interface IPdfReportRenderer
{
    Task<byte[]> RenderAsync(ReportDataSet dataSet, PageOrientation orientation = PageOrientation.Portrait);
}
