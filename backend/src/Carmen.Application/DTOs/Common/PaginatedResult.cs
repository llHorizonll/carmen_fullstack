namespace Carmen.Application.DTOs.Common;

/// <summary>
/// Generic paginated result for list responses
/// </summary>
public record PaginatedResult<T>(
    List<T> Items,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);
