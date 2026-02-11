using Carmen.Application.DTOs.Report;
using Carmen.Domain.Entities.GL;
using Carmen.Domain.Entities.Report;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Carmen.Infrastructure.Services.Reports.Predefined;

public class BalanceSheetReportProvider : IPredefinedReportProvider
{
    private readonly CarmenDbContext _context;

    public BalanceSheetReportProvider(CarmenDbContext context)
    {
        _context = context;
    }

    public PredefinedReportType ReportType => PredefinedReportType.BalanceSheet;

    public List<ReportParameterDefinition> GetParameters() =>
    [
        new("asOfDate", "As of Date", "date", true, DateTime.UtcNow.ToString("yyyy-MM-dd"), null),
    ];

    public async Task<ReportDataSet> GenerateAsync(Dictionary<string, string> parameters)
    {
        var asOfDate = parameters.TryGetValue("asOfDate", out var dateStr)
            ? DateTime.Parse(dateStr) : DateTime.UtcNow;

        var accounts = await _context.ChartOfAccounts
            .Where(a => a.IsActive && !a.IsHeader
                && (a.AccountType == AccountType.Asset
                    || a.AccountType == AccountType.Liability
                    || a.AccountType == AccountType.Equity))
            .OrderBy(a => a.AccountType)
            .ThenBy(a => a.AccountCode)
            .ToListAsync();

        var transactionSums = await _context.JournalVoucherLines
            .Include(l => l.JournalVoucher)
            .Where(l => l.JournalVoucher.Status == DocumentStatus.Posted
                        && l.JournalVoucher.VoucherDate <= asOfDate)
            .GroupBy(l => l.AccountId)
            .Select(g => new
            {
                AccountId = g.Key,
                TotalDebit = g.Sum(l => l.DebitAmountBase),
                TotalCredit = g.Sum(l => l.CreditAmountBase)
            })
            .ToListAsync();

        var transDict = transactionSums.ToDictionary(t => t.AccountId);

        var rows = new List<Dictionary<string, object?>>();
        decimal totalAssets = 0, totalLiabilities = 0, totalEquity = 0;

        foreach (var account in accounts)
        {
            if (!transDict.TryGetValue(account.Id, out var sums)) continue;

            var balance = account.AccountType switch
            {
                AccountType.Asset => sums.TotalDebit - sums.TotalCredit,
                _ => sums.TotalCredit - sums.TotalDebit
            };

            if (balance == 0) continue;

            rows.Add(new Dictionary<string, object?>
            {
                ["AccountCode"] = account.AccountCode,
                ["AccountName"] = account.AccountName,
                ["AccountType"] = account.AccountType.ToString(),
                ["Balance"] = balance,
            });

            switch (account.AccountType)
            {
                case AccountType.Asset: totalAssets += balance; break;
                case AccountType.Liability: totalLiabilities += balance; break;
                case AccountType.Equity: totalEquity += balance; break;
            }
        }

        // Add net income (Revenue - Expense) to equity
        var revenueExpense = await _context.JournalVoucherLines
            .Include(l => l.JournalVoucher)
            .Include(l => l.Account)
            .Where(l => l.JournalVoucher.Status == DocumentStatus.Posted
                        && l.JournalVoucher.VoucherDate <= asOfDate
                        && (l.Account.AccountType == AccountType.Revenue || l.Account.AccountType == AccountType.Expense))
            .GroupBy(l => l.Account.AccountType)
            .Select(g => new
            {
                AccountType = g.Key,
                TotalDebit = g.Sum(l => l.DebitAmountBase),
                TotalCredit = g.Sum(l => l.CreditAmountBase)
            })
            .ToListAsync();

        var totalRevenue = revenueExpense.Where(r => r.AccountType == AccountType.Revenue)
            .Sum(r => r.TotalCredit - r.TotalDebit);
        var totalExpense = revenueExpense.Where(r => r.AccountType == AccountType.Expense)
            .Sum(r => r.TotalDebit - r.TotalCredit);
        var netIncome = totalRevenue - totalExpense;

        if (netIncome != 0)
        {
            rows.Add(new Dictionary<string, object?>
            {
                ["AccountCode"] = "",
                ["AccountName"] = "Retained Earnings (Current Period)",
                ["AccountType"] = "Equity",
                ["Balance"] = netIncome,
            });
            totalEquity += netIncome;
        }

        return new ReportDataSet(
            ReportTitle: "Balance Sheet",
            ReportSubtitle: $"As of {asOfDate:MMMM dd, yyyy}",
            GeneratedAt: DateTime.UtcNow,
            Columns:
            [
                new("AccountCode", "Account Code", ColumnType.Text, 80, AggregateFunction.None),
                new("AccountName", "Account Name", ColumnType.Text, 200, AggregateFunction.None),
                new("AccountType", "Type", ColumnType.Text, 80, AggregateFunction.None),
                new("Balance", "Balance", ColumnType.Currency, 120, AggregateFunction.Sum),
            ],
            Rows: rows,
            Groups:
            [
                new("AccountType", "Account Type", true),
            ],
            GrandTotals: new Dictionary<string, object?>
            {
                ["AccountName"] = $"Assets: {totalAssets:N2} | Liabilities + Equity: {totalLiabilities + totalEquity:N2}",
            }
        );
    }
}
