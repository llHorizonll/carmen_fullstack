using Carmen.Application.DTOs.Integration;
using Carmen.Application.Services.Integration;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Services;

public class BlueLedgerIntegrationService : IBlueLedgerIntegrationService
{
    private readonly IBlueLedgerClient _client;
    private readonly CarmenDbContext _context;
    private readonly ILogger<BlueLedgerIntegrationService> _logger;

    public BlueLedgerIntegrationService(
        IBlueLedgerClient client,
        CarmenDbContext context,
        ILogger<BlueLedgerIntegrationService> logger)
    {
        _client = client;
        _context = context;
        _logger = logger;
    }

    public async Task<PostInventoryToGlResponse> PostInventoryToGlAsync(Guid tenantId, PostInventoryToGlRequest request)
    {
        _logger.LogInformation("Posting inventory movements to GL for tenant {TenantId}: {From} to {To}",
            tenantId, request.FromDate, request.ToDate);

        var errors = new List<string>();

        try
        {
            var movements = await _client.GetInventoryMovementsAsync(request.FromDate, request.ToDate);

            if (movements.Count == 0)
            {
                return new PostInventoryToGlResponse(0, null, 0, new List<string> { "No inventory movements found for the specified period." });
            }

            var totalAmount = movements.Sum(m => m.TotalCost);

            // In a real implementation, this would create a JournalVoucher with lines
            // mapping warehouse codes to GL accounts. For the mock, we simulate success.
            _logger.LogInformation("Processed {Count} inventory movements totaling {Amount:C}",
                movements.Count, totalAmount);

            // Generate a mock JV ID to represent the created journal voucher
            var mockJvId = Guid.NewGuid();

            return new PostInventoryToGlResponse(movements.Count, mockJvId, totalAmount, errors);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to post inventory movements to GL for tenant {TenantId}", tenantId);
            errors.Add($"Failed to process inventory movements: {ex.Message}");
            return new PostInventoryToGlResponse(0, null, 0, errors);
        }
    }

    public async Task<PostExtraCostResponse> PostExtraCostAsync(Guid tenantId, PostExtraCostRequest request)
    {
        _logger.LogInformation("Posting extra cost {ChargeId} for tenant {TenantId}", request.ChargeId, tenantId);

        try
        {
            // Verify the GL account exists
            var account = await _context.ChartOfAccounts
                .FirstOrDefaultAsync(a => a.Id == request.AccountId && a.TenantId == tenantId);

            if (account == null)
            {
                return new PostExtraCostResponse(false, request.ChargeId, "", 0, "GL account not found.");
            }

            // Get the specific charge from BlueLedger
            var pendingCosts = await _client.GetPendingExtraCostsAsync();
            var charge = pendingCosts.FirstOrDefault(c => c.ChargeId == request.ChargeId);

            if (charge == null)
            {
                return new PostExtraCostResponse(false, request.ChargeId, "", 0, "Charge not found in BlueLedger.");
            }

            // Post back to BlueLedger PMS
            var posted = await _client.PostExtraCostToFolioAsync(
                charge.FolioNumber, charge.ChargeCode, charge.Amount, charge.Description);

            if (!posted)
            {
                return new PostExtraCostResponse(false, request.ChargeId, charge.FolioNumber, charge.Amount,
                    "Failed to post charge to BlueLedger folio.");
            }

            _logger.LogInformation("Successfully posted extra cost {ChargeId} ({Amount:C}) to folio {Folio}",
                request.ChargeId, charge.Amount, charge.FolioNumber);

            return new PostExtraCostResponse(true, request.ChargeId, charge.FolioNumber, charge.Amount, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to post extra cost {ChargeId} for tenant {TenantId}",
                request.ChargeId, tenantId);
            return new PostExtraCostResponse(false, request.ChargeId, "", 0, ex.Message);
        }
    }

