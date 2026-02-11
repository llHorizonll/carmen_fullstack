using Carmen.Application.DTOs.Report;
using Carmen.Application.Services.Report;
using Carmen.Domain.Entities.Report;
using Carmen.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

[ApiController]
[Route("api/v1/tenants/{tenantId:guid}/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IPredefinedReportService _predefinedReportService;
    private readonly IReportTemplateService _templateService;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(
        IPredefinedReportService predefinedReportService,
        IReportTemplateService templateService,
        ILogger<ReportsController> logger)
    {
        _predefinedReportService = predefinedReportService;
        _templateService = templateService;
        _logger = logger;
    }

    // ─── Predefined Reports ──────────────────────────────────────

    [HttpGet("predefined")]
    [RequirePermission("Reports.View")]
    [ProducesResponseType(typeof(List<PredefinedReportInfo>), StatusCodes.Status200OK)]
    public ActionResult<List<PredefinedReportInfo>> GetPredefinedReports()
    {
        var reports = _predefinedReportService.GetAvailableReports();
        return Ok(reports);
    }

    [HttpGet("predefined/{reportType}/parameters")]
    [RequirePermission("Reports.View")]
    [ProducesResponseType(typeof(List<ReportParameterDefinition>), StatusCodes.Status200OK)]
    public ActionResult<List<ReportParameterDefinition>> GetReportParameters(PredefinedReportType reportType)
    {
        var parameters = _predefinedReportService.GetParameters(reportType);
        return Ok(parameters);
    }

    [HttpPost("predefined/{reportType}/preview")]
    [RequirePermission("Reports.View")]
    [ProducesResponseType(typeof(ReportDataSet), StatusCodes.Status200OK)]
    public async Task<ActionResult<ReportDataSet>> PreviewReport(
        PredefinedReportType reportType,
        [FromBody] Dictionary<string, string> parameters)
    {
        var dataSet = await _predefinedReportService.PreviewAsync(reportType, parameters);
        return Ok(dataSet);
    }

    [HttpPost("predefined/{reportType}/generate")]
    [RequirePermission("Reports.Generate")]
    public async Task<IActionResult> GenerateReport(
        PredefinedReportType reportType,
        [FromBody] GenerateReportRequest request)
    {
        var bytes = await _predefinedReportService.GenerateAsync(reportType, request.OutputFormat, request.Parameters);

        var contentType = request.OutputFormat switch
        {
            OutputFormat.Pdf => "application/pdf",
            OutputFormat.Excel => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            _ => "application/octet-stream"
        };

        var extension = request.OutputFormat switch
        {
            OutputFormat.Pdf => "pdf",
            OutputFormat.Excel => "xlsx",
            _ => "bin"
        };

        var fileName = $"{reportType}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.{extension}";

        return File(bytes, contentType, fileName);
    }

    // ─── Data Sources ────────────────────────────────────────────

    [HttpGet("datasources")]
    [RequirePermission("Reports.View")]
    [ProducesResponseType(typeof(List<DataSourceInfo>), StatusCodes.Status200OK)]
    public ActionResult<List<DataSourceInfo>> GetDataSources()
    {
        var sources = Enum.GetValues<DataSourceType>()
            .Select(ds => new DataSourceInfo(ds, ds.ToString()))
            .ToList();
        return Ok(sources);
    }

    [HttpGet("datasources/{dataSource}/fields")]
    [RequirePermission("Reports.View")]
    [ProducesResponseType(typeof(List<ReportFieldDefinition>), StatusCodes.Status200OK)]
    public ActionResult<List<ReportFieldDefinition>> GetDataSourceFields(DataSourceType dataSource)
    {
        var fields = _templateService.GetAvailableFields(dataSource);
        return Ok(fields);
    }

    // ─── Report Templates (CRUD) ────────────────────────────────

    [HttpGet("templates")]
    [RequirePermission("Reports.View")]
    [ProducesResponseType(typeof(List<ReportTemplateListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ReportTemplateListDto>>> GetTemplates()
    {
        var templates = await _templateService.GetTemplatesAsync();
        return Ok(templates);
    }

    [HttpGet("templates/{id:guid}")]
    [RequirePermission("Reports.View")]
    [ProducesResponseType(typeof(ReportTemplateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReportTemplateDto>> GetTemplate(Guid id)
    {
        var template = await _templateService.GetTemplateAsync(id);
        if (template == null) return NotFound();
        return Ok(template);
    }

    [HttpPost("templates")]
    [RequirePermission("Reports.Create")]
    [ProducesResponseType(typeof(ReportTemplateDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<ReportTemplateDto>> CreateTemplate(
        [FromBody] CreateReportTemplateRequest request)
    {
        var template = await _templateService.CreateTemplateAsync(request);
        return CreatedAtAction(nameof(GetTemplate), new { id = template.Id }, template);
    }

    [HttpPut("templates/{id:guid}")]
    [RequirePermission("Reports.Edit")]
    [ProducesResponseType(typeof(ReportTemplateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReportTemplateDto>> UpdateTemplate(
        Guid id, [FromBody] UpdateReportTemplateRequest request)
    {
        try
        {
            var template = await _templateService.UpdateTemplateAsync(id, request);
            return Ok(template);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("templates/{id:guid}")]
    [RequirePermission("Reports.Delete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTemplate(Guid id)
    {
        try
        {
            await _templateService.DeleteTemplateAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    // ─── Custom Report Execution ─────────────────────────────────

    [HttpPost("custom/{templateId:guid}/preview")]
    [RequirePermission("Reports.View")]
    [ProducesResponseType(typeof(ReportDataSet), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReportDataSet>> PreviewCustomReport(
        Guid templateId, [FromBody] Dictionary<string, string>? runtimeFilters = null)
    {
        try
        {
            var dataSet = await _templateService.PreviewAsync(templateId, runtimeFilters);
            return Ok(dataSet);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("custom/{templateId:guid}/generate")]
    [RequirePermission("Reports.Generate")]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GenerateCustomReport(
        Guid templateId, [FromBody] CustomReportGenerateRequest request)
    {
        try
        {
            var bytes = await _templateService.GenerateAsync(templateId, request.OutputFormat, request.RuntimeFilters);

            var contentType = request.OutputFormat switch
            {
                OutputFormat.Pdf => "application/pdf",
                OutputFormat.Excel => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                _ => "application/octet-stream"
            };

            var extension = request.OutputFormat switch
            {
                OutputFormat.Pdf => "pdf",
                OutputFormat.Excel => "xlsx",
                _ => "bin"
            };

            var fileName = $"CustomReport_{DateTime.UtcNow:yyyyMMdd_HHmmss}.{extension}";

            return File(bytes, contentType, fileName);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}

public record DataSourceInfo(DataSourceType Type, string Name);
public record CustomReportGenerateRequest(OutputFormat OutputFormat, Dictionary<string, string>? RuntimeFilters);
