namespace Carmen.Application.DTOs.Jobs;

/// <summary>
/// DTO for job status information
/// </summary>
public record JobStatusDto(
    string JobId,
    string JobName,
    string Status,
    DateTime? LastExecution,
    DateTime? NextExecution,
    string? LastError,
    int SuccessCount,
    int FailureCount
);

/// <summary>
/// DTO for job history entry
/// </summary>
public record JobHistoryDto(
    string JobId,
    string JobName,
    DateTime ExecutedAt,
    TimeSpan Duration,
    bool Success,
    string? ErrorMessage
);

/// <summary>
/// Request to trigger depreciation job
/// </summary>
public record TriggerDepreciationRequest(
    Guid FiscalPeriodId,
    bool AutoPost = false
);

/// <summary>
/// Request to trigger recurring voucher processing
/// </summary>
public record TriggerRecurringVouchersRequest(
    DateTime? ProcessDate = null
);

/// <summary>
/// Request to trigger amortization job
/// </summary>
public record TriggerAmortizationRequest(
    Guid FiscalPeriodId,
    bool AutoPost = false
);

/// <summary>
/// Response from job trigger
/// </summary>
public record JobTriggerResponse(
    string JobId,
    string Message,
    DateTime EnqueuedAt
);
