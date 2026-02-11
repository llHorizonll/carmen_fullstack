using Carmen.Application.DTOs.Report;
using Carmen.Application.Services.Report;
using Carmen.Domain.Entities.Report;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Carmen.Infrastructure.Services.Reports;

public class ReportTemplateService : IReportTemplateService
{
    private readonly CarmenDbContext _context;
    private readonly IEnumerable<IReportDataProvider> _dataProviders;
    private readonly IPdfReportRenderer _pdfRenderer;
    private readonly IExcelReportRenderer _excelRenderer;

    public ReportTemplateService(
        CarmenDbContext context,
        IEnumerable<IReportDataProvider> dataProviders,
        IPdfReportRenderer pdfRenderer,
        IExcelReportRenderer excelRenderer)
    {
        _context = context;
        _dataProviders = dataProviders;
        _pdfRenderer = pdfRenderer;
        _excelRenderer = excelRenderer;
    }

    public async Task<List<ReportTemplateListDto>> GetTemplatesAsync()
    {
        return await _context.ReportTemplates
            .OrderBy(t => t.Name)
            .Select(t => new ReportTemplateListDto(
                t.Id, t.Name, t.Description, t.DataSourceType,
                t.IsPublic, t.DefaultOutputFormat, t.CreatedAt, t.CreatedBy
            ))
            .ToListAsync();
    }

    public async Task<ReportTemplateDto?> GetTemplateAsync(Guid id)
    {
        var template = await _context.ReportTemplates
            .Include(t => t.Columns.OrderBy(c => c.Order))
            .Include(t => t.Filters)
            .Include(t => t.Groups.OrderBy(g => g.Order))
            .FirstOrDefaultAsync(t => t.Id == id);

        if (template == null) return null;

        return MapToDto(template);
    }

    public async Task<ReportTemplateDto> CreateTemplateAsync(CreateReportTemplateRequest request)
    {
        var template = new ReportTemplate
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            DataSourceType = request.DataSourceType,
            IsPublic = request.IsPublic,
            DefaultOutputFormat = request.DefaultOutputFormat,
            PageOrientation = request.PageOrientation,
        };

        foreach (var col in request.Columns)
        {
            template.Columns.Add(new ReportTemplateColumn
            {
                Id = Guid.NewGuid(),
                FieldName = col.FieldName,
                DisplayName = col.DisplayName,
                ColumnType = col.ColumnType,
                Width = col.Width,
                Order = col.Order,
                AggregateFunction = col.AggregateFunction,
                SortDirection = col.SortDirection,
                SortOrder = col.SortOrder,
            });
        }

        if (request.Filters != null)
        {
            foreach (var f in request.Filters)
            {
                template.Filters.Add(new ReportTemplateFilter
                {
                    Id = Guid.NewGuid(),
                    FieldName = f.FieldName,
                    Operator = f.Operator,
                    Value = f.Value,
                    Value2 = f.Value2,
                });
            }
        }

        if (request.Groups != null)
        {
            foreach (var g in request.Groups)
            {
                template.Groups.Add(new ReportTemplateGroup
                {
                    Id = Guid.NewGuid(),
                    FieldName = g.FieldName,
                    Order = g.Order,
                    ShowSubtotals = g.ShowSubtotals,
                    SortDirection = g.SortDirection,
                });
            }
        }

        _context.ReportTemplates.Add(template);
        await _context.SaveChangesAsync();

