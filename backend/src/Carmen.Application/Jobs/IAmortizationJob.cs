namespace Carmen.Application.Jobs;

/// <summary>
/// Background job interface for prepaid expense amortization processing.
/// </summary>
public interface IAmortizationJob
{
    /// <summary>
    /// Runs monthly amortization for all active prepaid expenses in a tenant.
    /// Creates journal vouchers to expense the monthly portion of prepaid amounts.
    /// </summary>
    /// <param name="tenantId">The tenant ID to process amortization for</param>
    /// <param name="fiscalPeriodId">The fiscal period to run amortization for</param>
    /// <param name="autoPost">If true, automatically posts amortization entries to GL</param>
    Task RunMonthlyAmortizationAsync(Guid tenantId, Guid fiscalPeriodId, bool autoPost = false);
}
