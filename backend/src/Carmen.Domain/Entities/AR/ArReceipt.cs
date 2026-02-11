using Carmen.Domain.Entities.Common;
using Carmen.Domain.Entities.GL;

namespace Carmen.Domain.Entities.AR;

/// <summary>
/// Represents an accounts receivable receipt (customer payment received)
/// </summary>
public class ArReceipt : TenantEntity
{
    /// <summary>
    /// System-generated receipt number
    /// </summary>
    public string ReceiptNumber { get; set; } = string.Empty;

    /// <summary>
    /// Receipt date
    /// </summary>
    public DateTime ReceiptDate { get; set; }

    /// <summary>
    /// Receipt status
    /// </summary>
    public ArReceiptStatus Status { get; set; } = ArReceiptStatus.Draft;

    // Customer reference

    /// <summary>
    /// Customer ID
    /// </summary>
    public Guid CustomerId { get; set; }

    // Receipt details

    /// <summary>
    /// Receipt method
    /// </summary>
    public ReceiptMethod ReceiptMethod { get; set; } = ReceiptMethod.BankTransfer;

    /// <summary>
    /// Check number (if receipt by check)
    /// </summary>
    public string? CheckNumber { get; set; }

    /// <summary>
    /// Check date (if receipt by check)
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
    /// Total receipt amount
    /// </summary>
    public decimal TotalAmount { get; set; }

    /// <summary>
    /// Total receipt amount in base currency
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
    /// Receipt description
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// External reference
    /// </summary>
    public string? Reference { get; set; }

    /// <summary>
    /// Payer name (if different from customer)
    /// </summary>
    public string? PayerName { get; set; }

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

    public virtual Customer Customer { get; set; } = null!;
    public virtual ChartOfAccount BankAccount { get; set; } = null!;
    public virtual FiscalPeriod? FiscalPeriod { get; set; }
    public virtual JournalVoucher? JournalVoucher { get; set; }
    public virtual ICollection<ArReceiptLine> Lines { get; set; } = new List<ArReceiptLine>();
}
