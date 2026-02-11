using Carmen.Application.DTOs.Integration;
using Carmen.Application.Services.Integration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Services;

/// <summary>
/// MOCK implementation of BlueLedger PMS client.
/// Replace with real HTTP client when BlueLedger API access is available.
/// </summary>
public class BlueLedgerClient : IBlueLedgerClient
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<BlueLedgerClient> _logger;
    private readonly bool _isEnabled;

    public BlueLedgerClient(IConfiguration configuration, ILogger<BlueLedgerClient> logger)
    {
        _configuration = configuration;
        _logger = logger;
        _isEnabled = _configuration.GetValue<bool>("BlueLedger:Enabled");
    }

    public Task<List<BlueLedgerInventoryMovementDto>> GetInventoryMovementsAsync(DateTime fromDate, DateTime toDate)
    {
        _logger.LogInformation("MOCK: Getting inventory movements from {From} to {To}", fromDate, toDate);

        var movements = new List<BlueLedgerInventoryMovementDto>
        {
            new("INV-2026-0001", DateTime.UtcNow.AddDays(-1), "FOOD-001", "Premium Beef Tenderloin", "MAIN",
                50, 45.00m, 2250.00m, "IN", "PO-2026-0125"),
            new("INV-2026-0002", DateTime.UtcNow.AddDays(-1), "BEV-005", "Champagne Dom Perignon", "BAR",
                12, 180.00m, 2160.00m, "IN", "PO-2026-0126"),
            new("INV-2026-0003", DateTime.UtcNow, "SUPPLY-012", "Cleaning Supplies", "HOUSEKEEPING",
                100, 5.50m, 550.00m, "OUT", "REQ-2026-0089"),
            new("INV-2026-0004", DateTime.UtcNow, "FOOD-015", "Fresh Atlantic Salmon", "KITCHEN",
                30, 62.00m, 1860.00m, "IN", "PO-2026-0127"),
        };

        return Task.FromResult(movements);
    }

    public Task<List<BlueLedgerExtraCostDto>> GetPendingExtraCostsAsync()
    {
        _logger.LogInformation("MOCK: Getting pending extra costs");

        var costs = new List<BlueLedgerExtraCostDto>
        {
            new("CHG-2026-0501", DateTime.UtcNow, "F-2026-1234", "John Smith", "501",
                "LAUNDRY", "Express laundry service", 35.00m, "USD", false),
            new("CHG-2026-0502", DateTime.UtcNow, "F-2026-1235", "Jane Doe", "305",
                "MINIBAR", "Minibar consumption", 45.00m, "USD", false),
            new("CHG-2026-0503", DateTime.UtcNow.AddDays(-1), "F-2026-1236", "Robert Chen", "801",
                "SPA", "Spa treatment - Deep tissue massage", 120.00m, "USD", false),
        };

        return Task.FromResult(costs);
    }

    public Task<bool> PostExtraCostToFolioAsync(string folioNumber, string chargeCode, decimal amount, string description)
    {
        _logger.LogInformation("MOCK: Posting charge {ChargeCode} ({Amount}) to folio {Folio}",
            chargeCode, amount, folioNumber);
        return Task.FromResult(true);
    }

    public Task<List<BlueLedgerReceivingDocumentDto>> GetReceivingDocumentsAsync(DateTime fromDate, DateTime toDate)
    {
        _logger.LogInformation("MOCK: Getting receiving documents from {From} to {To}", fromDate, toDate);

        var documents = new List<BlueLedgerReceivingDocumentDto>
        {
            new("RCV-2026-0045", DateTime.UtcNow.AddDays(-2), "V-001", "ABC Food Suppliers", 5850.00m, "USD",
                new List<BlueLedgerReceivingLineDto>
                {
                    new("FOOD-001", "Premium Beef Tenderloin", 50, "KG", 45.00m, 2250.00m),
                    new("FOOD-015", "Fresh Atlantic Salmon", 30, "KG", 60.00m, 1800.00m),
                    new("FOOD-023", "Organic Vegetables Mix", 120, "KG", 15.00m, 1800.00m),
                }),
            new("RCV-2026-0046", DateTime.UtcNow.AddDays(-1), "V-005", "Premium Beverage Co.", 3960.00m, "USD",
                new List<BlueLedgerReceivingLineDto>
                {
                    new("BEV-005", "Champagne Dom Perignon", 12, "BTL", 180.00m, 2160.00m),
                    new("BEV-012", "Red Wine Bordeaux Reserve", 24, "BTL", 75.00m, 1800.00m),
                }),
        };

        return Task.FromResult(documents);
    }

    public Task<bool> CheckConnectionAsync()
    {
        if (!_isEnabled)
        {
            _logger.LogWarning("BlueLedger integration is disabled in configuration");
            return Task.FromResult(false);
        }

        _logger.LogInformation("MOCK: BlueLedger connection check — OK");
        return Task.FromResult(true);
    }
}
