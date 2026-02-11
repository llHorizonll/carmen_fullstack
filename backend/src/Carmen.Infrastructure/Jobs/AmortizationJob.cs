using Carmen.Application.Jobs;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Jobs;

/// <summary>
/// Background job for running prepaid expense amortization calculations.
/// This job creates journal vouchers to spread prepaid expenses over their service period.
/// </summary>
public class AmortizationJob : IAmortizationJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AmortizationJob> _logger;

    public AmortizationJob(
        IServiceProvider serviceProvider,
        ILogger<AmortizationJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task RunMonthlyAmortizationAsync(Guid tenantId, Guid fiscalPeriodId, bool autoPost = false)
    {
        _logger.LogInformation(
            "Starting amortization job for tenant {TenantId}, period {FiscalPeriodId}, autoPost: {AutoPost}",
            tenantId, fiscalPeriodId, autoPost);

        try
        {
            // TODO: Full implementation will query prepaid expense schedules,
            // calculate monthly amortization amounts, and create journal vouchers.
            // For now, this is a stub that logs the action.

            _logger.LogInformation(
                "Amortization job completed for tenant {TenantId}. " +
                "Note: Full implementation pending prepaid expense module.",
                tenantId);

            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Amortization job failed for tenant {TenantId}, period {FiscalPeriodId}",
                tenantId, fiscalPeriodId);
            throw;
        }
    }
}
