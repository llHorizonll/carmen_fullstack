namespace Carmen.Application.DTOs.GL;

/// <summary>
/// Request to close a fiscal period
/// </summary>
public record ClosePeriodRequest(
    string? Comment
);

/// <summary>
/// Request to reopen a closed fiscal period
/// </summary>
public record ReopenPeriodRequest(
    string Reason
);

/// <summary>
/// Result of period close validation
/// </summary>
public record PeriodCloseValidationResult(
    bool CanClose,
    List<string> Warnings,
    List<string> Errors,
    int PendingVouchersCount,
    int DraftVouchersCount,
    int ApprovedVouchersCount,
    decimal TotalDebit,
    decimal TotalCredit,
    bool IsBalanced
);

/// <summary>
/// Summary of vouchers blocking period close
/// </summary>
public record PeriodBlockingVouchersDto(
    List<BlockingVoucherDto> DraftVouchers,
    List<BlockingVoucherDto> PendingVouchers,
    List<BlockingVoucherDto> ApprovedVouchers
);

/// <summary>
/// Voucher that blocks period closing
/// </summary>
public record BlockingVoucherDto(
    Guid Id,
    string VoucherNumber,
    DateTime VoucherDate,
    string Status,
    decimal TotalDebit,
    decimal TotalCredit,
    string? Description
);
