using Carmen.Application.DTOs.Integration;

namespace Carmen.Application.Services.Integration;

/// <summary>
/// Low-level client interface for BlueLedger PMS API.
/// Current implementation is a mock; swap with real HTTP client when API is available.
/// </summary>
public interface IBlueLedgerClient
{
    Task<List<BlueLedgerInventoryMovementDto>> GetInventoryMovementsAsync(DateTime fromDate, DateTime toDate);
    Task<List<BlueLedgerExtraCostDto>> GetPendingExtraCostsAsync();
    Task<bool> PostExtraCostToFolioAsync(string folioNumber, string chargeCode, decimal amount, string description);
    Task<List<BlueLedgerReceivingDocumentDto>> GetReceivingDocumentsAsync(DateTime fromDate, DateTime toDate);
    Task<bool> CheckConnectionAsync();
}
