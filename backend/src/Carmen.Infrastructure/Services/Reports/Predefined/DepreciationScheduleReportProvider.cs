using Carmen.Application.DTOs.Report;
using Carmen.Domain.Entities.Asset;
using Carmen.Domain.Entities.Report;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Carmen.Infrastructure.Services.Reports.Predefined;

public class DepreciationScheduleReportProvider : IPredefinedReportProvider
{
    private readonly CarmenDbContext _context;

    public DepreciationScheduleReportProvider(CarmenDbContext context)
    {
        _context = context;
    }

    public PredefinedReportType ReportType => PredefinedReportType.DepreciationSchedule;

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

        var schedules = await _context.DepreciationSchedules
            .Include(d => d.Asset).ThenInclude(a => a.AssetCategory)
            .Where(d => d.ScheduleDate >= dateFrom && d.ScheduleDate <= dateTo)
            .OrderBy(d => d.Asset.AssetCode)
            .ThenBy(d => d.ScheduleDate)
            .ToListAsync();

        var rows = schedules.Select(d => new Dictionary<string, object?>
        {
            ["AssetCode"] = d.Asset.AssetCode,
            ["AssetName"] = d.Asset.AssetName,
            ["Category"] = d.Asset.AssetCategory.CategoryName,
            ["Period"] = d.ScheduleDate,
            ["DepreciationAmount"] = d.DepreciationAmountBase,
            ["AccumulatedDepreciation"] = d.AccumulatedDepreciation,
            ["BookValue"] = d.ClosingValue,
        }).ToList();

        return new ReportDataSet(
            ReportTitle: "Depreciation Schedule",
            ReportSubtitle: $"{dateFrom:MMM dd, yyyy} to {dateTo:MMM dd, yyyy}",
            GeneratedAt: DateTime.UtcNow,
            Columns:
            [
                new("AssetCode", "Asset Code", ColumnType.Text, 80, AggregateFunction.None),
                new("AssetName", "Asset Name", ColumnType.Text, 150, AggregateFunction.None),
                new("Category", "Category", ColumnType.Text, 100, AggregateFunction.None),
                new("Period", "Period", ColumnType.Date, 80, AggregateFunction.None),
                new("DepreciationAmount", "Depreciation", ColumnType.Currency, 100, AggregateFunction.Sum),
                new("AccumulatedDepreciation", "Accum. Dep.", ColumnType.Currency, 100, AggregateFunction.None),
                new("BookValue", "Book Value", ColumnType.Currency, 100, AggregateFunction.None),
            ],
            Rows: rows,
            Groups:
            [
                new("AssetCode", "Asset", true),
            ],
            GrandTotals: new Dictionary<string, object?>
            {
                ["DepreciationAmount"] = rows.Sum(r => (decimal)(r["DepreciationAmount"] ?? 0m)),
            }
        );
    }
}
