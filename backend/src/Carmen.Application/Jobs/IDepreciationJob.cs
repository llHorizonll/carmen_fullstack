namespace Carmen.Application.Jobs;

/// <summary>
/// Background job interface for asset depreciation processing.
/// </summary>
public interface IDepreciationJob
{
    /// <summary>
    /// Runs monthly depreciation calculation for all active assets in a tenant.
    /// </summary>
    /// <param name="tenantId">The tenant ID to process depreciation for</param>
    /// <param name="fiscalPeriodId">The fiscal period to run depreciation for</param>
    /// <param name="autoPost">If true, automatically posts depreciation to GL after calculation</param>
    Task RunMonthlyDepreciationAsync(Guid tenantId, Guid fiscalPeriodId, bool autoPost = false);

    /// <summary>
    /// Posts all pending depreciation schedules for a fiscal period.
    /// </summary>
    /// <param name="tenantId">The tenant ID</param>
    /// <param name="fiscalPeriodId">The fiscal period to post depreciation for</param>
    Task PostAllDepreciationAsync(Guid tenantId, Guid fiscalPeriodId);
}
