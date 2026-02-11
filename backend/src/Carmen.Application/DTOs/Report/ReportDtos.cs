using Carmen.Domain.Entities.Report;

namespace Carmen.Application.DTOs.Report;

public enum PredefinedReportType
{
    TrialBalance,
    BalanceSheet,
    IncomeStatement,
    GeneralLedgerDetail,
    JournalVoucherListing,
    ApAging,
    ArAging,
    AssetRegister,
    DepreciationSchedule,
}

public record ReportFieldDefinition(
    string FieldName,
    string DisplayName,
    ColumnType ColumnType,
    bool IsFilterable,
    bool IsGroupable,
    bool IsSortable
);

public record ReportDataSet(
    string ReportTitle,
    string? ReportSubtitle,
    DateTime GeneratedAt,
    List<ReportColumnDefinition> Columns,
    List<Dictionary<string, object?>> Rows,
    List<ReportGroupDefinition>? Groups,
    Dictionary<string, object?>? GrandTotals
);

public record ReportColumnDefinition(
    string FieldName,
    string DisplayName,
    ColumnType ColumnType,
    int Width,
    AggregateFunction AggregateFunction
);

public record ReportGroupDefinition(
    string FieldName,
    string DisplayName,
    bool ShowSubtotals
);

public record ReportQueryRequest(
    DataSourceType DataSource,
    List<ReportQueryColumn> Columns,
    List<ReportQueryFilter>? Filters,
    List<ReportQueryGroup>? Groups,
    List<ReportQuerySort>? Sorts,
    int? MaxRows
);

public record ReportQueryColumn(
    string FieldName,
    string? DisplayName,
    AggregateFunction AggregateFunction
);

public record ReportQueryFilter(
    string FieldName,
    FilterOperator Operator,
    string? Value,
    string? Value2
);

public record ReportQueryGroup(
    string FieldName,
    bool ShowSubtotals
);

public record ReportQuerySort(
    string FieldName,
    SortDirection Direction
);

public record GenerateReportRequest(
    PredefinedReportType ReportType,
    OutputFormat OutputFormat,
    Dictionary<string, string> Parameters
);

public record ReportParameterDefinition(
    string Name,
    string Label,
    string ParameterType, // "date", "select", "text", "accountPicker"
    bool IsRequired,
    string? DefaultValue,
    List<ReportParameterOption>? Options
);

public record ReportParameterOption(
    string Value,
    string Label
);

public record PredefinedReportInfo(
    PredefinedReportType Type,
    string Name,
    string Description,
    string Category,
    string Icon
);

// Report Template DTOs for custom reports
public record ReportTemplateListDto(
    Guid Id,
    string Name,
    string? Description,
    DataSourceType DataSourceType,
    bool IsPublic,
    OutputFormat DefaultOutputFormat,
    DateTime CreatedAt,
    string CreatedBy
);

public record ReportTemplateDto(
    Guid Id,
    string Name,
    string? Description,
    DataSourceType DataSourceType,
    bool IsPublic,
    OutputFormat DefaultOutputFormat,
    PageOrientation PageOrientation,
    List<ReportTemplateColumnDto> Columns,
    List<ReportTemplateFilterDto> Filters,
    List<ReportTemplateGroupDto> Groups
);

public record ReportTemplateColumnDto(
    Guid? Id,
    string FieldName,
    string DisplayName,
    ColumnType ColumnType,
    int Width,
    int Order,
    AggregateFunction AggregateFunction,
    SortDirection? SortDirection,
    int? SortOrder
);

public record ReportTemplateFilterDto(
    Guid? Id,
    string FieldName,
    FilterOperator Operator,
    string? Value,
    string? Value2
);

public record ReportTemplateGroupDto(
    Guid? Id,
    string FieldName,
    int Order,
    bool ShowSubtotals,
    SortDirection SortDirection
);

public record CreateReportTemplateRequest(
    string Name,
    string? Description,
    DataSourceType DataSourceType,
    bool IsPublic,
    OutputFormat DefaultOutputFormat,
    PageOrientation PageOrientation,
    List<ReportTemplateColumnDto> Columns,
    List<ReportTemplateFilterDto>? Filters,
    List<ReportTemplateGroupDto>? Groups
);

public record UpdateReportTemplateRequest(
    string Name,
    string? Description,
    bool IsPublic,
    OutputFormat DefaultOutputFormat,
    PageOrientation PageOrientation,
    List<ReportTemplateColumnDto> Columns,
    List<ReportTemplateFilterDto>? Filters,
    List<ReportTemplateGroupDto>? Groups
);
