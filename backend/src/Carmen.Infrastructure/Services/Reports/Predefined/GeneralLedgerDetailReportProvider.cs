using Carmen.Application.DTOs.Report;
using Carmen.Domain.Entities.GL;
using Carmen.Domain.Entities.Report;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Carmen.Infrastructure.Services.Reports.Predefined;

public class GeneralLedgerDetailReportProvider : IPredefinedReportProvider
{
    private readonly CarmenDbContext _context;

    public GeneralLedgerDetailReportProvider(CarmenDbContext context)
    {
        _context = context;
    }

    public PredefinedReportType ReportType => PredefinedReportType.GeneralLedgerDetail;

    public List<ReportParameterDefinition> GetParameters() =>
    [
        new("dateFrom", "From Date", "date", true, new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1).ToString("yyyy-MM-dd"), null),
        new("dateTo", "To Date", "date", true, DateTime.UtcNow.ToString("yyyy-MM-dd"), null),
        new("accountId", "Account", "accountPicker", false, null, null),
    ];

    public async Task<ReportDataSet> GenerateAsync(Dictionary<string, string> parameters)
    {
        var dateFrom = parameters.TryGetValue("dateFrom", out var fromStr)
            ? DateTime.Parse(fromStr) : new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var dateTo = parameters.TryGetValue("dateTo", out var toStr)
            ? DateTime.Parse(toStr) : DateTime.UtcNow;
        Guid? accountId = parameters.TryGetValue("accountId", out var accId) && Guid.TryParse(accId, out var parsedId)
            ? parsedId : null;

        var query = _context.JournalVoucherLines
            .Include(l => l.JournalVoucher)
            .Include(l => l.Account)
            .Where(l => l.JournalVoucher.Status == DocumentStatus.Posted
                        && l.JournalVoucher.VoucherDate >= dateFrom
                        && l.JournalVoucher.VoucherDate <= dateTo);

        if (accountId.HasValue)
            query = query.Where(l => l.AccountId == accountId.Value);

        var lines = await query
            .OrderBy(l => l.Account.AccountCode)
            .ThenBy(l => l.JournalVoucher.VoucherDate)
            .ThenBy(l => l.JournalVoucher.VoucherNumber)
            .Select(l => new
            {
                l.Account.AccountCode,
                l.Account.AccountName,
                l.JournalVoucher.VoucherNumber,
                l.JournalVoucher.VoucherDate,
                l.Description,
                l.DebitAmountBase,
                l.CreditAmountBase,
            })
            .ToListAsync();

        var rows = lines.Select(l => new Dictionary<string, object?>
        {
            ["AccountCode"] = l.AccountCode,
            ["AccountName"] = l.AccountName,
            ["VoucherNumber"] = l.VoucherNumber,
            ["VoucherDate"] = l.VoucherDate,
            ["Description"] = l.Description ?? "",
            ["Debit"] = l.DebitAmountBase,
            ["Credit"] = l.CreditAmountBase,
        }).ToList();

        return new ReportDataSet(
            ReportTitle: "General Ledger Detail",
            ReportSubtitle: $"{dateFrom:MMM dd, yyyy} to {dateTo:MMM dd, yyyy}",
            GeneratedAt: DateTime.UtcNow,
            Columns:
            [
                new("AccountCode", "Account", ColumnType.Text, 80, AggregateFunction.None),
                new("AccountName", "Account Name", ColumnType.Text, 150, AggregateFunction.None),
                new("VoucherNumber", "Voucher #", ColumnType.Text, 100, AggregateFunction.None),
                new("VoucherDate", "Date", ColumnType.Date, 80, AggregateFunction.None),
                new("Description", "Description", ColumnType.Text, 150, AggregateFunction.None),
                new("Debit", "Debit", ColumnType.Currency, 100, AggregateFunction.Sum),
                new("Credit", "Credit", ColumnType.Currency, 100, AggregateFunction.Sum),
            ],
            Rows: rows,
            Groups:
            [
                new("AccountCode", "Account", true),
            ],
            GrandTotals: new Dictionary<string, object?>
            {
                ["Debit"] = rows.Sum(r => (decimal)(r["Debit"] ?? 0m)),
                ["Credit"] = rows.Sum(r => (decimal)(r["Credit"] ?? 0m)),
            }
        );
    }
}
