using Carmen.Domain.Entities.Common;
using Carmen.Domain.Entities.Configuration;
using Carmen.Domain.Entities.GL;

namespace Carmen.Domain.Entities.AR;

/// <summary>
/// Represents a customer master record
/// </summary>
public class Customer : TenantEntity
{
    /// <summary>
    /// Unique customer code within the tenant
    /// </summary>
    public string CustomerCode { get; set; } = string.Empty;

    /// <summary>
    /// Customer name (English/default)
    /// </summary>
    public string CustomerName { get; set; } = string.Empty;

    /// <summary>
    /// Customer name in local language
    /// </summary>
    public string? CustomerNameLocal { get; set; }

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
    /// Whether the customer is active
    /// </summary>
    public bool IsActive { get; set; } = true;

    // Payment configuration

    /// <summary>
    /// Default payment term for this customer
    /// </summary>
    public Guid? DefaultPaymentTermId { get; set; }

    /// <summary>
    /// Default currency for transactions
    /// </summary>
    public string CurrencyCode { get; set; } = "USD";

    /// <summary>
    /// Credit limit for this customer
    /// </summary>
    public decimal CreditLimit { get; set; }

    /// <summary>
    /// Current outstanding balance (positive = customer owes us)
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
    /// Default AR account (Accounts Receivable)
    /// </summary>
    public Guid? DefaultArAccountId { get; set; }

    /// <summary>
    /// Default revenue account
    /// </summary>
    public Guid? DefaultRevenueAccountId { get; set; }

    // Bank information (for direct debit)

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
    /// Notes/remarks about the customer
    /// </summary>
    public string? Notes { get; set; }

    // Navigation properties

    public virtual PaymentTerm? DefaultPaymentTerm { get; set; }
    public virtual TaxProfile? DefaultTax1Profile { get; set; }
    public virtual TaxProfile? DefaultTax2Profile { get; set; }
    public virtual TaxProfile? DefaultWhtProfile { get; set; }
    public virtual ChartOfAccount? DefaultArAccount { get; set; }
    public virtual ChartOfAccount? DefaultRevenueAccount { get; set; }
    public virtual ICollection<ArInvoice> Invoices { get; set; } = new List<ArInvoice>();
    public virtual ICollection<ArReceipt> Receipts { get; set; } = new List<ArReceipt>();
}
