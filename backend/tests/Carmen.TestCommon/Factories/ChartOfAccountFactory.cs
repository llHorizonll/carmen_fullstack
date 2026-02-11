using Carmen.Domain.Entities.GL;
using Carmen.TestCommon.Constants;

namespace Carmen.TestCommon.Factories;

/// <summary>
/// Builder for creating ChartOfAccount test entities
/// </summary>
public class ChartOfAccountFactory
{
    private readonly ChartOfAccount _account = new()
    {
        Id = Guid.NewGuid(),
        TenantId = TestConstants.DefaultTenantId,
        AccountCode = "1000",
        AccountName = "Test Account",
        AccountType = AccountType.Asset,
        Level = 1,
        IsHeader = false,
        IsActive = true,
        AllowPosting = true,
        CurrencyCode = "USD",
        CreatedAt = DateTime.UtcNow,
        CreatedBy = "test",
    };

    public ChartOfAccountFactory WithId(Guid id) { _account.Id = id; return this; }
    public ChartOfAccountFactory WithTenant(Guid tenantId) { _account.TenantId = tenantId; return this; }
    public ChartOfAccountFactory WithCode(string code) { _account.AccountCode = code; return this; }
    public ChartOfAccountFactory WithName(string name) { _account.AccountName = name; return this; }
    public ChartOfAccountFactory WithType(AccountType type) { _account.AccountType = type; return this; }
    public ChartOfAccountFactory AsHeader() { _account.IsHeader = true; _account.AllowPosting = false; return this; }
    public ChartOfAccountFactory AsInactive() { _account.IsActive = false; return this; }
    public ChartOfAccountFactory NoPosting() { _account.AllowPosting = false; return this; }
    public ChartOfAccountFactory WithParent(Guid parentId) { _account.ParentAccountId = parentId; _account.Level = 2; return this; }

    public ChartOfAccount Build() => _account;

    // Pre-built accounts
    public static ChartOfAccount Cash() => new ChartOfAccountFactory()
        .WithId(TestConstants.CashAccountId).WithCode("1100").WithName("Cash").WithType(AccountType.Asset).Build();

    public static ChartOfAccount Bank() => new ChartOfAccountFactory()
        .WithId(TestConstants.BankAccountId).WithCode("1200").WithName("Bank").WithType(AccountType.Asset).Build();

    public static ChartOfAccount AccountsReceivable() => new ChartOfAccountFactory()
        .WithId(TestConstants.ArAccountId).WithCode("1300").WithName("Accounts Receivable").WithType(AccountType.Asset).Build();

    public static ChartOfAccount AccountsPayable() => new ChartOfAccountFactory()
        .WithId(TestConstants.ApAccountId).WithCode("2100").WithName("Accounts Payable").WithType(AccountType.Liability).Build();

    public static ChartOfAccount Revenue() => new ChartOfAccountFactory()
        .WithId(TestConstants.RevenueAccountId).WithCode("4100").WithName("Revenue").WithType(AccountType.Revenue).Build();

    public static ChartOfAccount Expense() => new ChartOfAccountFactory()
        .WithId(TestConstants.ExpenseAccountId).WithCode("5100").WithName("Operating Expense").WithType(AccountType.Expense).Build();

    public static ChartOfAccount FixedAsset() => new ChartOfAccountFactory()
        .WithId(TestConstants.FixedAssetAccountId).WithCode("1500").WithName("Fixed Assets").WithType(AccountType.Asset).Build();

    public static ChartOfAccount AccumulatedDepreciation() => new ChartOfAccountFactory()
        .WithId(TestConstants.AccumDepreciationAccountId).WithCode("1510").WithName("Accumulated Depreciation").WithType(AccountType.Asset).Build();

    public static ChartOfAccount DepreciationExpense() => new ChartOfAccountFactory()
        .WithId(TestConstants.DepreciationExpenseAccountId).WithCode("5200").WithName("Depreciation Expense").WithType(AccountType.Expense).Build();

    public static ChartOfAccount Equity() => new ChartOfAccountFactory()
        .WithId(TestConstants.EquityAccountId).WithCode("3100").WithName("Retained Earnings").WithType(AccountType.Equity).Build();

    public static ChartOfAccount Header() => new ChartOfAccountFactory()
        .WithId(TestConstants.HeaderAccountId).WithCode("0000").WithName("Header Account").AsHeader().Build();

    /// <summary>
    /// Returns a standard set of accounts for seeding test data
    /// </summary>
    public static List<ChartOfAccount> StandardSet() => new()
    {
        Cash(), Bank(), AccountsReceivable(), AccountsPayable(),
        Revenue(), Expense(), FixedAsset(), AccumulatedDepreciation(),
        DepreciationExpense(), Equity(), Header(),
    };
}
