using Carmen.Domain.Entities.Common;

namespace Carmen.Domain.Entities.Configuration;

/// <summary>
/// Represents payment terms for invoices
/// </summary>
public class PaymentTerm : TenantEntity
{
    /// <summary>
    /// Unique code for the payment term
    /// </summary>
    public string TermCode { get; set; } = string.Empty;

    /// <summary>
    /// Payment term name
    /// </summary>
    public string TermName { get; set; } = string.Empty;

    /// <summary>
    /// Payment term name in local language (e.g. Thai)
    /// </summary>
    public string? TermNameLocal { get; set; }

    /// <summary>
    /// Number of days until payment is due
    /// </summary>
    public int DueDays { get; set; }

    /// <summary>
    /// Optional discount percentage for early payment
    /// </summary>
    public decimal? DiscountPercent { get; set; }

    /// <summary>
    /// Days within which discount applies
    /// </summary>
    public int? DiscountDays { get; set; }

    /// <summary>
    /// Description of the payment term
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Whether this is the default payment term
    /// </summary>
    public bool IsDefault { get; set; }

    /// <summary>
    /// Display order for sorting
    /// </summary>
    public int SortOrder { get; set; }

    /// <summary>
    /// Whether the payment term is active
    /// </summary>
    public bool IsActive { get; set; } = true;
}
