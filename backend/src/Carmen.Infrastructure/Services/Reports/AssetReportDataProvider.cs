using Carmen.Application.DTOs.Report;
using Carmen.Application.Services.Report;
using Carmen.Domain.Entities.Asset;
using Carmen.Domain.Entities.Report;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Carmen.Infrastructure.Services.Reports;

public class AssetReportDataProvider : IReportDataProvider
{
    private readonly CarmenDbContext _context;

    public AssetReportDataProvider(CarmenDbContext context)
    {
        _context = context;
    }

    public DataSourceType DataSource => DataSourceType.AssetManagement;

    public List<ReportFieldDefinition> GetAvailableFields() =>
    [
        new("AssetCode", "Asset Code", ColumnType.Text, true, true, true),
        new("AssetName", "Asset Name", ColumnType.Text, true, false, true),
        new("Category", "Category", ColumnType.Text, true, true, true),
        new("Location", "Location", ColumnType.Text, true, true, false),
        new("Department", "Department", ColumnType.Text, true, true, true),
        new("Status", "Status", ColumnType.Text, true, true, true),
        new("Condition", "Condition", ColumnType.Text, true, true, true),
        new("AcquisitionDate", "Acquisition Date", ColumnType.Date, true, false, true),
        new("AcquisitionCost", "Acquisition Cost", ColumnType.Currency, false, false, true),
        new("SalvageValue", "Salvage Value", ColumnType.Currency, false, false, true),
        new("AccumulatedDepreciation", "Accum. Depreciation", ColumnType.Currency, false, false, true),
        new("CurrentValue", "Book Value", ColumnType.Currency, false, false, true),
        new("DepreciationMethod", "Depr. Method", ColumnType.Text, true, true, false),
        new("UsefulLifeMonths", "Useful Life (Months)", ColumnType.Number, false, false, true),
        new("DepreciatedMonths", "Months Depreciated", ColumnType.Number, false, false, false),
        new("IsFullyDepreciated", "Fully Depreciated", ColumnType.Boolean, true, true, false),
        new("SerialNumber", "Serial Number", ColumnType.Text, true, false, false),
    ];

    public async Task<ReportDataSet> ExecuteQueryAsync(ReportQueryRequest request)
    {
        var query = _context.Assets
            .Include(a => a.AssetCategory)
            .Include(a => a.Department)
            .AsQueryable();

        query = ApplyFilters(query, request.Filters);

        IQueryable<Asset> sortedQuery = ApplySorts(query, request.Sorts);

        if (request.MaxRows.HasValue)
            sortedQuery = sortedQuery.Take(request.MaxRows.Value);

        var assets = await sortedQuery
            .Select(a => new
            {
                a.AssetCode,
                a.AssetName,
                Category = a.AssetCategory.CategoryName,
                Location = a.LocationDescription ?? "",
                Department = a.Department != null ? a.Department.DepartmentName : "",
                Status = a.Status.ToString(),
                Condition = a.Condition.ToString(),
                a.AcquisitionDate,
                a.AcquisitionCost,
                a.SalvageValue,
                a.AccumulatedDepreciation,
                a.CurrentValue,
                DepreciationMethod = a.DepreciationMethod.ToString(),
                a.UsefulLifeMonths,
                a.DepreciatedMonths,
                a.IsFullyDepreciated,
                a.SerialNumber,
            })
            .ToListAsync();

        var rows = assets.Select(a => new Dictionary<string, object?>
        {
            ["AssetCode"] = a.AssetCode,
            ["AssetName"] = a.AssetName,
            ["Category"] = a.Category,
            ["Location"] = a.Location,
            ["Department"] = a.Department,
            ["Status"] = a.Status,
            ["Condition"] = a.Condition,
            ["AcquisitionDate"] = a.AcquisitionDate,
            ["AcquisitionCost"] = a.AcquisitionCost,
            ["SalvageValue"] = a.SalvageValue,
            ["AccumulatedDepreciation"] = a.AccumulatedDepreciation,
            ["CurrentValue"] = a.CurrentValue,
            ["DepreciationMethod"] = a.DepreciationMethod,
            ["UsefulLifeMonths"] = a.UsefulLifeMonths,
            ["DepreciatedMonths"] = a.DepreciatedMonths,
            ["IsFullyDepreciated"] = a.IsFullyDepreciated,
            ["SerialNumber"] = a.SerialNumber ?? "",
        }).ToList();

        var columns = BuildColumns(request.Columns);

        return new ReportDataSet(
            ReportTitle: "Asset Management Report",
            ReportSubtitle: $"Generated {DateTime.UtcNow:MMM dd, yyyy}",
            GeneratedAt: DateTime.UtcNow,
            Columns: columns,
            Rows: rows,
            Groups: request.Groups?.Select(g => new ReportGroupDefinition(
                g.FieldName, GetFieldDisplayName(g.FieldName), g.ShowSubtotals
            )).ToList(),
            GrandTotals: BuildGrandTotals(rows, request.Columns)
        );
    }

