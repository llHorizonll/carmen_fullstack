using Carmen.Application.DTOs.Report;
using Carmen.Application.Services.Report;
using Carmen.Domain.Entities.AR;
using Carmen.Domain.Entities.Report;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Carmen.Infrastructure.Services.Reports;

public class ArReportDataProvider : IReportDataProvider
{
    private readonly CarmenDbContext _context;

    public ArReportDataProvider(CarmenDbContext context)
    {
        _context = context;
    }

    public DataSourceType DataSource => DataSourceType.AccountsReceivable;

    public List<ReportFieldDefinition> GetAvailableFields() =>
    [
        new("CustomerCode", "Customer Code", ColumnType.Text, true, true, true),
        new("CustomerName", "Customer Name", ColumnType.Text, true, false, true),
        new("InvoiceNumber", "Invoice Number", ColumnType.Text, true, false, true),
        new("CustomerReference", "Customer Ref", ColumnType.Text, true, false, true),
        new("InvoiceDate", "Invoice Date", ColumnType.Date, true, false, true),
        new("DueDate", "Due Date", ColumnType.Date, true, false, true),
        new("Status", "Status", ColumnType.Text, true, true, true),
        new("Description", "Description", ColumnType.Text, true, false, false),
        new("CurrencyCode", "Currency", ColumnType.Text, true, true, false),
        new("SubTotal", "Subtotal", ColumnType.Currency, false, false, true),
        new("Tax1Amount", "Tax 1", ColumnType.Currency, false, false, true),
        new("Tax2Amount", "Tax 2", ColumnType.Currency, false, false, true),
        new("WhtAmount", "WHT", ColumnType.Currency, false, false, true),
        new("TotalAmount", "Total Amount", ColumnType.Currency, false, false, true),
        new("PaidAmount", "Paid Amount", ColumnType.Currency, false, false, true),
        new("BalanceAmount", "Balance", ColumnType.Currency, false, false, true),
        new("AgingDays", "Aging Days", ColumnType.Number, true, false, true),
    ];

