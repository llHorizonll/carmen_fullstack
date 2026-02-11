using Carmen.Application.DTOs.Report;
using Carmen.Domain.Entities.GL;
using Carmen.Domain.Entities.Report;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Carmen.Infrastructure.Services.Reports.Predefined;

public class IncomeStatementReportProvider : IPredefinedReportProvider
{
    private readonly CarmenDbContext _context;

    public IncomeStatementReportProvider(CarmenDbContext context)
    {
        _context = context;
    }

    public PredefinedReportType ReportType => PredefinedReportType.IncomeStatement;

    public List<ReportParameterDefinition> GetParameters() =>
    [
        new("dateFrom", "From Date", "date", true, new DateTime(DateTime.UtcNow.Year, 1, 1).ToString("yyyy-MM-dd"), null),
        new("dateTo", "To Date", "date", true, DateTime.UtcNow.ToString("yyyy-MM-dd"), null),
    ];

    public async Task<ReportDataSet> GenerateAsync(Dictionary<string, string> parameters)
    {
        var dateFrom = parameters.TryGetValue("dateFrom", out var fromStr)
            ? DateTime.Parse(fromStr) : new DateTime(DateTime.UtcNow.Year, 1, 1);
        var dateTo = parameters.TryGetValue("dateTo", out var toStr)
            ? DateTime.Parse(toStr) : DateTime.UtcNow;

        var accountBalances = await _context.JournalVoucherLines
            .Include(l => l.JournalVoucher)
            .Include(l => l.Account)
            .Where(l => l.JournalVoucher.Status == DocumentStatus.Posted
                        && l.JournalVoucher.VoucherDate >= dateFrom
                        && l.JournalVoucher.VoucherDate <= dateTo
                        && (l.Account.AccountType == AccountType.Revenue || l.Account.AccountType == AccountType.Expense))
            .GroupBy(l => new { l.AccountId, l.Account.AccountCode, l.Account.AccountName, l.Account.AccountType })
            .Select(g => new
            {
                g.Key.AccountCode,
                g.Key.AccountName,
                g.Key.AccountType,
                TotalDebit = g.Sum(l => l.DebitAmountBase),
                TotalCredit = g.Sum(l => l.CreditAmountBase)
            })
            .OrderBy(a => a.AccountType)
            .ThenBy(a => a.AccountCode)
            .ToListAsync();

        var rows = new List<Dictionary<string, object?>>();
        decimal totalRevenue = 0, totalExpense = 0;

        foreach (var ab in accountBalances)
        {
            var amount = ab.AccountType == AccountType.Revenue
                ? ab.TotalCredit - ab.TotalDebit
                : ab.TotalDebit - ab.TotalCredit;

            if (amount == 0) continue;

            rows.Add(new Dictionary<string, object?>
            {
                ["AccountCode"] = ab.AccountCode,
                ["AccountName"] = ab.AccountName,
                ["Category"] = ab.AccountType == AccountType.Revenue ? "Revenue" : "Expense",
                ["Amount"] = amount,
            });

            if (ab.AccountType == AccountType.Revenue) totalRevenue += amount;
            else totalExpense += amount;
        }

        var netIncome = totalRevenue - totalExpense;

        return new ReportDataSet(
            ReportTitle: "Income Statement",
            ReportSubtitle: $"{dateFrom:MMM dd, yyyy} to {dateTo:MMM dd, yyyy}",
            GeneratedAt: DateTime.UtcNow,
            Columns:
            [
                new("AccountCode", "Account Code", ColumnType.Text, 80, AggregateFunction.None),
                new("AccountName", "Account Name", ColumnType.Text, 200, AggregateFunction.None),
                new("Category", "Category", ColumnType.Text, 80, AggregateFunction.None),
                new("Amount", "Amount", ColumnType.Currency, 120, AggregateFunction.Sum),
            ],
            Rows: rows,
            Groups:
            [
                new("Category", "Category", true),
            ],
            GrandTotals: new Dictionary<string, object?>
            {
                ["AccountName"] = "Net Income",
                ["Amount"] = netIncome,
            }
        );
    }
}
