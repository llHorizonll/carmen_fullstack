using Carmen.Domain.Entities.Common;

namespace Carmen.Domain.Entities.GL;

/// <summary>
/// Account type enumeration
/// </summary>
public enum AccountType
{
    Asset = 1,
    Liability = 2,
    Equity = 3,
    Revenue = 4,
    Expense = 5
}

/// <summary>
/// Represents a chart of account entry
/// </summary>
public class ChartOfAccount : TenantEntity
{
    public string AccountCode { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public string? AccountNameLocal { get; set; }
    public AccountType AccountType { get; set; }
    public Guid? ParentAccountId { get; set; }
    public int Level { get; set; }
    public bool IsHeader { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Description { get; set; }
    public string CurrencyCode { get; set; } = "USD";
    public bool AllowPosting { get; set; } = true;

    // Navigation properties
    public virtual ChartOfAccount? ParentAccount { get; set; }
    public virtual ICollection<ChartOfAccount> ChildAccounts { get; set; } = new List<ChartOfAccount>();
    public virtual ICollection<JournalVoucherLine> JournalVoucherLines { get; set; } = new List<JournalVoucherLine>();
}
