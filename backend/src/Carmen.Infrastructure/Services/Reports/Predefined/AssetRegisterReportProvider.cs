using Carmen.Application.DTOs.Report;
using Carmen.Domain.Entities.Asset;
using Carmen.Domain.Entities.Report;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Carmen.Infrastructure.Services.Reports.Predefined;

public class AssetRegisterReportProvider : IPredefinedReportProvider
{
    private readonly CarmenDbContext _context;

    public AssetRegisterReportProvider(CarmenDbContext context)
    {
        _context = context;
    }

    public PredefinedReportType ReportType => PredefinedReportType.AssetRegister;

    public List<ReportParameterDefinition> GetParameters() =>
    [
        new("status", "Status", "select", false, "Active", [
            new("Active", "Active"),
            new("All", "All"),
            new("Disposed", "Disposed"),
        ]),
    ];

    public async Task<ReportDataSet> GenerateAsync(Dictionary<string, string> parameters)
    {
        var statusFilter = parameters.GetValueOrDefault("status", "Active");

        var query = _context.Assets
            .Include(a => a.AssetCategory);

        var filteredQuery = statusFilter switch
        {
            "Active" => query.Where(a => a.Status == AssetStatus.Active),
            "Disposed" => query.Where(a => a.Status == AssetStatus.Disposed || a.Status == AssetStatus.Sold),
            _ => query.AsQueryable(),
        };

        var assets = await filteredQuery
            .OrderBy(a => a.AssetCategory.CategoryName)
            .ThenBy(a => a.AssetCode)
            .ToListAsync();

        var rows = assets.Select(a => new Dictionary<string, object?>
        {
            ["AssetCode"] = a.AssetCode,
            ["AssetName"] = a.AssetName,
            ["Category"] = a.AssetCategory.CategoryName,
            ["AcquisitionDate"] = a.AcquisitionDate,
            ["AcquisitionCost"] = a.AcquisitionCostBase,
            ["AccumDepreciation"] = a.AccumulatedDepreciation,
            ["CurrentValue"] = a.CurrentValue,
            ["Status"] = a.Status.ToString(),
        }).ToList();

        return new ReportDataSet(
            ReportTitle: "Asset Register",
            ReportSubtitle: $"Status: {statusFilter}",
            GeneratedAt: DateTime.UtcNow,
            Columns:
            [
                new("AssetCode", "Asset Code", ColumnType.Text, 80, AggregateFunction.None),
                new("AssetName", "Asset Name", ColumnType.Text, 150, AggregateFunction.None),
                new("Category", "Category", ColumnType.Text, 100, AggregateFunction.None),
                new("AcquisitionDate", "Acquisition Date", ColumnType.Date, 80, AggregateFunction.None),
                new("AcquisitionCost", "Acquisition Cost", ColumnType.Currency, 100, AggregateFunction.Sum),
                new("AccumDepreciation", "Accum. Depreciation", ColumnType.Currency, 100, AggregateFunction.Sum),
                new("CurrentValue", "Current Value", ColumnType.Currency, 100, AggregateFunction.Sum),
                new("Status", "Status", ColumnType.Text, 60, AggregateFunction.None),
            ],
            Rows: rows,
            Groups:
            [
                new("Category", "Category", true),
            ],
            GrandTotals: new Dictionary<string, object?>
            {
                ["AcquisitionCost"] = rows.Sum(r => (decimal)(r["AcquisitionCost"] ?? 0m)),
                ["AccumDepreciation"] = rows.Sum(r => (decimal)(r["AccumDepreciation"] ?? 0m)),
                ["CurrentValue"] = rows.Sum(r => (decimal)(r["CurrentValue"] ?? 0m)),
            }
        );
    }
}
