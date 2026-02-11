using Carmen.Domain.Entities.Common;
using Carmen.Domain.Entities.Configuration;
using Carmen.Domain.Entities.GL;

namespace Carmen.Domain.Entities.AP;

/// <summary>
/// Represents a vendor (supplier) master record
/// </summary>
public class Vendor : TenantEntity
{
    /// <summary>
    /// Unique vendor code within the tenant
    /// </summary>
    public string VendorCode { get; set; } = string.Empty;

    /// <summary>
    /// Vendor name (English/default)
    /// </summary>
    public string VendorName { get; set; } = string.Empty;

    /// <summary>
    /// Vendor name in local language
    /// </summary>
    public string? VendorNameLocal { get; set; }

    /// <summary>
    /// Primary contact person
    /// </summary>
    public string? ContactPerson { get; set; }

    /// <summary>
    /// Email address
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// Phone number
    /// </summary>
    public string? Phone { get; set; }

    /// <summary>
    /// Fax number
    /// </summary>
    public string? Fax { get; set; }

    /// <summary>
    /// Street address
    /// </summary>
    public string? Address { get; set; }

    /// <summary>
    /// City
    /// </summary>
    public string? City { get; set; }

    /// <summary>
    /// State/Province
    /// </summary>
    public string? State { get; set; }

    /// <summary>
    /// Postal/ZIP code
    /// </summary>
    public string? PostalCode { get; set; }

    /// <summary>
    /// Country
    /// </summary>
    public string? Country { get; set; }

    /// <summary>
    /// Tax identification number
    /// </summary>
    public string? TaxId { get; set; }

    /// <summary>
    /// Whether the vendor is active
    /// </summary>
    public bool IsActive { get; set; } = true;

    // Payment configuration

    /// <summary>
    /// Default payment term for this vendor
    /// </summary>
    public Guid? DefaultPaymentTermId { get; set; }

    /// <summary>
    /// Default currency for transactions
    /// </summary>
    public string CurrencyCode { get; set; } = "USD";

    /// <summary>
    /// Credit limit for this vendor
    /// </summary>
    public decimal CreditLimit { get; set; }

    /// <summary>
    /// Current outstanding balance
    /// </summary>
    public decimal CurrentBalance { get; set; }

    // Tax configuration

    /// <summary>
    /// Default Tax1 profile (VAT/GST)
    /// </summary>
    public Guid? DefaultTax1ProfileId { get; set; }

    /// <summary>
    /// Default Tax2 profile (Service Tax)
    /// </summary>
    public Guid? DefaultTax2ProfileId { get; set; }

    /// <summary>
    /// Default Withholding Tax profile
    /// </summary>
    public Guid? DefaultWhtProfileId { get; set; }

    // GL Account defaults

    /// <summary>
    /// Default AP account (Accounts Payable)
    /// </summary>
    public Guid? DefaultApAccountId { get; set; }

    /// <summary>
    /// Default expense account
    /// </summary>
    public Guid? DefaultExpenseAccountId { get; set; }

    // Bank information

    /// <summary>
    /// Bank name
    /// </summary>
    public string? BankName { get; set; }

    /// <summary>
    /// Bank account number
    /// </summary>
    public string? BankAccountNumber { get; set; }

    /// <summary>
    /// Bank branch
    /// </summary>
    public string? BankBranch { get; set; }

    /// <summary>
    /// Bank SWIFT/BIC code
    /// </summary>
    public string? BankSwiftCode { get; set; }

    /// <summary>
    /// Notes/remarks about the vendor
    /// </summary>
    public string? Notes { get; set; }

    // Navigation properties

    public virtual PaymentTerm? DefaultPaymentTerm { get; set; }
    public virtual TaxProfile? DefaultTax1Profile { get; set; }
    public virtual TaxProfile? DefaultTax2Profile { get; set; }
    public virtual TaxProfile? DefaultWhtProfile { get; set; }
    public virtual ChartOfAccount? DefaultApAccount { get; set; }
    public virtual ChartOfAccount? DefaultExpenseAccount { get; set; }
    public virtual ICollection<ApInvoice> Invoices { get; set; } = new List<ApInvoice>();
    public virtual ICollection<ApPayment> Payments { get; set; } = new List<ApPayment>();
}
