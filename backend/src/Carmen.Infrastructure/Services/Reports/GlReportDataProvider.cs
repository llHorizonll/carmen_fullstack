using Carmen.Application.DTOs.Report;
using Carmen.Application.Services.Report;
using Carmen.Domain.Entities.GL;
using Carmen.Domain.Entities.Report;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Carmen.Infrastructure.Services.Reports;

public class GlReportDataProvider : IReportDataProvider
{
    private readonly CarmenDbContext _context;

    public GlReportDataProvider(CarmenDbContext context)
    {
        _context = context;
    }

    public DataSourceType DataSource => DataSourceType.GeneralLedger;

    public List<ReportFieldDefinition> GetAvailableFields() =>
    [
        new("AccountCode", "Account Code", ColumnType.Text, true, true, true),
        new("AccountName", "Account Name", ColumnType.Text, true, false, true),
        new("AccountType", "Account Type", ColumnType.Text, true, true, true),
        new("VoucherNumber", "Voucher Number", ColumnType.Text, true, false, true),
        new("VoucherDate", "Voucher Date", ColumnType.Date, true, false, true),
        new("VoucherType", "Voucher Type", ColumnType.Text, true, true, true),
        new("Description", "Description", ColumnType.Text, true, false, false),
        new("Reference", "Reference", ColumnType.Text, true, false, false),
        new("Debit", "Debit Amount", ColumnType.Currency, false, false, true),
        new("Credit", "Credit Amount", ColumnType.Currency, false, false, true),
        new("DebitBase", "Debit (Base)", ColumnType.Currency, false, false, true),
        new("CreditBase", "Credit (Base)", ColumnType.Currency, false, false, true),
        new("CurrencyCode", "Currency", ColumnType.Text, true, true, false),
        new("PostingDate", "Posting Date", ColumnType.Date, true, false, true),
        new("Status", "Status", ColumnType.Text, true, true, true),
        new("Period", "Fiscal Period", ColumnType.Text, true, true, true),
    ];