    public async Task<ReportDataSet> ExecuteQueryAsync(ReportQueryRequest request)
    {
        var query = _context.ArInvoices
            .Include(i => i.Customer)
            .AsQueryable();

        query = ApplyFilters(query, request.Filters);

        IQueryable<ArInvoice> sortedQuery = ApplySorts(query, request.Sorts);

        if (request.MaxRows.HasValue)
            sortedQuery = sortedQuery.Take(request.MaxRows.Value);

        var today = DateTime.UtcNow.Date;

        var invoices = await sortedQuery
            .Select(i => new
            {
                i.Customer.CustomerCode,
                i.Customer.CustomerName,
                i.InvoiceNumber,
                i.CustomerReference,
                i.InvoiceDate,
                i.DueDate,
                Status = i.Status.ToString(),
                i.Description,
                i.CurrencyCode,
                i.SubTotal,
                i.Tax1Amount,
                i.Tax2Amount,
                i.WhtAmount,
                i.TotalAmount,
                i.PaidAmount,
                i.BalanceAmount,
            })
            .ToListAsync();

        var rows = invoices.Select(i => new Dictionary<string, object?>
        {
            ["CustomerCode"] = i.CustomerCode,
            ["CustomerName"] = i.CustomerName,
            ["InvoiceNumber"] = i.InvoiceNumber,
            ["CustomerReference"] = i.CustomerReference ?? "",
            ["InvoiceDate"] = i.InvoiceDate,
            ["DueDate"] = i.DueDate,
            ["Status"] = i.Status,
            ["Description"] = i.Description ?? "",
            ["CurrencyCode"] = i.CurrencyCode,
            ["SubTotal"] = i.SubTotal,
            ["Tax1Amount"] = i.Tax1Amount,
            ["Tax2Amount"] = i.Tax2Amount,
            ["WhtAmount"] = i.WhtAmount,
            ["TotalAmount"] = i.TotalAmount,
            ["PaidAmount"] = i.PaidAmount,
            ["BalanceAmount"] = i.BalanceAmount,
            ["AgingDays"] = i.DueDate < today ? (today - i.DueDate).Days : 0,
        }).ToList();

        var columns = BuildColumns(request.Columns);

        return new ReportDataSet(
            ReportTitle: "Accounts Receivable Report",
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

    private static IQueryable<ArInvoice> ApplyFilters(
        IQueryable<ArInvoice> query, List<ReportQueryFilter>? filters)
    {
        if (filters == null) return query;

        foreach (var filter in filters)
        {
            query = filter.FieldName switch
            {
                "CustomerCode" => ApplyStringFilter(query, filter, i => i.Customer.CustomerCode),
                "CustomerName" => ApplyStringFilter(query, filter, i => i.Customer.CustomerName),
                "InvoiceNumber" => ApplyStringFilter(query, filter, i => i.InvoiceNumber),
                "InvoiceDate" => ApplyDateFilter(query, filter, i => i.InvoiceDate),
                "DueDate" => ApplyDateFilter(query, filter, i => i.DueDate),
                "Status" => ApplyStatusFilter(query, filter),
                "CurrencyCode" => ApplyStringFilter(query, filter, i => i.CurrencyCode),
                _ => query
            };
        }

        return query;
    }

    private static IQueryable<ArInvoice> ApplyStringFilter(
        IQueryable<ArInvoice> query,
        ReportQueryFilter filter,
        System.Linq.Expressions.Expression<Func<ArInvoice, string>> selector)
    {
        var value = filter.Value ?? "";
        var compiled = selector.Compile();

        return filter.Operator switch
        {
            FilterOperator.Equals => query.Where(i => compiled(i) == value),
            FilterOperator.NotEquals => query.Where(i => compiled(i) != value),
            FilterOperator.Contains => query.Where(i => compiled(i).Contains(value)),
            FilterOperator.StartsWith => query.Where(i => compiled(i).StartsWith(value)),
            _ => query
        };
    }

    private static IQueryable<ArInvoice> ApplyStatusFilter(
        IQueryable<ArInvoice> query, ReportQueryFilter filter)
    {
        if (Enum.TryParse<ArInvoiceStatus>(filter.Value, out var status))
        {
            return filter.Operator switch
            {
                FilterOperator.Equals => query.Where(i => i.Status == status),
                FilterOperator.NotEquals => query.Where(i => i.Status != status),
                _ => query
            };
        }
        return query;
    }

    private static IQueryable<ArInvoice> ApplyDateFilter(
        IQueryable<ArInvoice> query,
        ReportQueryFilter filter,
        System.Linq.Expressions.Expression<Func<ArInvoice, DateTime>> selector)
    {
        var compiled = selector.Compile();

        if (filter.Operator == FilterOperator.Between
            && DateTime.TryParse(filter.Value, out var from)
            && DateTime.TryParse(filter.Value2, out var to))
        {
            return query.Where(i => compiled(i) >= from && compiled(i) <= to);
        }

        if (DateTime.TryParse(filter.Value, out var dateValue))
        {
            return filter.Operator switch
            {
                FilterOperator.Equals => query.Where(i => compiled(i).Date == dateValue.Date),
                FilterOperator.GreaterThan => query.Where(i => compiled(i) > dateValue),
                FilterOperator.GreaterThanOrEqual => query.Where(i => compiled(i) >= dateValue),
                FilterOperator.LessThan => query.Where(i => compiled(i) < dateValue),
                FilterOperator.LessThanOrEqual => query.Where(i => compiled(i) <= dateValue),
                _ => query
            };
        }

        return query;
    }

    private static IOrderedQueryable<ArInvoice> ApplySorts(
        IQueryable<ArInvoice> query, List<ReportQuerySort>? sorts)
    {
        if (sorts == null || sorts.Count == 0)
            return query.OrderByDescending(i => i.InvoiceDate);

        IOrderedQueryable<ArInvoice>? ordered = null;

        foreach (var sort in sorts)
        {
            if (ordered == null)
            {
                ordered = sort.FieldName switch
                {
                    "CustomerCode" => sort.Direction == SortDirection.Ascending
                        ? query.OrderBy(i => i.Customer.CustomerCode) : query.OrderByDescending(i => i.Customer.CustomerCode),
                    "InvoiceNumber" => sort.Direction == SortDirection.Ascending
                        ? query.OrderBy(i => i.InvoiceNumber) : query.OrderByDescending(i => i.InvoiceNumber),
                    "InvoiceDate" => sort.Direction == SortDirection.Ascending
                        ? query.OrderBy(i => i.InvoiceDate) : query.OrderByDescending(i => i.InvoiceDate),
                    "DueDate" => sort.Direction == SortDirection.Ascending
                        ? query.OrderBy(i => i.DueDate) : query.OrderByDescending(i => i.DueDate),
                    "TotalAmount" => sort.Direction == SortDirection.Ascending
                        ? query.OrderBy(i => i.TotalAmount) : query.OrderByDescending(i => i.TotalAmount),
                    "BalanceAmount" => sort.Direction == SortDirection.Ascending
                        ? query.OrderBy(i => i.BalanceAmount) : query.OrderByDescending(i => i.BalanceAmount),
                    _ => query.OrderByDescending(i => i.InvoiceDate)
                };
            }
            else
            {
                ordered = sort.FieldName switch
                {
                    "CustomerCode" => sort.Direction == SortDirection.Ascending
                        ? ordered.ThenBy(i => i.Customer.CustomerCode) : ordered.ThenByDescending(i => i.Customer.CustomerCode),
                    "InvoiceDate" => sort.Direction == SortDirection.Ascending
                        ? ordered.ThenBy(i => i.InvoiceDate) : ordered.ThenByDescending(i => i.InvoiceDate),
                    _ => ordered
                };
            }
        }

        return ordered ?? query.OrderByDescending(i => i.InvoiceDate);
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
