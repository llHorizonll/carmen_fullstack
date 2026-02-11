namespace Carmen.Domain.Entities.GL;

/// <summary>
/// Frequency for recurring voucher execution
/// </summary>
public enum RecurringFrequency
{
    Monthly = 1,
    Quarterly = 2,
    SemiAnnually = 3,
    Annually = 4,
    Custom = 99
}
