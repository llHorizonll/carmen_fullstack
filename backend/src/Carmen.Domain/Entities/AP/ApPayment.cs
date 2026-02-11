using Carmen.Domain.Entities.Common;
using Carmen.Domain.Entities.GL;

namespace Carmen.Domain.Entities.AP;

/// <summary>
/// Represents an accounts payable payment
/// </summary>
public class ApPayment : TenantEntity
{
    /// <summary>
    /// System-generated payment number
    /// </summary>
    public string PaymentNumber { get; set; } = string.Empty;

    /// <summary>
    /// Payment date
    /// </summary>
    public DateTime PaymentDate { get; set; }

    /// <summary>
    /// Payment status
    /// </summary>
    public ApPaymentStatus Status { get; set; } = ApPaymentStatus.Draft;

    // Vendor reference

    /// <summary>
    /// Vendor ID
    /// </summary>
    public Guid VendorId { get; set; }

    // Payment details

    /// <summary>
    /// Payment method
    /// </summary>
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.BankTransfer;

    /// <summary>
    /// Check number (if payment by check)
    /// </summary>
    public string? CheckNumber { get; set; }

    /// <summary>
    /// Check date (if payment by check)
    /// </summary>
    public DateTime? CheckDate { get; set; }

    /// <summary>
    /// Bank reference number
    /// </summary>
    public string? BankReference { get; set; }

    // Currency

    /// <summary>
    /// Currency code
    /// </summary>
    public string CurrencyCode { get; set; } = "USD";

    /// <summary>
    /// Exchange rate to base currency
    /// </summary>
    public decimal ExchangeRate { get; set; } = 1;

    // Amount

    /// <summary>
    /// Total payment amount
    /// </summary>
    public decimal TotalAmount { get; set; }

    /// <summary>
    /// Total payment amount in base currency
    /// </summary>
    public decimal TotalAmountBase { get; set; }

    /// <summary>
    /// Allocated amount to invoices
    /// </summary>
    public decimal AllocatedAmount { get; set; }

    /// <summary>
    /// Unallocated amount
    /// </summary>
    public decimal UnallocatedAmount { get; set; }

    // Bank account (cash/bank GL account)

    /// <summary>
    /// Bank/Cash account ID
    /// </summary>
    public Guid BankAccountId { get; set; }

    // Description

    /// <summary>
    /// Payment description
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// External reference
    /// </summary>
    public string? Reference { get; set; }

    /// <summary>
    /// Payee name (if different from vendor)
    /// </summary>
    public string? PayeeName { get; set; }

    // Fiscal period

    /// <summary>
    /// Fiscal period ID
    /// </summary>
    public Guid FiscalPeriodId { get; set; }

    // Approval workflow

    /// <summary>
    /// Date/time when approved
    /// </summary>
    public DateTime? ApprovedAt { get; set; }

    /// <summary>
    /// User who approved
    /// </summary>
    public string? ApprovedBy { get; set; }

    /// <summary>
    /// Date/time when posted to GL
    /// </summary>
    public DateTime? PostedAt { get; set; }

    /// <summary>
    /// User who posted
    /// </summary>
    public string? PostedBy { get; set; }

    /// <summary>
    /// Void reason (if voided)
    /// </summary>
    public string? VoidReason { get; set; }

    // GL Journal Voucher link

    /// <summary>
    /// Linked Journal Voucher ID (when posted)
    /// </summary>
    public Guid? JournalVoucherId { get; set; }

    // Navigation properties

    public virtual Vendor Vendor { get; set; } = null!;
    public virtual ChartOfAccount BankAccount { get; set; } = null!;
    public virtual FiscalPeriod? FiscalPeriod { get; set; }
    public virtual JournalVoucher? JournalVoucher { get; set; }
    public virtual ICollection<ApPaymentLine> Lines { get; set; } = new List<ApPaymentLine>();
}