    public async Task<ReportDataSet> ExecuteQueryAsync(ReportQueryRequest request)
    {
        var query = _context.JournalVoucherLines
            .Include(l => l.JournalVoucher)
            .Include(l => l.Account)
            .Where(l => l.JournalVoucher.Status == DocumentStatus.Posted)
            .AsQueryable();

        query = ApplyFilters(query, request.Filters);

        IQueryable<JournalVoucherLine> sortedQuery = ApplySorts(query, request.Sorts);

        if (request.MaxRows.HasValue)
            sortedQuery = sortedQuery.Take(request.MaxRows.Value);

        var lines = await sortedQuery
            .Select(l => new
            {
                l.Account.AccountCode,
                l.Account.AccountName,
                AccountType = l.Account.AccountType.ToString(),
                l.JournalVoucher.VoucherNumber,
                l.JournalVoucher.VoucherDate,
                VoucherType = l.JournalVoucher.VoucherType.ToString(),
                LineDescription = l.Description,
                VoucherDescription = l.JournalVoucher.Description,
                l.JournalVoucher.Reference,
                l.DebitAmount,
                l.CreditAmount,
                l.DebitAmountBase,
                l.CreditAmountBase,
                l.JournalVoucher.CurrencyCode,
                l.JournalVoucher.PostingDate,
                Status = l.JournalVoucher.Status.ToString(),
            })
            .ToListAsync();

        var rows = lines.Select(l => new Dictionary<string, object?>
        {
            ["AccountCode"] = l.AccountCode,
            ["AccountName"] = l.AccountName,
            ["AccountType"] = l.AccountType,
            ["VoucherNumber"] = l.VoucherNumber,
            ["VoucherDate"] = l.VoucherDate,
            ["VoucherType"] = l.VoucherType,
            ["Description"] = l.LineDescription ?? l.VoucherDescription ?? "",
            ["Reference"] = l.Reference ?? "",
            ["Debit"] = l.DebitAmount,
            ["Credit"] = l.CreditAmount,
            ["DebitBase"] = l.DebitAmountBase,
            ["CreditBase"] = l.CreditAmountBase,
            ["CurrencyCode"] = l.CurrencyCode,
            ["PostingDate"] = l.PostingDate,
            ["Status"] = l.Status,
            ["Period"] = l.PostingDate.ToString("yyyy-MM"),
        }).ToList();

        var columns = BuildColumns(request.Columns);

        return new ReportDataSet(
            ReportTitle: "General Ledger Report",
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

    private static IQueryable<JournalVoucherLine> ApplyFilters(
        IQueryable<JournalVoucherLine> query, List<ReportQueryFilter>? filters)
    {
        if (filters == null) return query;

        foreach (var filter in filters)
        {
            query = filter.FieldName switch
            {
                "AccountCode" => ApplyStringFilter(query, filter, l => l.Account.AccountCode),
                "AccountName" => ApplyStringFilter(query, filter, l => l.Account.AccountName),
                "AccountType" => ApplyAccountTypeFilter(query, filter),
                "VoucherNumber" => ApplyStringFilter(query, filter, l => l.JournalVoucher.VoucherNumber),
                "VoucherDate" => ApplyDateFilter(query, filter, l => l.JournalVoucher.VoucherDate),
                "PostingDate" => ApplyDateFilter(query, filter, l => l.JournalVoucher.PostingDate),
                "CurrencyCode" => ApplyStringFilter(query, filter, l => l.JournalVoucher.CurrencyCode),
                _ => query
            };
        }

        return query;
    }

    private static IQueryable<JournalVoucherLine> ApplyStringFilter(
        IQueryable<JournalVoucherLine> query,
        ReportQueryFilter filter,
        System.Linq.Expressions.Expression<Func<JournalVoucherLine, string>> selector)
    {
        var value = filter.Value ?? "";
        var compiled = selector.Compile();

        return filter.Operator switch
        {
            FilterOperator.Equals => query.Where(l => compiled(l) == value),
            FilterOperator.NotEquals => query.Where(l => compiled(l) != value),
            FilterOperator.Contains => query.Where(l => compiled(l).Contains(value)),
            FilterOperator.StartsWith => query.Where(l => compiled(l).StartsWith(value)),
            FilterOperator.EndsWith => query.Where(l => compiled(l).EndsWith(value)),
            _ => query
        };
    }

    private static IQueryable<JournalVoucherLine> ApplyAccountTypeFilter(
        IQueryable<JournalVoucherLine> query, ReportQueryFilter filter)
    {
        if (Enum.TryParse<AccountType>(filter.Value, out var accountType))
        {
            return filter.Operator switch
            {
                FilterOperator.Equals => query.Where(l => l.Account.AccountType == accountType),
                FilterOperator.NotEquals => query.Where(l => l.Account.AccountType != accountType),
                _ => query
            };
        }
        return query;
    }

    private static IQueryable<JournalVoucherLine> ApplyDateFilter(
        IQueryable<JournalVoucherLine> query,
        ReportQueryFilter filter,
        System.Linq.Expressions.Expression<Func<JournalVoucherLine, DateTime>> selector)
    {
        var compiled = selector.Compile();

        if (filter.Operator == FilterOperator.Between
            && DateTime.TryParse(filter.Value, out var from)
            && DateTime.TryParse(filter.Value2, out var to))
        {
            return query.Where(l => compiled(l) >= from && compiled(l) <= to);
        }

        if (DateTime.TryParse(filter.Value, out var dateValue))
        {
            return filter.Operator switch
            {
                FilterOperator.Equals => query.Where(l => compiled(l).Date == dateValue.Date),
                FilterOperator.GreaterThan => query.Where(l => compiled(l) > dateValue),
                FilterOperator.GreaterThanOrEqual => query.Where(l => compiled(l) >= dateValue),
                FilterOperator.LessThan => query.Where(l => compiled(l) < dateValue),
                FilterOperator.LessThanOrEqual => query.Where(l => compiled(l) <= dateValue),
                _ => query
            };
        }

        return query;
    }

    private static IOrderedQueryable<JournalVoucherLine> ApplySorts(
        IQueryable<JournalVoucherLine> query, List<ReportQuerySort>? sorts)
    {
        if (sorts == null || sorts.Count == 0)
            return query.OrderBy(l => l.JournalVoucher.VoucherDate);

        IOrderedQueryable<JournalVoucherLine>? ordered = null;

        foreach (var sort in sorts)
        {
            if (ordered == null)
            {
                ordered = sort.FieldName switch
                {
                    "AccountCode" => sort.Direction == SortDirection.Ascending
                        ? query.OrderBy(l => l.Account.AccountCode)
                        : query.OrderByDescending(l => l.Account.AccountCode),
                    "VoucherDate" => sort.Direction == SortDirection.Ascending
                        ? query.OrderBy(l => l.JournalVoucher.VoucherDate)
                        : query.OrderByDescending(l => l.JournalVoucher.VoucherDate),
                    "VoucherNumber" => sort.Direction == SortDirection.Ascending
                        ? query.OrderBy(l => l.JournalVoucher.VoucherNumber)
                        : query.OrderByDescending(l => l.JournalVoucher.VoucherNumber),
                    "PostingDate" => sort.Direction == SortDirection.Ascending
                        ? query.OrderBy(l => l.JournalVoucher.PostingDate)
                        : query.OrderByDescending(l => l.JournalVoucher.PostingDate),
                    "DebitBase" => sort.Direction == SortDirection.Ascending
                        ? query.OrderBy(l => l.DebitAmountBase)
                        : query.OrderByDescending(l => l.DebitAmountBase),
                    "CreditBase" => sort.Direction == SortDirection.Ascending
                        ? query.OrderBy(l => l.CreditAmountBase)
                        : query.OrderByDescending(l => l.CreditAmountBase),
                    _ => query.OrderBy(l => l.JournalVoucher.VoucherDate)
                };
            }
            else
            {
                ordered = sort.FieldName switch
                {
                    "AccountCode" => sort.Direction == SortDirection.Ascending
                        ? ordered.ThenBy(l => l.Account.AccountCode)
                        : ordered.ThenByDescending(l => l.Account.AccountCode),
                    "VoucherDate" => sort.Direction == SortDirection.Ascending
                        ? ordered.ThenBy(l => l.JournalVoucher.VoucherDate)
                        : ordered.ThenByDescending(l => l.JournalVoucher.VoucherDate),
                    "VoucherNumber" => sort.Direction == SortDirection.Ascending
                        ? ordered.ThenBy(l => l.JournalVoucher.VoucherNumber)
                        : ordered.ThenByDescending(l => l.JournalVoucher.VoucherNumber),
                    _ => ordered
                };
            }
        }

        return ordered ?? query.OrderBy(l => l.JournalVoucher.VoucherDate);
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
