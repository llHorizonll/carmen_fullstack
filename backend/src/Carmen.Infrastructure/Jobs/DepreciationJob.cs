using Carmen.Application.DTOs.Asset;
using Carmen.Application.Interfaces;
using Carmen.Application.Jobs;
using Carmen.Application.Services.Asset;
using Carmen.Infrastructure.Data;
using Carmen.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Jobs;

/// <summary>
/// Background job for running asset depreciation calculations.
/// This job creates a tenant-scoped DbContext to ensure proper multi-tenant isolation.
/// </summary>
public class DepreciationJob : IDepreciationJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DepreciationJob> _logger;

    public DepreciationJob(
        IServiceProvider serviceProvider,
        ILogger<DepreciationJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task RunMonthlyDepreciationAsync(Guid tenantId, Guid fiscalPeriodId, bool autoPost = false)
    {
        _logger.LogInformation(
            "Starting depreciation job for tenant {TenantId}, period {FiscalPeriodId}, autoPost: {AutoPost}",
            tenantId, fiscalPeriodId, autoPost);

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var depreciationService = CreateTenantScopedService(scope, tenantId);

            var request = new RunDepreciationRequest(fiscalPeriodId, autoPost);
            var result = await depreciationService.RunMonthlyDepreciationAsync(request);

            _logger.LogInformation(
                "Depreciation job completed for tenant {TenantId}. Created {Count} schedules, AutoPosted: {AutoPost}",
                tenantId, result.Count, autoPost);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Depreciation job failed for tenant {TenantId}, period {FiscalPeriodId}",
                tenantId, fiscalPeriodId);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task PostAllDepreciationAsync(Guid tenantId, Guid fiscalPeriodId)
    {
        _logger.LogInformation(
            "Starting post all depreciation job for tenant {TenantId}, period {FiscalPeriodId}",
            tenantId, fiscalPeriodId);

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var depreciationService = CreateTenantScopedService(scope, tenantId);

            var postedCount = await depreciationService.PostAllDepreciationAsync(fiscalPeriodId);

            _logger.LogInformation(
                "Post all depreciation job completed for tenant {TenantId}. Posted {Count} schedules",
                tenantId, postedCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Post all depreciation job failed for tenant {TenantId}, period {FiscalPeriodId}",
                tenantId, fiscalPeriodId);
            throw;
        }
    }

    /// <summary>
    /// Creates a tenant-scoped depreciation service.
    /// This ensures that all database operations are filtered by the correct tenant.
    /// </summary>
    private IDepreciationService CreateTenantScopedService(IServiceScope scope, Guid tenantId)
    {
        var dbContextOptions = scope.ServiceProvider
            .GetRequiredService<DbContextOptions<CarmenDbContext>>();

        // Create tenant-scoped DbContext
        var context = new CarmenDbContext(dbContextOptions, tenantId);

        var currentUserService = scope.ServiceProvider
            .GetRequiredService<ICurrentUserService>();

        var logger = scope.ServiceProvider
            .GetRequiredService<ILogger<DepreciationService>>();

        return new DepreciationService(context, currentUserService, logger);
    }
}
