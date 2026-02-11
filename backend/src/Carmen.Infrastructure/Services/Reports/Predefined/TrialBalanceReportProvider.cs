using Carmen.Application.DTOs.Report;
using Carmen.Domain.Entities.GL;
using Carmen.Domain.Entities.Report;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Carmen.Infrastructure.Services.Reports.Predefined;

public class TrialBalanceReportProvider : IPredefinedReportProvider
{
    private readonly CarmenDbContext _context;

    public TrialBalanceReportProvider(CarmenDbContext context)
    {
        _context = context;
    }

    public PredefinedReportType ReportType => PredefinedReportType.TrialBalance;

    public List<ReportParameterDefinition> GetParameters() =>
    [
        new("asOfDate", "As of Date", "date", true, DateTime.UtcNow.ToString("yyyy-MM-dd"), null),
    ];

    public async Task<ReportDataSet> GenerateAsync(Dictionary<string, string> parameters)
    {
        var asOfDate = parameters.TryGetValue("asOfDate", out var dateStr)
            ? DateTime.Parse(dateStr)
            : DateTime.UtcNow;

        var accounts = await _context.ChartOfAccounts
            .Where(a => a.IsActive && !a.IsHeader)
            .OrderBy(a => a.AccountCode)
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
        decimal totalDebit = 0, totalCredit = 0;

        foreach (var account in accounts)
        {
            if (!transDict.TryGetValue(account.Id, out var sums)) continue;

            var balance = CalculateBalance(account.AccountType, sums.TotalDebit, sums.TotalCredit);
            decimal debit = 0, credit = 0;

            if (account.AccountType is AccountType.Asset or AccountType.Expense)
            {
                if (balance >= 0) debit = balance;
                else credit = Math.Abs(balance);
            }
            else
            {
                if (balance >= 0) credit = balance;
                else debit = Math.Abs(balance);
            }

            if (debit == 0 && credit == 0) continue;

            rows.Add(new Dictionary<string, object?>
            {
                ["AccountCode"] = account.AccountCode,
                ["AccountName"] = account.AccountName,
                ["AccountType"] = account.AccountType.ToString(),
                ["Debit"] = debit,
                ["Credit"] = credit,
            });

            totalDebit += debit;
            totalCredit += credit;
        }

        return new ReportDataSet(
            ReportTitle: "Trial Balance",
            ReportSubtitle: $"As of {asOfDate:MMMM dd, yyyy}",
            GeneratedAt: DateTime.UtcNow,
            Columns:
            [
                new("AccountCode", "Account Code", ColumnType.Text, 80, AggregateFunction.None),
                new("AccountName", "Account Name", ColumnType.Text, 200, AggregateFunction.None),
                new("AccountType", "Type", ColumnType.Text, 80, AggregateFunction.None),
                new("Debit", "Debit", ColumnType.Currency, 120, AggregateFunction.Sum),
                new("Credit", "Credit", ColumnType.Currency, 120, AggregateFunction.Sum),
            ],
            Rows: rows,
            Groups: null,
            GrandTotals: new Dictionary<string, object?>
            {
                ["Debit"] = totalDebit,
                ["Credit"] = totalCredit,
            }
        );
    }

    private static decimal CalculateBalance(AccountType accountType, decimal debit, decimal credit)
    {
        return accountType switch
        {
            AccountType.Asset or AccountType.Expense => debit - credit,
            _ => credit - debit
        };
    }
}
