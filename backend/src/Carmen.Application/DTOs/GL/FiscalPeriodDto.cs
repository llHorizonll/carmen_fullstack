using Carmen.Domain.Entities.GL;

namespace Carmen.Application.DTOs.GL;

/// <summary>
/// Fiscal year response DTO
/// </summary>
public record FiscalYearDto(
    Guid Id,
    string Name,
    DateTime StartDate,
    DateTime EndDate,
    bool IsClosed,
    DateTime? ClosedAt,
    string? ClosedBy,
    int PeriodCount,
    int OpenPeriodCount,
    int ClosedPeriodCount,
    DateTime CreatedAt
);

/// <summary>
/// Fiscal year list DTO
/// </summary>
public record FiscalYearListDto(
    Guid Id,
    string Name,
    DateTime StartDate,
    DateTime EndDate,
    bool IsClosed,
    int PeriodCount
);

/// <summary>
/// Fiscal period response DTO
/// </summary>
public record FiscalPeriodDto(
    Guid Id,
    Guid FiscalYearId,
    string FiscalYearName,
    int PeriodNumber,
    string Name,
    DateTime StartDate,
    DateTime EndDate,
    PeriodStatus Status,
    DateTime? ClosedAt,
    string? ClosedBy,
    DateTime CreatedAt
);

/// <summary>
/// Fiscal period list DTO
/// </summary>
public record FiscalPeriodListDto(
    Guid Id,
    Guid FiscalYearId,
    int PeriodNumber,
    string Name,
    DateTime StartDate,
    DateTime EndDate,
    PeriodStatus Status,
    DateTime? ClosedAt
);

/// <summary>
/// Fiscal period lookup DTO for dropdowns
/// </summary>
public record FiscalPeriodLookupDto(
    Guid Id,
    string Name,
    DateTime StartDate,
    DateTime EndDate,
    PeriodStatus Status
);

/// <summary>
/// Create fiscal year request
/// </summary>
public record CreateFiscalYearRequest(
    string Name,
    DateTime StartDate,
    DateTime EndDate,
    bool CreateMonthlyPeriods = true
);

/// <summary>
/// Query parameters for fiscal periods
/// </summary>
public record FiscalPeriodQueryParams(
    Guid? FiscalYearId,
    PeriodStatus? Status,
    int Page = 1,
    int PageSize = 20
);
