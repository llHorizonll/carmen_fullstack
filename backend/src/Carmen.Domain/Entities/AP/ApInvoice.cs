using Carmen.Domain.Entities.Common;
using Carmen.Domain.Entities.Configuration;
using Carmen.Domain.Entities.GL;

namespace Carmen.Domain.Entities.AP;

/// <summary>
/// Represents an accounts payable invoice (vendor invoice)
/// </summary>
public class ApInvoice : TenantEntity
{
    /// <summary>
    /// System-generated invoice number
    /// </summary>
    public string InvoiceNumber { get; set; } = string.Empty;

    /// <summary>
    /// Vendor's invoice number (external reference)
    /// </summary>
    public string? VendorInvoiceNumber { get; set; }

    /// <summary>
    /// Invoice date
    /// </summary>
    public DateTime InvoiceDate { get; set; }

    /// <summary>
    /// Payment due date
    /// </summary>
    public DateTime DueDate { get; set; }

    /// <summary>
    /// Invoice status
    /// </summary>
    public ApInvoiceStatus Status { get; set; } = ApInvoiceStatus.Draft;

    // Vendor reference

    /// <summary>
    /// Vendor ID
    /// </summary>
    public Guid VendorId { get; set; }

    // Currency

    /// <summary>
    /// Currency code
    /// </summary>
    public string CurrencyCode { get; set; } = "USD";

    /// <summary>
    /// Exchange rate to base currency
    /// </summary>
    public decimal ExchangeRate { get; set; } = 1;

    // Amounts (before tax)

    /// <summary>
    /// Subtotal before taxes
    /// </summary>
    public decimal SubTotal { get; set; }

    // Three-tier tax structure

    /// <summary>
    /// Tax1 profile (VAT/GST)
    /// </summary>
    public Guid? Tax1ProfileId { get; set; }

    /// <summary>
    /// Tax1 amount (VAT/GST)
    /// </summary>
    public decimal Tax1Amount { get; set; }

    /// <summary>
    /// Tax2 profile (Service Tax)
    /// </summary>
    public Guid? Tax2ProfileId { get; set; }

    /// <summary>
    /// Tax2 amount (Service Tax)
    /// </summary>
    public decimal Tax2Amount { get; set; }

    /// <summary>
    /// Withholding Tax profile
    /// </summary>
    public Guid? WhtProfileId { get; set; }

    /// <summary>
    /// Withholding Tax amount
    /// </summary>
    public decimal WhtAmount { get; set; }

    // Final amounts

    /// <summary>
    /// Total amount (SubTotal + Tax1 + Tax2)
    /// </summary>
    public decimal TotalAmount { get; set; }

    /// <summary>
    /// Net amount payable (TotalAmount - WHT)
    /// </summary>
    public decimal NetAmount { get; set; }

    /// <summary>
    /// Amount paid so far
    /// </summary>
    public decimal PaidAmount { get; set; }

    /// <summary>
    /// Remaining balance (NetAmount - PaidAmount)
    /// </summary>
    public decimal BalanceAmount { get; set; }

    // Base currency amounts

    /// <summary>
    /// Subtotal in base currency
    /// </summary>
    public decimal SubTotalBase { get; set; }

    /// <summary>
    /// Total amount in base currency
    /// </summary>
    public decimal TotalAmountBase { get; set; }

    /// <summary>
    /// Net amount in base currency
    /// </summary>
    public decimal NetAmountBase { get; set; }

    // Payment terms

    /// <summary>
    /// Payment term ID
    /// </summary>
    public Guid? PaymentTermId { get; set; }

    // Description

    /// <summary>
    /// Invoice description
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// External reference
    /// </summary>
    public string? Reference { get; set; }

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
    /// Rejection reason (if rejected)
    /// </summary>
    public string? RejectionReason { get; set; }

    /// <summary>
    /// Void reason (if voided)
    /// </summary>
    public string? VoidReason { get; set; }

    // GL Journal Voucher link

    /// <summary>
    /// Linked Journal Voucher ID (when posted)
    /// </summary>
    public Guid? JournalVoucherId { get; set; }

    /// <summary>
    /// Default AP account for this invoice
    /// </summary>
    public Guid? ApAccountId { get; set; }

    // Navigation properties

    public virtual Vendor Vendor { get; set; } = null!;
    public virtual PaymentTerm? PaymentTerm { get; set; }
    public virtual TaxProfile? Tax1Profile { get; set; }
    public virtual TaxProfile? Tax2Profile { get; set; }
    public virtual TaxProfile? WhtProfile { get; set; }
    public virtual FiscalPeriod? FiscalPeriod { get; set; }
    public virtual JournalVoucher? JournalVoucher { get; set; }
    public virtual ChartOfAccount? ApAccount { get; set; }
    public virtual ICollection<ApInvoiceLine> Lines { get; set; } = new List<ApInvoiceLine>();
    public virtual ICollection<ApPaymentLine> PaymentLines { get; set; } = new List<ApPaymentLine>();
}
