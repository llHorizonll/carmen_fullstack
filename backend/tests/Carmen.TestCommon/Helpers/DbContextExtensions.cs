using Carmen.Infrastructure.Data;
using Carmen.TestCommon.Constants;
using Carmen.TestCommon.Factories;

namespace Carmen.TestCommon.Helpers;

/// <summary>
/// Extension methods for seeding test data into CarmenDbContext
/// </summary>
public static class DbContextExtensions
{
    /// <summary>
    /// Seeds a standard chart of accounts (Cash, Bank, AR, AP, Revenue, Expense, Fixed Asset, Accum Dep, Dep Expense, Equity, Header)
    /// </summary>
    public static async Task SeedChartOfAccountsAsync(this CarmenDbContext context, Guid? tenantId = null)
    {
        var accounts = ChartOfAccountFactory.StandardSet();
        if (tenantId.HasValue)
        {
            foreach (var account in accounts)
                account.TenantId = tenantId.Value;
        }
        context.ChartOfAccounts.AddRange(accounts);
        await context.SaveChangesAsync();
    }

    /// <summary>
    /// Seeds a fiscal year with 12 monthly periods
    /// </summary>
    public static async Task SeedFiscalPeriodsAsync(this CarmenDbContext context, int year = 2025, Guid? tenantId = null)
    {
        var (fiscalYear, periods) = FiscalPeriodFactory.CreateYear(year, tenantId);
        context.FiscalYears.Add(fiscalYear);
        context.FiscalPeriods.AddRange(periods);
        await context.SaveChangesAsync();
    }

    /// <summary>
    /// Seeds both chart of accounts and fiscal periods (common test setup)
    /// </summary>
    public static async Task SeedStandardDataAsync(this CarmenDbContext context, Guid? tenantId = null)
    {
        await context.SeedChartOfAccountsAsync(tenantId);
        await context.SeedFiscalPeriodsAsync(2025, tenantId);
    }

    /// <summary>
    /// Seeds a vendor and returns the vendor entity
    /// </summary>
    public static async Task<Carmen.Domain.Entities.AP.Vendor> SeedVendorAsync(this CarmenDbContext context, Guid? tenantId = null)
    {
        var vendor = ApInvoiceFactory.CreateVendor(tenantId: tenantId ?? TestConstants.DefaultTenantId);
        context.Vendors.Add(vendor);
        await context.SaveChangesAsync();
        return vendor;
    }

    /// <summary>
    /// Seeds a customer and returns the customer entity
    /// </summary>
    public static async Task<Carmen.Domain.Entities.AR.Customer> SeedCustomerAsync(this CarmenDbContext context, Guid? tenantId = null)
    {
        var customer = ArInvoiceFactory.CreateCustomer(tenantId: tenantId ?? TestConstants.DefaultTenantId);
        context.Customers.Add(customer);
        await context.SaveChangesAsync();
        return customer;
    }

    /// <summary>
    /// Seeds an asset category and returns it
    /// </summary>
    public static async Task<Carmen.Domain.Entities.Asset.AssetCategory> SeedAssetCategoryAsync(this CarmenDbContext context, Guid? tenantId = null)
    {
        var category = AssetFactory.CreateCategory(tenantId: tenantId ?? TestConstants.DefaultTenantId);
        context.AssetCategories.Add(category);
        await context.SaveChangesAsync();
        return category;
    }
}
