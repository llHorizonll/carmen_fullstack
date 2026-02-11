using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.GL;
using Carmen.Application.Services.GL;
using Carmen.Domain.Entities.GL;
using Carmen.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// Chart of Accounts management endpoints
/// </summary>
[ApiController]
[Route("api/v1/tenants/{tenantId:guid}/accounts")]
[Authorize]
public class AccountsController : ControllerBase
{
    private readonly IAccountService _accountService;
    private readonly ILogger<AccountsController> _logger;

    public AccountsController(
        IAccountService accountService,
        ILogger<AccountsController> logger)
    {
        _accountService = accountService;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of accounts
    /// </summary>
    [HttpGet]
    [RequirePermission("GL.ChartOfAccounts.View")]
    [ProducesResponseType(typeof(PaginatedResult<AccountListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<AccountListDto>>> GetAccounts(
        [FromRoute] Guid tenantId,
        [FromQuery] string? search,
        [FromQuery] AccountType? accountType,
        [FromQuery] bool? isActive,
        [FromQuery] bool? isHeader,
        [FromQuery] Guid? parentAccountId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string sortBy = "AccountCode",
        [FromQuery] bool sortDescending = false)
    {
        var query = new AccountQueryParams(
            Search: search,
            AccountType: accountType,
            IsActive: isActive,
            IsHeader: isHeader,
            ParentAccountId: parentAccountId,
            Page: page,
            PageSize: Math.Min(pageSize, 100),
            SortBy: sortBy,
            SortDescending: sortDescending
        );

        var result = await _accountService.GetAccountsAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// Get account by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [RequirePermission("GL.ChartOfAccounts.View")]
    [ProducesResponseType(typeof(AccountDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AccountDto>> GetAccount(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        var account = await _accountService.GetAccountByIdAsync(id);

        if (account == null)
        {
            return NotFound(new { message = "Account not found." });
        }

        return Ok(account);
    }

    /// <summary>
    /// Get account by code
    /// </summary>
    [HttpGet("by-code/{code}")]
    [RequirePermission("GL.ChartOfAccounts.View")]
    [ProducesResponseType(typeof(AccountDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AccountDto>> GetAccountByCode(
        [FromRoute] Guid tenantId,
        [FromRoute] string code)
    {
        var account = await _accountService.GetAccountByCodeAsync(code);

        if (account == null)
        {
            return NotFound(new { message = "Account not found." });
        }

        return Ok(account);
    }

    /// <summary>
    /// Get accounts as tree structure
    /// </summary>
    [HttpGet("tree")]
    [RequirePermission("GL.ChartOfAccounts.View")]
    [ProducesResponseType(typeof(List<AccountTreeDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<AccountTreeDto>>> GetAccountTree(
        [FromRoute] Guid tenantId,
        [FromQuery] AccountType? accountType)
    {
        var tree = await _accountService.GetAccountTreeAsync(accountType);
        return Ok(tree);
    }

    /// <summary>
    /// Get accounts for lookup (dropdown/select)
    /// </summary>
    [HttpGet("lookup")]
    [RequirePermission("GL.ChartOfAccounts.View")]
    [ProducesResponseType(typeof(List<AccountLookupDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<AccountLookupDto>>> GetAccountLookup(
        [FromRoute] Guid tenantId,
        [FromQuery] AccountType? accountType,
        [FromQuery] bool? allowPosting)
    {
        var accounts = await _accountService.GetAccountLookupAsync(accountType, allowPosting);
        return Ok(accounts);
    }

    /// <summary>
    /// Create a new account
    /// </summary>
    [HttpPost]
    [RequirePermission("GL.ChartOfAccounts.Create")]
    [ProducesResponseType(typeof(AccountDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AccountDto>> CreateAccount(
        [FromRoute] Guid tenantId,
        [FromBody] CreateAccountRequest request)
    {
        try
        {
            var account = await _accountService.CreateAccountAsync(request);
            _logger.LogInformation("Created account {AccountCode} for tenant {TenantId}",
                account.AccountCode, tenantId);

            return CreatedAtAction(
                nameof(GetAccount),
                new { tenantId, id = account.Id },
                account);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to create account: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing account
    /// </summary>
    [HttpPut("{id:guid}")]
    [RequirePermission("GL.ChartOfAccounts.Edit")]
    [ProducesResponseType(typeof(AccountDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AccountDto>> UpdateAccount(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] UpdateAccountRequest request)
    {
        try
        {
            var account = await _accountService.UpdateAccountAsync(id, request);
            _logger.LogInformation("Updated account {AccountCode} for tenant {TenantId}",
                account.AccountCode, tenantId);

            return Ok(account);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Account not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to update account {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete an account (soft delete)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [RequirePermission("GL.ChartOfAccounts.Delete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteAccount(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        try
        {
            await _accountService.DeleteAccountAsync(id);
            _logger.LogInformation("Deleted account {Id} for tenant {TenantId}", id, tenantId);

            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message == "Account not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to delete account {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Check if account code exists
    /// </summary>
    [HttpGet("check-code/{code}")]
    [RequirePermission("GL.ChartOfAccounts.View")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> CheckAccountCode(
        [FromRoute] Guid tenantId,
        [FromRoute] string code,
        [FromQuery] Guid? excludeId)
    {
        var exists = await _accountService.AccountCodeExistsAsync(code, excludeId);
        return Ok(new { exists });
    }

    /// <summary>
    /// Check if account has transactions
    /// </summary>
    [HttpGet("{id:guid}/has-transactions")]
    [RequirePermission("GL.ChartOfAccounts.View")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> CheckAccountHasTransactions(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        var hasTransactions = await _accountService.AccountHasTransactionsAsync(id);
        return Ok(new { hasTransactions });
    }

    /// <summary>
    /// Get account summary with balances
    /// </summary>
    [HttpGet("{id:guid}/summary")]
    [RequirePermission("GL.ChartOfAccounts.View")]
    [ProducesResponseType(typeof(AccountSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AccountSummaryDto>> GetAccountSummary(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromQuery] DateTime? asOfDate)
    {
        try
        {
            var summary = await _accountService.GetAccountSummaryAsync(id, asOfDate);
            return Ok(summary);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Account not found.")
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get account ledger with transaction details
    /// </summary>
    [HttpGet("{id:guid}/ledger")]
    [RequirePermission("GL.ChartOfAccounts.View")]
    [ProducesResponseType(typeof(AccountLedgerDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AccountLedgerDto>> GetAccountLedger(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate)
    {
        try
        {
            var ledger = await _accountService.GetAccountLedgerAsync(id, fromDate, toDate);
            return Ok(ledger);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Account not found.")
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get trial balance as of a specific date
    /// </summary>
    [HttpGet("trial-balance")]
    [RequirePermission("GL.ChartOfAccounts.View")]
    [ProducesResponseType(typeof(TrialBalanceDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<TrialBalanceDto>> GetTrialBalance(
        [FromRoute] Guid tenantId,
        [FromQuery] DateTime? asOfDate,
        [FromQuery] Guid? fiscalPeriodId)
    {
        var effectiveDate = asOfDate ?? DateTime.UtcNow.Date;
        var trialBalance = await _accountService.GetTrialBalanceAsync(effectiveDate, fiscalPeriodId);
        return Ok(trialBalance);
    }
}
