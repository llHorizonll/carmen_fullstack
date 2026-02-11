using Carmen.Application.DTOs.Dashboard;
using Carmen.Application.Services.Dashboard;
using Carmen.Domain.Entities.AP;
using Carmen.Domain.Entities.AR;
using Carmen.Domain.Entities.Asset;
using Carmen.Domain.Entities.GL;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Carmen.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly CarmenDbContext _context;

    public DashboardService(CarmenDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync(DateTime? asOfDate = null)
    {
        var now = asOfDate ?? DateTime.UtcNow;
        var currentMonthStart = new DateTime(now.Year, now.Month, 1);
        var previousMonthStart = currentMonthStart.AddMonths(-1);
        var previousMonthEnd = currentMonthStart.AddDays(-1);
        var twelveMonthsAgo = currentMonthStart.AddMonths(-11);

        // Get base currency from tenant
        var tenant = await _context.Tenants.FirstOrDefaultAsync();
        var currencyCode = tenant?.BaseCurrency ?? "USD";

        // Revenue metric (current month vs previous month)
        var totalRevenue = await GetRevenueMetricAsync(now, currentMonthStart, previousMonthStart, previousMonthEnd, currencyCode);

        // AP Outstanding
        var apOutstanding = await GetApOutstandingMetricAsync(now, previousMonthEnd, currencyCode);

        // AR Outstanding
        var arOutstanding = await GetArOutstandingMetricAsync(now, previousMonthEnd, currencyCode);

        // Total Assets
        var totalAssets = await GetTotalAssetsMetricAsync(currencyCode);

        // Revenue & Expense trends (last 12 months)
        var revenueTrend = await GetMonthlyTrendAsync(AccountType.Revenue, twelveMonthsAgo, now);
        var expenseTrend = await GetMonthlyTrendAsync(AccountType.Expense, twelveMonthsAgo, now);

        // AP/AR Aging
        var apAging = await GetApAgingAsync(now);
        var arAging = await GetArAgingAsync(now);

        // Top expense accounts
        var topExpenses = await GetTopExpenseAccountsAsync(currentMonthStart, now, 5);

        return new DashboardSummaryDto(
            totalRevenue,
            apOutstanding,
            arOutstanding,
            totalAssets,
            revenueTrend,
            expenseTrend,
            apAging,
            arAging,
            topExpenses
        );
    }

    private async Task<DashboardMetricDto> GetRevenueMetricAsync(
        DateTime asOfDate, DateTime currentMonthStart,
        DateTime previousMonthStart, DateTime previousMonthEnd,
        string currencyCode)
    {
        var currentRevenue = await _context.JournalVoucherLines
            .Include(l => l.JournalVoucher)
            .Include(l => l.Account)
            .Where(l => l.JournalVoucher.Status == DocumentStatus.Posted
                        && l.Account.AccountType == AccountType.Revenue
                        && l.JournalVoucher.VoucherDate >= currentMonthStart
                        && l.JournalVoucher.VoucherDate <= asOfDate)
            .SumAsync(l => l.CreditAmountBase - l.DebitAmountBase);

        var previousRevenue = await _context.JournalVoucherLines
            .Include(l => l.JournalVoucher)
            .Include(l => l.Account)
            .Where(l => l.JournalVoucher.Status == DocumentStatus.Posted
                        && l.Account.AccountType == AccountType.Revenue
                        && l.JournalVoucher.VoucherDate >= previousMonthStart
                        && l.JournalVoucher.VoucherDate <= previousMonthEnd)
            .SumAsync(l => l.CreditAmountBase - l.DebitAmountBase);

        return BuildMetric(currentRevenue, previousRevenue, currencyCode);
    }

    private async Task<DashboardMetricDto> GetApOutstandingMetricAsync(
        DateTime asOfDate, DateTime previousMonthEnd, string currencyCode)
    {
        var outstandingStatuses = new[]
        {
            ApInvoiceStatus.Approved,
            ApInvoiceStatus.PartiallyPaid
        };

        var currentOutstanding = await _context.ApInvoices
            .Where(i => outstandingStatuses.Contains(i.Status) && i.BalanceAmount > 0)
            .SumAsync(i => i.BalanceAmount);

        // For previous value, approximate by checking invoices that were outstanding as of previous month end
        var previousOutstanding = await _context.ApInvoices
            .Where(i => outstandingStatuses.Contains(i.Status)
                        && i.InvoiceDate <= previousMonthEnd
                        && i.BalanceAmount > 0)
            .SumAsync(i => i.BalanceAmount);

        return BuildMetric(currentOutstanding, previousOutstanding, currencyCode);
    }

    private async Task<DashboardMetricDto> GetArOutstandingMetricAsync(
        DateTime asOfDate, DateTime previousMonthEnd, string currencyCode)
    {
        var outstandingStatuses = new[]
        {
            ArInvoiceStatus.Approved,
            ArInvoiceStatus.PartiallyPaid
        };

        var currentOutstanding = await _context.ArInvoices
            .Where(i => outstandingStatuses.Contains(i.Status) && i.BalanceAmount > 0)
            .SumAsync(i => i.BalanceAmount);

        var previousOutstanding = await _context.ArInvoices
            .Where(i => outstandingStatuses.Contains(i.Status)
                        && i.InvoiceDate <= previousMonthEnd
                        && i.BalanceAmount > 0)
            .SumAsync(i => i.BalanceAmount);

        return BuildMetric(currentOutstanding, previousOutstanding, currencyCode);
    }

    private async Task<DashboardMetricDto> GetTotalAssetsMetricAsync(string currencyCode)
    {
        var totalAssets = await _context.Assets
            .Where(a => a.Status == AssetStatus.Active)
            .SumAsync(a => a.CurrentValue);

        // No meaningful "previous" value for assets — use acquisition cost as reference
        var totalAcquisitionCost = await _context.Assets
            .Where(a => a.Status == AssetStatus.Active)
            .SumAsync(a => a.AcquisitionCostBase);

        return BuildMetric(totalAssets, totalAcquisitionCost, currencyCode);
    }

    private async Task<List<MonthlyTrendDto>> GetMonthlyTrendAsync(
        AccountType accountType, DateTime fromDate, DateTime toDate)
    {
        var lines = await _context.JournalVoucherLines
            .Include(l => l.JournalVoucher)
            .Include(l => l.Account)
            .Where(l => l.JournalVoucher.Status == DocumentStatus.Posted
                        && l.Account.AccountType == accountType
                        && l.JournalVoucher.VoucherDate >= fromDate
                        && l.JournalVoucher.VoucherDate <= toDate)
            .Select(l => new
            {
                l.JournalVoucher.VoucherDate,
                l.DebitAmountBase,
                l.CreditAmountBase
            })
            .ToListAsync();

        var grouped = lines
            .GroupBy(l => new { l.VoucherDate.Year, l.VoucherDate.Month })
            .Select(g => new MonthlyTrendDto(
                Month: $"{g.Key.Year}-{g.Key.Month:D2}",
                Amount: accountType == AccountType.Revenue
                    ? g.Sum(l => l.CreditAmountBase - l.DebitAmountBase)
                    : g.Sum(l => l.DebitAmountBase - l.CreditAmountBase)
            ))
            .OrderBy(t => t.Month)
            .ToList();

        // Fill missing months with zero
        var result = new List<MonthlyTrendDto>();
        var current = new DateTime(fromDate.Year, fromDate.Month, 1);
        var end = new DateTime(toDate.Year, toDate.Month, 1);

        while (current <= end)
        {
            var key = $"{current.Year}-{current.Month:D2}";
            var existing = grouped.FirstOrDefault(g => g.Month == key);
            result.Add(existing ?? new MonthlyTrendDto(key, 0));
            current = current.AddMonths(1);
        }

        return result;
    }

    private async Task<List<AgingBucketDto>> GetApAgingAsync(DateTime asOfDate)
    {
        var invoices = await _context.ApInvoices
            .Where(i => (i.Status == ApInvoiceStatus.Approved || i.Status == ApInvoiceStatus.PartiallyPaid)
                        && i.BalanceAmount > 0)
            .Select(i => new { i.DueDate, i.BalanceAmount })
            .ToListAsync();

        return BuildAgingBuckets(invoices.Select(i => (i.DueDate, i.BalanceAmount)), asOfDate);
    }

    private async Task<List<AgingBucketDto>> GetArAgingAsync(DateTime asOfDate)
    {
        var invoices = await _context.ArInvoices
            .Where(i => (i.Status == ArInvoiceStatus.Approved || i.Status == ArInvoiceStatus.PartiallyPaid)
                        && i.BalanceAmount > 0)
            .Select(i => new { i.DueDate, i.BalanceAmount })
            .ToListAsync();

        return BuildAgingBuckets(invoices.Select(i => (i.DueDate, i.BalanceAmount)), asOfDate);
    }

    private static List<AgingBucketDto> BuildAgingBuckets(
        IEnumerable<(DateTime DueDate, decimal BalanceAmount)> invoices, DateTime asOfDate)
    {
        var buckets = new (string Label, int MinDays, int MaxDays)[]
        {
            ("Current", int.MinValue, 0),
            ("1-30 Days", 1, 30),
            ("31-60 Days", 31, 60),
            ("61-90 Days", 61, 90),
            ("90+ Days", 91, int.MaxValue)
        };

        var result = new List<AgingBucketDto>();
        foreach (var (label, minDays, maxDays) in buckets)
        {
            var matching = invoices.Where(i =>
            {
                var daysOverdue = (asOfDate.Date - i.DueDate.Date).Days;
                return daysOverdue >= minDays && daysOverdue <= maxDays;
            }).ToList();

            result.Add(new AgingBucketDto(
                Label: label,
                Amount: matching.Sum(i => i.BalanceAmount),
                Count: matching.Count
            ));
        }

        return result;
    }

    private async Task<List<TopAccountDto>> GetTopExpenseAccountsAsync(
        DateTime fromDate, DateTime toDate, int count)
    {
        var expenses = await _context.JournalVoucherLines
            .Include(l => l.JournalVoucher)
            .Include(l => l.Account)
            .Where(l => l.JournalVoucher.Status == DocumentStatus.Posted
                        && l.Account.AccountType == AccountType.Expense
                        && l.JournalVoucher.VoucherDate >= fromDate
                        && l.JournalVoucher.VoucherDate <= toDate)
            .GroupBy(l => new { l.AccountId, l.Account.AccountCode, l.Account.AccountName })
            .Select(g => new TopAccountDto(
                g.Key.AccountCode,
                g.Key.AccountName,
                g.Sum(l => l.DebitAmountBase - l.CreditAmountBase)
            ))
            .OrderByDescending(a => a.Amount)
            .Take(count)
            .ToListAsync();

        return expenses;
    }

    private static DashboardMetricDto BuildMetric(decimal current, decimal previous, string currencyCode)
    {
        var changePercent = previous != 0
            ? Math.Round((current - previous) / Math.Abs(previous) * 100, 2)
            : current != 0 ? 100m : 0m;

        return new DashboardMetricDto(
            CurrentValue: current,
            PreviousValue: previous,
            ChangePercent: changePercent,
            CurrencyCode: currencyCode
        );
    }
}
