using Carmen.Domain.Entities.GL;

namespace Carmen.Application.DTOs.GL;

// Response DTOs
public record RecurringVoucherDto(
    Guid Id,
    string Name,
    string? Description,
    RecurringFrequency Frequency,
    int? CustomIntervalDays,
    DateTime StartDate,
    DateTime? EndDate,
    DateTime NextExecutionDate,
    DateTime? LastExecutionDate,
    bool IsActive,
    string CurrencyCode,
    decimal ExchangeRate,
    string? Reference,
    decimal TotalDebit,
    decimal TotalCredit,
    int ExecutionCount,
    List<RecurringVoucherLineDto> Lines,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt
);

public record RecurringVoucherListDto(
    Guid Id,
    string Name,
    string? Description,
    RecurringFrequency Frequency,
    DateTime NextExecutionDate,
    DateTime? LastExecutionDate,
    bool IsActive,
    string CurrencyCode,
    decimal TotalDebit,
    decimal TotalCredit,
    int ExecutionCount,
    int LineCount,
    DateTime CreatedAt
);

public record RecurringVoucherLineDto(
    Guid Id,
    int LineNumber,
    Guid AccountId,
    string AccountCode,
    string AccountName,
    decimal DebitAmount,
    decimal CreditAmount,
    string? Description,
    string? Reference,
    Guid? DepartmentId,
    string? DepartmentName
);

// Request DTOs
public record CreateRecurringVoucherRequest(
    string Name,
    string? Description,
    RecurringFrequency Frequency,
    int? CustomIntervalDays,
    DateTime StartDate,
    DateTime? EndDate,
    string CurrencyCode,
    decimal ExchangeRate,
    string? Reference,
    List<CreateRecurringVoucherLineRequest> Lines
);

public record CreateRecurringVoucherLineRequest(
    Guid AccountId,
    decimal DebitAmount,
    decimal CreditAmount,
    string? Description,
    string? Reference,
    Guid? DepartmentId
);

public record UpdateRecurringVoucherRequest(
    string Name,
    string? Description,
    RecurringFrequency Frequency,
    int? CustomIntervalDays,
    DateTime StartDate,
    DateTime? EndDate,
    string CurrencyCode,
    decimal ExchangeRate,
    string? Reference,
    List<UpdateRecurringVoucherLineRequest> Lines
);

public record UpdateRecurringVoucherLineRequest(
    Guid? Id,
    Guid AccountId,
    decimal DebitAmount,
    decimal CreditAmount,
    string? Description,
    string? Reference,
    Guid? DepartmentId
);

// Query parameters
public record RecurringVoucherQueryParams(
    string? Search,
    bool? IsActive,
    RecurringFrequency? Frequency,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "Name",
    bool SortDescending = false
);
