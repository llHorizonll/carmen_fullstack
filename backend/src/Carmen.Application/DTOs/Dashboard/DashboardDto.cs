namespace Carmen.Application.DTOs.Dashboard;

public record DashboardSummaryDto(
    DashboardMetricDto TotalRevenue,
    DashboardMetricDto ApOutstanding,
    DashboardMetricDto ArOutstanding,
    DashboardMetricDto TotalAssets,
    List<MonthlyTrendDto> RevenueTrend,
    List<MonthlyTrendDto> ExpenseTrend,
    List<AgingBucketDto> ApAgingSummary,
    List<AgingBucketDto> ArAgingSummary,
    List<TopAccountDto> TopExpenseAccounts
);

public record DashboardMetricDto(
    decimal CurrentValue,
    decimal PreviousValue,
    decimal ChangePercent,
    string CurrencyCode
);

public record MonthlyTrendDto(
    string Month,
    decimal Amount
);

public record AgingBucketDto(
    string Label,
    decimal Amount,
    int Count
);

public record TopAccountDto(
    string AccountCode,
    string AccountName,
    decimal Amount
);
