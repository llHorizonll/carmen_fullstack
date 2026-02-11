using Carmen.Domain.Entities.Common;

namespace Carmen.Domain.Entities.GL;

/// <summary>
/// Represents a recurring journal voucher template
/// </summary>
public class RecurringVoucher : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public RecurringFrequency Frequency { get; set; } = RecurringFrequency.Monthly;
    public int? CustomIntervalDays { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime NextExecutionDate { get; set; }
    public DateTime? LastExecutionDate { get; set; }
    public bool IsActive { get; set; } = true;

    // Template settings
    public string CurrencyCode { get; set; } = "USD";
    public decimal ExchangeRate { get; set; } = 1;
    public string? Reference { get; set; }
    public decimal TotalDebit { get; set; }
    public decimal TotalCredit { get; set; }

    // Execution tracking
    public int ExecutionCount { get; set; }

    // Navigation properties
    public virtual ICollection<RecurringVoucherLine> Lines { get; set; } = new List<RecurringVoucherLine>();
}

/// <summary>
/// Represents a line item in a recurring voucher template
/// </summary>
public class RecurringVoucherLine : TenantEntity
{
    public Guid RecurringVoucherId { get; set; }
    public int LineNumber { get; set; }
    public Guid AccountId { get; set; }
    public decimal DebitAmount { get; set; }
    public decimal CreditAmount { get; set; }
    public string? Description { get; set; }
    public string? Reference { get; set; }
    public Guid? DepartmentId { get; set; }

    // Navigation properties
    public virtual RecurringVoucher RecurringVoucher { get; set; } = null!;
    public virtual ChartOfAccount Account { get; set; } = null!;
}
