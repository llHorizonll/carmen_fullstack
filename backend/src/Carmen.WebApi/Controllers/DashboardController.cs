using Carmen.Application.DTOs.Dashboard;
using Carmen.Application.Services.Dashboard;
using Carmen.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

[ApiController]
[Route("api/v1/tenants/{tenantId:guid}/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(
        IDashboardService dashboardService,
        ILogger<DashboardController> logger)
    {
        _dashboardService = dashboardService;
        _logger = logger;
    }

    [HttpGet("summary")]
    [RequirePermission("Dashboard.View")]
    [ProducesResponseType(typeof(DashboardSummaryDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<DashboardSummaryDto>> GetSummary([FromQuery] DateTime? asOfDate = null)
    {
        var summary = await _dashboardService.GetSummaryAsync(asOfDate);
        return Ok(summary);
    }
}
