using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.GL;
using Carmen.Domain.Entities.GL;

namespace Carmen.Application.Services.GL;

public interface IAccountService
{
    /// <summary>
    /// Get paginated list of accounts
    /// </summary>
    Task<PaginatedResult<AccountListDto>> GetAccountsAsync(AccountQueryParams query);

    /// <summary>
    /// Get account by ID
    /// </summary>
    Task<AccountDto?> GetAccountByIdAsync(Guid id);

    /// <summary>
    /// Get account by code
    /// </summary>
    Task<AccountDto?> GetAccountByCodeAsync(string accountCode);

    /// <summary>
    /// Get accounts as tree structure
    /// </summary>
    Task<List<AccountTreeDto>> GetAccountTreeAsync(AccountType? accountType = null);

    /// <summary>
    /// Get accounts for lookup (dropdown/select)
    /// </summary>
    Task<List<AccountLookupDto>> GetAccountLookupAsync(AccountType? accountType = null, bool? allowPosting = null);

    /// <summary>
    /// Create a new account
    /// </summary>
    Task<AccountDto> CreateAccountAsync(CreateAccountRequest request);

    /// <summary>
    /// Update an existing account
    /// </summary>
    Task<AccountDto> UpdateAccountAsync(Guid id, UpdateAccountRequest request);

    /// <summary>
    /// Delete an account (soft delete by setting IsActive = false)
    /// </summary>
    Task DeleteAccountAsync(Guid id);

    /// <summary>
    /// Check if account code exists
    /// </summary>
    Task<bool> AccountCodeExistsAsync(string accountCode, Guid? excludeId = null);

    /// <summary>
    /// Check if account has transactions
    /// </summary>
    Task<bool> AccountHasTransactionsAsync(Guid id);

    /// <summary>
    /// Get account summary with balances
    /// </summary>
    Task<AccountSummaryDto> GetAccountSummaryAsync(Guid accountId, DateTime? asOfDate = null);

    /// <summary>
    /// Get account summary by account code
    /// </summary>
    Task<AccountSummaryDto> GetAccountSummaryByCodeAsync(string accountCode, DateTime? asOfDate = null);

    /// <summary>
    /// Get account ledger with transaction details
    /// </summary>
    Task<AccountLedgerDto> GetAccountLedgerAsync(Guid accountId, DateTime? fromDate = null, DateTime? toDate = null);

    /// <summary>
    /// Get trial balance as of a specific date
    /// </summary>
    Task<TrialBalanceDto> GetTrialBalanceAsync(DateTime asOfDate, Guid? fiscalPeriodId = null);
}
