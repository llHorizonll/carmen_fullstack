namespace Carmen.TestCommon.Constants;

/// <summary>
/// Standard test constants shared across all test projects
/// </summary>
public static class TestConstants
{
    // Tenant IDs
    public static readonly Guid DefaultTenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");
    public static readonly Guid SecondTenantId = Guid.Parse("00000000-0000-0000-0000-000000000002");

    // User IDs
    public static readonly Guid DefaultUserId = Guid.Parse("10000000-0000-0000-0000-000000000001");
    public static readonly Guid SecondUserId = Guid.Parse("10000000-0000-0000-0000-000000000002");
    public static readonly Guid AdminUserId = Guid.Parse("10000000-0000-0000-0000-000000000099");

    // Fiscal Period IDs
    public static readonly Guid DefaultFiscalYearId = Guid.Parse("20000000-0000-0000-0000-000000000001");
    public static readonly Guid DefaultFiscalPeriodId = Guid.Parse("21000000-0000-0000-0000-000000000001");

    // Chart of Account IDs
    public static readonly Guid CashAccountId = Guid.Parse("30000000-0000-0000-0000-000000000001");
    public static readonly Guid BankAccountId = Guid.Parse("30000000-0000-0000-0000-000000000002");
    public static readonly Guid ArAccountId = Guid.Parse("30000000-0000-0000-0000-000000000003");
    public static readonly Guid ApAccountId = Guid.Parse("30000000-0000-0000-0000-000000000004");
    public static readonly Guid RevenueAccountId = Guid.Parse("30000000-0000-0000-0000-000000000005");
    public static readonly Guid ExpenseAccountId = Guid.Parse("30000000-0000-0000-0000-000000000006");
    public static readonly Guid FixedAssetAccountId = Guid.Parse("30000000-0000-0000-0000-000000000007");
    public static readonly Guid AccumDepreciationAccountId = Guid.Parse("30000000-0000-0000-0000-000000000008");
    public static readonly Guid DepreciationExpenseAccountId = Guid.Parse("30000000-0000-0000-0000-000000000009");
    public static readonly Guid EquityAccountId = Guid.Parse("30000000-0000-0000-0000-000000000010");
    public static readonly Guid HeaderAccountId = Guid.Parse("30000000-0000-0000-0000-000000000099");

    // Default email/password for auth tests
    public const string DefaultEmail = "test@carmen.dev";
    public const string DefaultPassword = "Test@1234";
    public const string DefaultPasswordHash = "$2a$11$mock_hash_for_testing";
}
