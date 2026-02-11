using Carmen.Application.DTOs.Report;
using Carmen.Domain.Entities.AP;
using Carmen.Domain.Entities.Report;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Carmen.Infrastructure.Services.Reports.Predefined;

public class ApAgingReportProvider : IPredefinedReportProvider
{
    private readonly CarmenDbContext _context;

    public ApAgingReportProvider(CarmenDbContext context)
    {
        _context = context;
    }

    public PredefinedReportType ReportType => PredefinedReportType.ApAging;

    public List<ReportParameterDefinition> GetParameters() =>
    [
        new("asOfDate", "As of Date", "date", true, DateTime.UtcNow.ToString("yyyy-MM-dd"), null),
    ];

    public async Task<ReportDataSet> GenerateAsync(Dictionary<string, string> parameters)
    {
        var asOfDate = parameters.TryGetValue("asOfDate", out var dateStr)
            ? DateTime.Parse(dateStr) : DateTime.UtcNow;

        var invoices = await _context.ApInvoices
            .Include(i => i.Vendor)
            .Where(i => (i.Status == ApInvoiceStatus.Approved || i.Status == ApInvoiceStatus.PartiallyPaid)
                        && i.BalanceAmount > 0)
            .OrderBy(i => i.Vendor.VendorCode)
            .ThenBy(i => i.InvoiceNumber)
            .ToListAsync();

        var rows = invoices.Select(i =>
        {
            var daysOverdue = (asOfDate.Date - i.DueDate.Date).Days;
            return new Dictionary<string, object?>
            {
                ["VendorCode"] = i.Vendor.VendorCode,
                ["VendorName"] = i.Vendor.VendorName,
                ["InvoiceNumber"] = i.InvoiceNumber,
                ["InvoiceDate"] = i.InvoiceDate,
                ["DueDate"] = i.DueDate,
                ["Current"] = daysOverdue <= 0 ? i.BalanceAmount : 0m,
                ["Days1_30"] = daysOverdue is >= 1 and <= 30 ? i.BalanceAmount : 0m,
                ["Days31_60"] = daysOverdue is >= 31 and <= 60 ? i.BalanceAmount : 0m,
                ["Days61_90"] = daysOverdue is >= 61 and <= 90 ? i.BalanceAmount : 0m,
                ["Days90Plus"] = daysOverdue > 90 ? i.BalanceAmount : 0m,
                ["Total"] = i.BalanceAmount,
            };
        }).ToList();

        return new ReportDataSet(
            ReportTitle: "AP Aging Report",
            ReportSubtitle: $"As of {asOfDate:MMMM dd, yyyy}",
            GeneratedAt: DateTime.UtcNow,
            Columns:
            [
                new("VendorCode", "Vendor Code", ColumnType.Text, 80, AggregateFunction.None),
                new("VendorName", "Vendor Name", ColumnType.Text, 150, AggregateFunction.None),
                new("InvoiceNumber", "Invoice #", ColumnType.Text, 80, AggregateFunction.None),
                new("InvoiceDate", "Invoice Date", ColumnType.Date, 80, AggregateFunction.None),
                new("DueDate", "Due Date", ColumnType.Date, 80, AggregateFunction.None),
                new("Current", "Current", ColumnType.Currency, 90, AggregateFunction.Sum),
                new("Days1_30", "1-30", ColumnType.Currency, 90, AggregateFunction.Sum),
                new("Days31_60", "31-60", ColumnType.Currency, 90, AggregateFunction.Sum),
                new("Days61_90", "61-90", ColumnType.Currency, 90, AggregateFunction.Sum),
                new("Days90Plus", "90+", ColumnType.Currency, 90, AggregateFunction.Sum),
                new("Total", "Total", ColumnType.Currency, 100, AggregateFunction.Sum),
            ],
            Rows: rows,
            Groups:
            [
                new("VendorCode", "Vendor", true),
            ],
            GrandTotals: new Dictionary<string, object?>
            {
                ["Current"] = rows.Sum(r => (decimal)(r["Current"] ?? 0m)),
                ["Days1_30"] = rows.Sum(r => (decimal)(r["Days1_30"] ?? 0m)),
                ["Days31_60"] = rows.Sum(r => (decimal)(r["Days31_60"] ?? 0m)),
                ["Days61_90"] = rows.Sum(r => (decimal)(r["Days61_90"] ?? 0m)),
                ["Days90Plus"] = rows.Sum(r => (decimal)(r["Days90Plus"] ?? 0m)),
                ["Total"] = rows.Sum(r => (decimal)(r["Total"] ?? 0m)),
            }
        );
    }
}
