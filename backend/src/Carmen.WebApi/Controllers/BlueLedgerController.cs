using Carmen.Application.DTOs.Integration;
using Carmen.Application.Jobs;
using Carmen.Application.Services.Integration;
using Carmen.WebApi.Authorization;
using Hangfire;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// BlueLedger PMS integration endpoints
/// </summary>
[ApiController]
[Route("api/v1/tenants/{tenantId:guid}/integration/blueledger")]
[Authorize]
public class BlueLedgerController : ControllerBase
{
    private readonly IBlueLedgerIntegrationService _integrationService;
    private readonly IBackgroundJobClient _backgroundJobClient;
    private readonly ILogger<BlueLedgerController> _logger;

    public BlueLedgerController(
        IBlueLedgerIntegrationService integrationService,
        IBackgroundJobClient backgroundJobClient,
        ILogger<BlueLedgerController> logger)
    {
        _integrationService = integrationService;
        _backgroundJobClient = backgroundJobClient;
        _logger = logger;
    }

    /// <summary>
    /// Get BlueLedger integration status
    /// </summary>
    [HttpGet("status")]
    [ProducesResponseType(typeof(BlueLedgerStatusDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<BlueLedgerStatusDto>> GetStatus([FromRoute] Guid tenantId)
    {
        var status = await _integrationService.GetIntegrationStatusAsync(tenantId);
        return Ok(status);
    }

    /// <summary>
    /// Post inventory movements to GL as a journal voucher
    /// </summary>
    [HttpPost("inventory/post-to-gl")]
    [RequirePermission("GL.JournalVoucher.Create")]
    [ProducesResponseType(typeof(PostInventoryToGlResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PostInventoryToGlResponse>> PostInventoryToGl(
        [FromRoute] Guid tenantId,
        [FromBody] PostInventoryToGlRequest request)
    {
        try
        {
            var result = await _integrationService.PostInventoryToGlAsync(tenantId, request);

            if (result.Errors.Count > 0 && result.JournalVoucherId == null)
            {
                return BadRequest(result);
            }

            _logger.LogInformation(
                "Posted {Count} inventory movements to GL for tenant {TenantId}",
                result.MovementsProcessed, tenantId);

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Post an extra cost charge to a guest folio
    /// </summary>
    [HttpPost("extra-costs/post")]
    [RequirePermission("AP.Invoice.Create")]
    [ProducesResponseType(typeof(PostExtraCostResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PostExtraCostResponse>> PostExtraCost(
        [FromRoute] Guid tenantId,
        [FromBody] PostExtraCostRequest request)
    {
        try
        {
            var result = await _integrationService.PostExtraCostAsync(tenantId, request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Import a receiving document as an AP invoice
    /// </summary>
    [HttpPost("receiving/import")]
    [RequirePermission("AP.Invoice.Create")]
    [ProducesResponseType(typeof(ImportReceivingDocumentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ImportReceivingDocumentResponse>> ImportReceivingDocument(
        [FromRoute] Guid tenantId,
        [FromBody] ImportReceivingDocumentRequest request)
    {
        try
        {
            var result = await _integrationService.ImportReceivingDocumentAsync(tenantId, request);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            _logger.LogInformation(
                "Imported receiving document {ReceivingId} as invoice {InvoiceNumber} for tenant {TenantId}",
                request.ReceivingId, result.InvoiceNumber, tenantId);

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Run reconciliation between BlueLedger and Carmen
    /// </summary>
    [HttpPost("reconcile")]
    [ProducesResponseType(typeof(BlueLedgerReconciliationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<BlueLedgerReconciliationResponse>> Reconcile(
        [FromRoute] Guid tenantId,
        [FromBody] BlueLedgerReconciliationRequest request)
    {
        try
        {
            var result = await _integrationService.ReconcileDataAsync(tenantId, request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Enqueue a background reconciliation job
    /// </summary>
    [HttpPost("reconcile/schedule")]
    [ProducesResponseType(typeof(object), StatusCodes.Status202Accepted)]
    public ActionResult ScheduleReconciliation([FromRoute] Guid tenantId)
    {
        var jobId = _backgroundJobClient.Enqueue<IBlueLedgerReconciliationJob>(
            job => job.RunDailyReconciliationAsync(tenantId));

        _logger.LogInformation("Scheduled BlueLedger reconciliation job {JobId} for tenant {TenantId}",
            jobId, tenantId);

        return Accepted(new { jobId, message = "Reconciliation job has been scheduled." });
    }
}
