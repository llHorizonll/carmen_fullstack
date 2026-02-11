using Carmen.Application.DTOs.Dashboard;

namespace Carmen.Application.Services.Dashboard;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync(DateTime? asOfDate = null);
}
