namespace Carmen.Application.Jobs;

/// <summary>
/// Background job interface for processing recurring journal vouchers.
/// </summary>
public interface IRecurringVoucherJob
{
    /// <summary>
    /// Processes all recurring vouchers that are due for execution.
    /// Creates journal vouchers from recurring templates and updates next execution dates.
    /// </summary>
    /// <param name="tenantId">The tenant ID to process recurring vouchers for</param>
    /// <param name="processDate">The date to use for processing (usually current date)</param>
    Task ProcessRecurringVouchersAsync(Guid tenantId, DateTime processDate);
}
