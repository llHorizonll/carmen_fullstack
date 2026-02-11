using Carmen.Domain.Entities.Common;

namespace Carmen.Domain.Entities.GL;

/// <summary>
/// Document status enumeration
/// </summary>
public enum DocumentStatus
{
    Draft = 0,
    Pending = 1,
    Approved = 2,
    Rejected = 3,
    Posted = 4,
    Void = 5
}

/// <summary>
/// Voucher type enumeration
/// </summary>
public enum VoucherType
{
    General = 1,
    Recurring = 2,
    Template = 3,
    Amortization = 4,
    Allocation = 5,
    Reversal = 6
}

/// <summary>
/// Represents a journal voucher (accounting transaction)
/// </summary>
public class JournalVoucher : TenantEntity
{
    public string VoucherNumber { get; set; } = string.Empty;
    public DateTime VoucherDate { get; set; }
    public DateTime PostingDate { get; set; }
    public VoucherType VoucherType { get; set; } = VoucherType.General;
    public DocumentStatus Status { get; set; } = DocumentStatus.Draft;
    public string? Description { get; set; }
    public string? Reference { get; set; }
    public string CurrencyCode { get; set; } = "USD";
    public decimal ExchangeRate { get; set; } = 1;
    public decimal TotalDebit { get; set; }
    public decimal TotalCredit { get; set; }

    // Fiscal period reference
    public Guid FiscalPeriodId { get; set; }

    // Approval workflow
    public DateTime? ApprovedAt { get; set; }
    public string? ApprovedBy { get; set; }
    public DateTime? PostedAt { get; set; }
    public string? PostedBy { get; set; }

    // Reversal tracking
    public Guid? ReversalOfId { get; set; }
    public Guid? ReversedById { get; set; }

    // Navigation properties
    public virtual ICollection<JournalVoucherLine> Lines { get; set; } = new List<JournalVoucherLine>();
}

/// <summary>
/// Represents a line item in a journal voucher
/// </summary>
public class JournalVoucherLine : TenantEntity
{
    public Guid JournalVoucherId { get; set; }
    public int LineNumber { get; set; }
    public Guid AccountId { get; set; }
    public decimal DebitAmount { get; set; }
    public decimal CreditAmount { get; set; }
    public decimal DebitAmountBase { get; set; }
    public decimal CreditAmountBase { get; set; }
    public string? Description { get; set; }
    public string? Reference { get; set; }

    // Cost center / Department
    public Guid? DepartmentId { get; set; }

    // Navigation properties
    public virtual JournalVoucher JournalVoucher { get; set; } = null!;
    public virtual ChartOfAccount Account { get; set; } = null!;
}
