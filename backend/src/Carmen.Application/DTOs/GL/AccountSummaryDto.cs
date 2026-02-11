using Carmen.Domain.Entities.GL;

namespace Carmen.Application.DTOs.GL;

/// <summary>
/// Account summary with balance information
/// </summary>
public record AccountSummaryDto(
    Guid Id,
    string AccountCode,
    string AccountName,
    AccountType AccountType,
    decimal OpeningBalance,
    decimal TotalDebit,
    decimal TotalCredit,
    decimal ClosingBalance,
    DateTime AsOfDate
);

/// <summary>
/// Account balance for trial balance report
/// </summary>
public record AccountBalanceDto(
    Guid Id,
    string AccountCode,
    string AccountName,
    AccountType AccountType,
    int Level,
    bool IsHeader,
    decimal Debit,
    decimal Credit,
    decimal Balance
);

/// <summary>
/// Account ledger with transaction details
/// </summary>
public record AccountLedgerDto(
    Guid AccountId,
    string AccountCode,
    string AccountName,
    AccountType AccountType,
    DateTime FromDate,
    DateTime ToDate,
    decimal OpeningBalance,
    List<AccountLedgerLineDto> Transactions,
    decimal ClosingBalance
);

/// <summary>
/// Single transaction line in account ledger
/// </summary>
public record AccountLedgerLineDto(
    DateTime Date,
    string VoucherNumber,
    Guid VoucherId,
    string? Description,
    decimal Debit,
    decimal Credit,
    decimal RunningBalance
);

/// <summary>
/// Trial balance report result
/// </summary>
public record TrialBalanceDto(
    DateTime AsOfDate,
    Guid? FiscalPeriodId,
    string? FiscalPeriodName,
    List<AccountBalanceDto> Accounts,
    decimal TotalDebit,
    decimal TotalCredit,
    bool IsBalanced
);

/// <summary>
/// Query parameters for account summary
/// </summary>
public record AccountSummaryQueryParams(
    DateTime? AsOfDate = null,
    Guid? FiscalPeriodId = null
);

/// <summary>
/// Query parameters for account ledger
/// </summary>
public record AccountLedgerQueryParams(
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    Guid? FiscalPeriodId = null
);
