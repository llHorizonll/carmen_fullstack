using Carmen.Application.DTOs.Integration;

namespace Carmen.Application.Services.Integration;

/// <summary>
/// OCR service for extracting structured invoice data from uploaded documents.
/// </summary>
public interface IOcrService
{
    /// <summary>
    /// Process an uploaded invoice image/PDF and extract structured data.
    /// </summary>
    /// <param name="fileBytes">The file content as bytes</param>
    /// <param name="fileName">Original file name (used for MIME type detection)</param>
    /// <returns>Extracted invoice data for user review</returns>
    Task<OcrExtractedInvoiceDto> ProcessInvoiceAsync(byte[] fileBytes, string fileName);

    /// <summary>
    /// Create an AP invoice from OCR-extracted and user-reviewed data.
    /// </summary>
    /// <param name="tenantId">Tenant ID</param>
    /// <param name="request">User-reviewed invoice data</param>
    /// <returns>The created AP invoice ID</returns>
    Task<Guid> CreateInvoiceFromOcrAsync(Guid tenantId, CreateInvoiceFromOcrRequest request);
}