    public async Task<ImportReceivingDocumentResponse> ImportReceivingDocumentAsync(
        Guid tenantId, ImportReceivingDocumentRequest request)
    {
        _logger.LogInformation("Importing receiving document {ReceivingId} for tenant {TenantId}",
            request.ReceivingId, tenantId);

        try
        {
            // Get receiving documents from BlueLedger
            var documents = await _client.GetReceivingDocumentsAsync(
                DateTime.UtcNow.AddDays(-30), DateTime.UtcNow);

            var document = documents.FirstOrDefault(d => d.ReceivingId == request.ReceivingId);

            if (document == null)
            {
                return new ImportReceivingDocumentResponse(false, null, null,
                    "Receiving document not found in BlueLedger.");
            }

            // Look up vendor by code
            var vendor = await _context.Vendors
                .FirstOrDefaultAsync(v => v.TenantId == tenantId && v.VendorCode == document.VendorCode);

            if (vendor == null)
            {
                return new ImportReceivingDocumentResponse(false, null, null,
                    $"Vendor with code '{document.VendorCode}' not found. Please create the vendor first.");
            }

            // In a real implementation, this would call IApInvoiceService.CreateInvoiceAsync
            // to create a draft AP invoice from the receiving document lines.
            // For the mock, we simulate success.
            var mockInvoiceId = Guid.NewGuid();
            var invoiceNumber = $"AP-BL-{document.ReceivingId}";

            _logger.LogInformation(
                "Created AP invoice {InvoiceNumber} from receiving document {ReceivingId} for vendor {VendorName}",
                invoiceNumber, request.ReceivingId, document.VendorName);

            return new ImportReceivingDocumentResponse(true, mockInvoiceId, invoiceNumber, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to import receiving document {ReceivingId} for tenant {TenantId}",
                request.ReceivingId, tenantId);
            return new ImportReceivingDocumentResponse(false, null, null, ex.Message);
        }
    }

    public async Task<BlueLedgerReconciliationResponse> ReconcileDataAsync(
        Guid tenantId, BlueLedgerReconciliationRequest request)
    {
        _logger.LogInformation("Running BlueLedger reconciliation for tenant {TenantId} on {Date}",
            tenantId, request.ReconciliationDate);

        var discrepancies = new List<string>();

        try
        {
            var fromDate = request.ReconciliationDate.Date;
            var toDate = fromDate.AddDays(1);

            var movements = await _client.GetInventoryMovementsAsync(fromDate, toDate);
            var extraCosts = await _client.GetPendingExtraCostsAsync();
            var receivingDocs = await _client.GetReceivingDocumentsAsync(fromDate, toDate);

            // Check for unposted extra costs
            var unpostedCosts = extraCosts.Where(c => !c.IsPosted).ToList();
            if (unpostedCosts.Any())
            {
                discrepancies.Add($"{unpostedCosts.Count} extra cost(s) pending posting to folios.");
            }

            // Check for receiving documents without matching vendors
            foreach (var doc in receivingDocs)
            {
                var vendorExists = await _context.Vendors
                    .AnyAsync(v => v.TenantId == tenantId && v.VendorCode == doc.VendorCode);

                if (!vendorExists)
                {
                    discrepancies.Add($"Receiving document {doc.ReceivingId}: vendor '{doc.VendorCode}' not found in Carmen.");
                }
            }

            _logger.LogInformation(
                "Reconciliation completed: {Movements} movements, {Costs} extra costs, {Docs} receiving docs, {Discrepancies} discrepancies",
                movements.Count, extraCosts.Count, receivingDocs.Count, discrepancies.Count);

            return new BlueLedgerReconciliationResponse(
                request.ReconciliationDate,
                movements.Count,
                extraCosts.Count,
                receivingDocs.Count,
                discrepancies);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Reconciliation failed for tenant {TenantId}", tenantId);
            discrepancies.Add($"Reconciliation error: {ex.Message}");
            return new BlueLedgerReconciliationResponse(request.ReconciliationDate, 0, 0, 0, discrepancies);
        }
    }

    public async Task<BlueLedgerStatusDto> GetIntegrationStatusAsync(Guid tenantId)
    {
        _logger.LogInformation("Getting BlueLedger integration status for tenant {TenantId}", tenantId);

        try
        {
            var isConnected = await _client.CheckConnectionAsync();

            if (!isConnected)
            {
                return new BlueLedgerStatusDto(false, null, null, 0, 0, 0,
                    "BlueLedger integration is disabled or unreachable.");
            }

            // Get current counts
            var movements = await _client.GetInventoryMovementsAsync(
                DateTime.UtcNow.AddDays(-7), DateTime.UtcNow);
            var extraCosts = await _client.GetPendingExtraCostsAsync();
            var receivingDocs = await _client.GetReceivingDocumentsAsync(
                DateTime.UtcNow.AddDays(-7), DateTime.UtcNow);

            return new BlueLedgerStatusDto(
                true,
                "mock://blueledger-api",
                DateTime.UtcNow,
                movements.Count,
                extraCosts.Count(c => !c.IsPosted),
                receivingDocs.Count,
                null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get BlueLedger status for tenant {TenantId}", tenantId);
            return new BlueLedgerStatusDto(false, null, null, 0, 0, 0, ex.Message);
        }
    }
}