        return MapToDto(template);
    }

    public async Task<ReportTemplateDto> UpdateTemplateAsync(Guid id, UpdateReportTemplateRequest request)
    {
        var template = await _context.ReportTemplates
            .Include(t => t.Columns)
            .Include(t => t.Filters)
            .Include(t => t.Groups)
            .FirstOrDefaultAsync(t => t.Id == id)
            ?? throw new KeyNotFoundException($"Template {id} not found");

        template.Name = request.Name;
        template.Description = request.Description;
        template.IsPublic = request.IsPublic;
        template.DefaultOutputFormat = request.DefaultOutputFormat;
        template.PageOrientation = request.PageOrientation;

        // Replace columns
        _context.ReportTemplateColumns.RemoveRange(template.Columns);
        template.Columns.Clear();
        foreach (var col in request.Columns)
        {
            template.Columns.Add(new ReportTemplateColumn
            {
                Id = Guid.NewGuid(),
                FieldName = col.FieldName,
                DisplayName = col.DisplayName,
                ColumnType = col.ColumnType,
                Width = col.Width,
                Order = col.Order,
                AggregateFunction = col.AggregateFunction,
                SortDirection = col.SortDirection,
                SortOrder = col.SortOrder,
            });
        }

        // Replace filters
        _context.ReportTemplateFilters.RemoveRange(template.Filters);
        template.Filters.Clear();
        if (request.Filters != null)
        {
            foreach (var f in request.Filters)
            {
                template.Filters.Add(new ReportTemplateFilter
                {
                    Id = Guid.NewGuid(),
                    FieldName = f.FieldName,
                    Operator = f.Operator,
                    Value = f.Value,
                    Value2 = f.Value2,
                });
            }
        }

        // Replace groups
        _context.ReportTemplateGroups.RemoveRange(template.Groups);
        template.Groups.Clear();
        if (request.Groups != null)
        {
            foreach (var g in request.Groups)
            {
                template.Groups.Add(new ReportTemplateGroup
                {
                    Id = Guid.NewGuid(),
                    FieldName = g.FieldName,
                    Order = g.Order,
                    ShowSubtotals = g.ShowSubtotals,
                    SortDirection = g.SortDirection,
                });
            }
        }

        await _context.SaveChangesAsync();
        return MapToDto(template);
    }

    public async Task DeleteTemplateAsync(Guid id)
    {
        var template = await _context.ReportTemplates.FindAsync(id)
            ?? throw new KeyNotFoundException($"Template {id} not found");
        _context.ReportTemplates.Remove(template);
        await _context.SaveChangesAsync();
    }

    public async Task<ReportDataSet> PreviewAsync(Guid templateId, Dictionary<string, string>? runtimeFilters = null)
    {
        var template = await _context.ReportTemplates
            .Include(t => t.Columns.OrderBy(c => c.Order))
            .Include(t => t.Filters)
            .Include(t => t.Groups.OrderBy(g => g.Order))
            .FirstOrDefaultAsync(t => t.Id == templateId)
            ?? throw new KeyNotFoundException($"Template {templateId} not found");

        var provider = _dataProviders.FirstOrDefault(p => p.DataSource == template.DataSourceType)
            ?? throw new InvalidOperationException($"No data provider for {template.DataSourceType}");

        var queryRequest = new ReportQueryRequest(
            DataSource: template.DataSourceType,
            Columns: template.Columns.Select(c => new ReportQueryColumn(
                c.FieldName, c.DisplayName, c.AggregateFunction
            )).ToList(),
            Filters: template.Filters.Select(f => new ReportQueryFilter(
                f.FieldName, f.Operator, f.Value, f.Value2
            )).ToList(),
            Groups: template.Groups.Select(g => new ReportQueryGroup(
                g.FieldName, g.ShowSubtotals
            )).ToList(),
            Sorts: template.Columns
                .Where(c => c.SortDirection.HasValue)
                .OrderBy(c => c.SortOrder ?? 0)
                .Select(c => new ReportQuerySort(c.FieldName, c.SortDirection!.Value))
                .ToList(),
            MaxRows: null
        );

        return await provider.ExecuteQueryAsync(queryRequest);
    }

    public async Task<byte[]> GenerateAsync(Guid templateId, OutputFormat format, Dictionary<string, string>? runtimeFilters = null)
    {
        var dataSet = await PreviewAsync(templateId, runtimeFilters);
        var template = await _context.ReportTemplates.FindAsync(templateId);

        return format switch
        {
            OutputFormat.Pdf => await _pdfRenderer.RenderAsync(dataSet, template?.PageOrientation ?? PageOrientation.Portrait),
            OutputFormat.Excel => await _excelRenderer.RenderAsync(dataSet),
            _ => throw new ArgumentException($"Unsupported format: {format}")
        };
    }

    public List<ReportFieldDefinition> GetAvailableFields(DataSourceType dataSource)
    {
        var provider = _dataProviders.FirstOrDefault(p => p.DataSource == dataSource);
        return provider?.GetAvailableFields() ?? [];
    }

    private static ReportTemplateDto MapToDto(ReportTemplate t) => new(
        t.Id, t.Name, t.Description, t.DataSourceType,
        t.IsPublic, t.DefaultOutputFormat, t.PageOrientation,
        t.Columns.OrderBy(c => c.Order).Select(c => new ReportTemplateColumnDto(
            c.Id, c.FieldName, c.DisplayName, c.ColumnType,
            c.Width, c.Order, c.AggregateFunction, c.SortDirection, c.SortOrder
        )).ToList(),
        t.Filters.Select(f => new ReportTemplateFilterDto(
            f.Id, f.FieldName, f.Operator, f.Value, f.Value2
        )).ToList(),
        t.Groups.OrderBy(g => g.Order).Select(g => new ReportTemplateGroupDto(
            g.Id, g.FieldName, g.Order, g.ShowSubtotals, g.SortDirection
        )).ToList()
    );
}