    private static IQueryable<Asset> ApplyFilters(
        IQueryable<Asset> query, List<ReportQueryFilter>? filters)
    {
        if (filters == null) return query;

        foreach (var filter in filters)
        {
            query = filter.FieldName switch
            {
                "AssetCode" => ApplyStringFilter(query, filter, a => a.AssetCode),
                "AssetName" => ApplyStringFilter(query, filter, a => a.AssetName),
                "Category" => ApplyStringFilter(query, filter, a => a.AssetCategory.CategoryName),
                "Status" => ApplyStatusFilter(query, filter),
                "AcquisitionDate" => ApplyDateFilter(query, filter, a => a.AcquisitionDate),
                "IsFullyDepreciated" => ApplyBoolFilter(query, filter),
                _ => query
            };
        }

        return query;
    }

    private static IQueryable<Asset> ApplyStringFilter(
        IQueryable<Asset> query,
        ReportQueryFilter filter,
        System.Linq.Expressions.Expression<Func<Asset, string>> selector)
    {
        var value = filter.Value ?? "";
        var compiled = selector.Compile();

        return filter.Operator switch
        {
            FilterOperator.Equals => query.Where(a => compiled(a) == value),
            FilterOperator.NotEquals => query.Where(a => compiled(a) != value),
            FilterOperator.Contains => query.Where(a => compiled(a).Contains(value)),
            FilterOperator.StartsWith => query.Where(a => compiled(a).StartsWith(value)),
            _ => query
        };
    }

    private static IQueryable<Asset> ApplyStatusFilter(
        IQueryable<Asset> query, ReportQueryFilter filter)
    {
        if (Enum.TryParse<AssetStatus>(filter.Value, out var status))
        {
            return filter.Operator switch
            {
                FilterOperator.Equals => query.Where(a => a.Status == status),
                FilterOperator.NotEquals => query.Where(a => a.Status != status),
                _ => query
            };
        }
        return query;
    }

    private static IQueryable<Asset> ApplyDateFilter(
        IQueryable<Asset> query,
        ReportQueryFilter filter,
        System.Linq.Expressions.Expression<Func<Asset, DateTime>> selector)
    {
        var compiled = selector.Compile();

        if (filter.Operator == FilterOperator.Between
            && DateTime.TryParse(filter.Value, out var from)
            && DateTime.TryParse(filter.Value2, out var to))
        {
            return query.Where(a => compiled(a) >= from && compiled(a) <= to);
        }

        if (DateTime.TryParse(filter.Value, out var dateValue))
        {
            return filter.Operator switch
            {
                FilterOperator.Equals => query.Where(a => compiled(a).Date == dateValue.Date),
                FilterOperator.GreaterThan => query.Where(a => compiled(a) > dateValue),
                FilterOperator.GreaterThanOrEqual => query.Where(a => compiled(a) >= dateValue),
                FilterOperator.LessThan => query.Where(a => compiled(a) < dateValue),
                FilterOperator.LessThanOrEqual => query.Where(a => compiled(a) <= dateValue),
                _ => query
            };
        }

        return query;
    }

