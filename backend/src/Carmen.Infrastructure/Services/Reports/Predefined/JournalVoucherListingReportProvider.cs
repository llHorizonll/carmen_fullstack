using Carmen.Application.DTOs.Report;
using Carmen.Domain.Entities.GL;
using Carmen.Domain.Entities.Report;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Carmen.Infrastructure.Services.Reports.Predefined;

public class JournalVoucherListingReportProvider : IPredefinedReportProvider
{
    private readonly CarmenDbContext _context;

    public JournalVoucherListingReportProvider(CarmenDbContext context)
    {
        _context = context;
    }

    public PredefinedReportType ReportType => PredefinedReportType.JournalVoucherListing;

    public List<ReportParameterDefinition> GetParameters() =>
    [
        new("dateFrom", "From Date", "date", true, new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1).ToString("yyyy-MM-dd"), null),
        new("dateTo", "To Date", "date", true, DateTime.UtcNow.ToString("yyyy-MM-dd"), null),
    ];

    public async Task<ReportDataSet> GenerateAsync(Dictionary<string, string> parameters)
    {
        var dateFrom = parameters.TryGetValue("dateFrom", out var fromStr)
            ? DateTime.Parse(fromStr) : new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var dateTo = parameters.TryGetValue("dateTo", out var toStr)
            ? DateTime.Parse(toStr) : DateTime.UtcNow;

        var vouchers = await _context.JournalVouchers
            .Include(v => v.Lines).ThenInclude(l => l.Account)
            .Where(v => v.Status == DocumentStatus.Posted
                        && v.VoucherDate >= dateFrom
                        && v.VoucherDate <= dateTo)
            .OrderBy(v => v.VoucherDate)
            .ThenBy(v => v.VoucherNumber)
            .ToListAsync();

        var rows = new List<Dictionary<string, object?>>();
        decimal totalDebit = 0, totalCredit = 0;

        foreach (var v in vouchers)
        {
            foreach (var line in v.Lines.OrderBy(l => l.LineNumber))
            {
                rows.Add(new Dictionary<string, object?>
                {
                    ["VoucherNumber"] = v.VoucherNumber,
                    ["VoucherDate"] = v.VoucherDate,
                    ["VoucherType"] = v.VoucherType.ToString(),
                    ["AccountCode"] = line.Account.AccountCode,
                    ["AccountName"] = line.Account.AccountName,
                    ["Description"] = line.Description ?? v.Description ?? "",
                    ["Debit"] = line.DebitAmountBase,
                    ["Credit"] = line.CreditAmountBase,
                });

                totalDebit += line.DebitAmountBase;
                totalCredit += line.CreditAmountBase;
            }
        }

        return new ReportDataSet(
            ReportTitle: "Journal Voucher Listing",
            ReportSubtitle: $"{dateFrom:MMM dd, yyyy} to {dateTo:MMM dd, yyyy}",
            GeneratedAt: DateTime.UtcNow,
            Columns:
            [
                new("VoucherNumber", "Voucher #", ColumnType.Text, 100, AggregateFunction.None),
                new("VoucherDate", "Date", ColumnType.Date, 80, AggregateFunction.None),
                new("VoucherType", "Type", ColumnType.Text, 60, AggregateFunction.None),
                new("AccountCode", "Account", ColumnType.Text, 80, AggregateFunction.None),
                new("AccountName", "Account Name", ColumnType.Text, 150, AggregateFunction.None),
                new("Description", "Description", ColumnType.Text, 150, AggregateFunction.None),
                new("Debit", "Debit", ColumnType.Currency, 100, AggregateFunction.Sum),
                new("Credit", "Credit", ColumnType.Currency, 100, AggregateFunction.Sum),
            ],
            Rows: rows,
            Groups:
            [
                new("VoucherNumber", "Voucher", true),
            ],
            GrandTotals: new Dictionary<string, object?>
            {
                ["Debit"] = totalDebit,
                ["Credit"] = totalCredit,
            }
        );
    }
}
