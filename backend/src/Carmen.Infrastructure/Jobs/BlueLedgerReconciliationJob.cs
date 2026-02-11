using Carmen.Application.DTOs.Integration;
using Carmen.Application.Jobs;
using Carmen.Application.Services.Integration;
using Carmen.Infrastructure.Data;
using Carmen.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Jobs;

/// <summary>
/// Background job for BlueLedger PMS reconciliation.
/// Creates a tenant-scoped service to ensure proper multi-tenant isolation.
/// </summary>
public class BlueLedgerReconciliationJob : IBlueLedgerReconciliationJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<BlueLedgerReconciliationJob> _logger;

    public BlueLedgerReconciliationJob(
        IServiceProvider serviceProvider,
        ILogger<BlueLedgerReconciliationJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task RunDailyReconciliationAsync(Guid tenantId)
    {
        _logger.LogInformation("Starting BlueLedger daily reconciliation for tenant {TenantId}", tenantId);

        try
        {
            using var scope = _serviceProvider.CreateScope();

            var dbContextOptions = scope.ServiceProvider
                .GetRequiredService<DbContextOptions<CarmenDbContext>>();

            var context = new CarmenDbContext(dbContextOptions, tenantId);

            var client = scope.ServiceProvider
                .GetRequiredService<IBlueLedgerClient>();

            var logger = scope.ServiceProvider
                .GetRequiredService<ILogger<BlueLedgerIntegrationService>>();

            var service = new BlueLedgerIntegrationService(client, context, logger);

            var request = new BlueLedgerReconciliationRequest(DateTime.UtcNow.Date);
            var result = await service.ReconcileDataAsync(tenantId, request);

            if (result.Discrepancies.Count > 0)
            {
                _logger.LogWarning(
                    "BlueLedger reconciliation found {Count} discrepancies for tenant {TenantId}: {Discrepancies}",
                    result.Discrepancies.Count, tenantId, string.Join("; ", result.Discrepancies));
            }
            else
            {
                _logger.LogInformation(
                    "BlueLedger reconciliation completed for tenant {TenantId}: {Movements} movements, {Costs} costs, {Docs} documents",
                    tenantId, result.InventoryMovementsCount, result.ExtraCostsCount, result.ReceivingDocumentsCount);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "BlueLedger reconciliation job failed for tenant {TenantId}", tenantId);
            throw;
        }
    }
}
