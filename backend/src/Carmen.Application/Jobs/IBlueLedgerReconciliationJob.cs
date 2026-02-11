namespace Carmen.Application.Jobs;

/// <summary>
/// Background job interface for BlueLedger PMS reconciliation.
/// </summary>
public interface IBlueLedgerReconciliationJob
{
    /// <summary>
    /// Runs daily reconciliation between BlueLedger PMS and Carmen.
    /// Checks for discrepancies in inventory, extra costs, and receiving documents.
    /// </summary>
    /// <param name="tenantId">The tenant ID to reconcile</param>
    Task RunDailyReconciliationAsync(Guid tenantId);
}
