using Carmen.Application.DTOs.Integration;

namespace Carmen.Application.Services.Integration;

/// <summary>
/// Business logic service for BlueLedger integration.
/// Coordinates between BlueLedger client and Carmen modules (GL, AP).
/// </summary>
public interface IBlueLedgerIntegrationService
{
    Task<PostInventoryToGlResponse> PostInventoryToGlAsync(Guid tenantId, PostInventoryToGlRequest request);
    Task<PostExtraCostResponse> PostExtraCostAsync(Guid tenantId, PostExtraCostRequest request);
    Task<ImportReceivingDocumentResponse> ImportReceivingDocumentAsync(Guid tenantId, ImportReceivingDocumentRequest request);
    Task<BlueLedgerReconciliationResponse> ReconcileDataAsync(Guid tenantId, BlueLedgerReconciliationRequest request);
    Task<BlueLedgerStatusDto> GetIntegrationStatusAsync(Guid tenantId);
}
