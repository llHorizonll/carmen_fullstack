using Carmen.Application.DTOs.Integration;
using Carmen.Application.Services.Integration;
using Carmen.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// OCR endpoints for invoice scanning and processing
/// </summary>
[ApiController]
[Route("api/v1/tenants/{tenantId:guid}/ap/invoices/ocr")]
[Authorize]
public class OcrController : ControllerBase
{
    private readonly IOcrService _ocrService;
    private readonly ILogger<OcrController> _logger;

    private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".pdf" };
    private const long MaxFileSize = 10 * 1024 * 1024; // 10 MB

    public OcrController(
        IOcrService ocrService,
        ILogger<OcrController> logger)
    {
        _ocrService = ocrService;
        _logger = logger;
    }

    /// <summary>
    /// Upload an invoice image/PDF for OCR processing
    /// </summary>
    [HttpPost("upload")]
    [RequirePermission("AP.Invoice.Create")]
    [ProducesResponseType(typeof(OcrExtractedInvoiceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [RequestSizeLimit(MaxFileSize)]
    public async Task<ActionResult<OcrExtractedInvoiceDto>> UploadForOcr(
        [FromRoute] Guid tenantId,
        IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded." });
        }

        if (file.Length > MaxFileSize)
        {
            return BadRequest(new { message = "File size exceeds the 10 MB limit." });
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            return BadRequest(new { message = $"File type '{extension}' is not supported. Allowed: JPG, PNG, PDF." });
        }

        try
        {
            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            var fileBytes = memoryStream.ToArray();

            var result = await _ocrService.ProcessInvoiceAsync(fileBytes, file.FileName);

            _logger.LogInformation(
                "OCR upload processed for tenant {TenantId}: {FileName}, confidence: {Confidence:P0}",
                tenantId, file.FileName, result.Confidence);

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogError(ex, "OCR processing failed for tenant {TenantId}", tenantId);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Create an AP invoice from OCR-extracted data (after user review)
    /// </summary>
    [HttpPost("create")]
    [RequirePermission("AP.Invoice.Create")]
    [ProducesResponseType(typeof(object), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> CreateFromOcr(
        [FromRoute] Guid tenantId,
        [FromBody] CreateInvoiceFromOcrRequest request)
    {
        try
        {
            var invoiceId = await _ocrService.CreateInvoiceFromOcrAsync(tenantId, request);

            _logger.LogInformation(
                "Created AP invoice {InvoiceId} from OCR for tenant {TenantId}",
                invoiceId, tenantId);

            return CreatedAtRoute(
                routeName: null,
                routeValues: new { tenantId, id = invoiceId },
                value: new { id = invoiceId });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