    private static IQueryable<Asset> ApplyBoolFilter(
        IQueryable<Asset> query, ReportQueryFilter filter)
    {
        if (bool.TryParse(filter.Value, out var boolValue))
        {
            return filter.Operator switch
            {
                FilterOperator.Equals => query.Where(a => a.IsFullyDepreciated == boolValue),
                FilterOperator.NotEquals => query.Where(a => a.IsFullyDepreciated != boolValue),
                _ => query
            };
        }
        return query;
    }

    private static IOrderedQueryable<Asset> ApplySorts(
        IQueryable<Asset> query, List<ReportQuerySort>? sorts)
    {
        if (sorts == null || sorts.Count == 0)
            return query.OrderBy(a => a.AssetCode);

        IOrderedQueryable<Asset>? ordered = null;

        foreach (var sort in sorts)
        {
            if (ordered == null)
            {
                ordered = sort.FieldName switch
                {
                    "AssetCode" => sort.Direction == SortDirection.Ascending
                        ? query.OrderBy(a => a.AssetCode) : query.OrderByDescending(a => a.AssetCode),
                    "AssetName" => sort.Direction == SortDirection.Ascending
                        ? query.OrderBy(a => a.AssetName) : query.OrderByDescending(a => a.AssetName),
                    "Category" => sort.Direction == SortDirection.Ascending
                        ? query.OrderBy(a => a.AssetCategory.CategoryName) : query.OrderByDescending(a => a.AssetCategory.CategoryName),
                    "AcquisitionDate" => sort.Direction == SortDirection.Ascending
                        ? query.OrderBy(a => a.AcquisitionDate) : query.OrderByDescending(a => a.AcquisitionDate),
                    "AcquisitionCost" => sort.Direction == SortDirection.Ascending
                        ? query.OrderBy(a => a.AcquisitionCost) : query.OrderByDescending(a => a.AcquisitionCost),
                    "CurrentValue" => sort.Direction == SortDirection.Ascending
                        ? query.OrderBy(a => a.CurrentValue) : query.OrderByDescending(a => a.CurrentValue),
                    _ => query.OrderBy(a => a.AssetCode)
                };
            }
            else
            {
                ordered = sort.FieldName switch
                {
                    "AssetCode" => sort.Direction == SortDirection.Ascending
                        ? ordered.ThenBy(a => a.AssetCode) : ordered.ThenByDescending(a => a.AssetCode),
                    "AcquisitionDate" => sort.Direction == SortDirection.Ascending
                        ? ordered.ThenBy(a => a.AcquisitionDate) : ordered.ThenByDescending(a => a.AcquisitionDate),
                    _ => ordered
                };
            }
        }

        return ordered ?? query.OrderBy(a => a.AssetCode);
    }

    private List<ReportColumnDefinition> BuildColumns(List<ReportQueryColumn> requestColumns)
    {
        var fields = GetAvailableFields().ToDictionary(f => f.FieldName);
        return requestColumns.Select(c =>
        {
            var field = fields.GetValueOrDefault(c.FieldName);
            return new ReportColumnDefinition(
                c.FieldName,
                c.DisplayName ?? field?.DisplayName ?? c.FieldName,
                field?.ColumnType ?? ColumnType.Text,
                field?.ColumnType is ColumnType.Currency ? 120 : 100,
                c.AggregateFunction
            );
        }).ToList();
    }

    private string GetFieldDisplayName(string fieldName)
    {
        var fields = GetAvailableFields();
        return fields.FirstOrDefault(f => f.FieldName == fieldName)?.DisplayName ?? fieldName;
    }

    private static Dictionary<string, object?>? BuildGrandTotals(
        List<Dictionary<string, object?>> rows, List<ReportQueryColumn> columns)
    {
        var aggregateColumns = columns.Where(c => c.AggregateFunction == AggregateFunction.Sum).ToList();
        if (aggregateColumns.Count == 0) return null;

        var totals = new Dictionary<string, object?>();
        foreach (var col in aggregateColumns)
        {
            totals[col.FieldName] = rows.Sum(r =>
                r.TryGetValue(col.FieldName, out var v) && v is decimal d ? d : 0m);
        }
        return totals;
    }
}
