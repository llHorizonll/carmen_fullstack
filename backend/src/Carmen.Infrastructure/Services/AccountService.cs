using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.GL;
using Carmen.Application.Interfaces;
using Carmen.Application.Services.GL;
using Carmen.Domain.Entities.GL;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Services;

public class AccountService : IAccountService
{
    private readonly CarmenDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<AccountService> _logger;

    public AccountService(
        CarmenDbContext context,
        ICurrentUserService currentUserService,
        ILogger<AccountService> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<PaginatedResult<AccountListDto>> GetAccountsAsync(AccountQueryParams query)
    {
        var queryable = _context.ChartOfAccounts.AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.ToLower();
            queryable = queryable.Where(a =>
                a.AccountCode.ToLower().Contains(search) ||
                a.AccountName.ToLower().Contains(search) ||
                (a.AccountNameLocal != null && a.AccountNameLocal.ToLower().Contains(search)));
        }

        if (query.AccountType.HasValue)
        {
            queryable = queryable.Where(a => a.AccountType == query.AccountType.Value);
        }

        if (query.IsActive.HasValue)
        {
            queryable = queryable.Where(a => a.IsActive == query.IsActive.Value);
        }

        if (query.IsHeader.HasValue)
        {
            queryable = queryable.Where(a => a.IsHeader == query.IsHeader.Value);
        }

        if (query.ParentAccountId.HasValue)
        {
            queryable = queryable.Where(a => a.ParentAccountId == query.ParentAccountId.Value);
        }

        // Get total count
        var totalCount = await queryable.CountAsync();

        // Apply sorting
        queryable = query.SortBy.ToLower() switch
        {
            "accountname" => query.SortDescending
                ? queryable.OrderByDescending(a => a.AccountName)
                : queryable.OrderBy(a => a.AccountName),
            "accounttype" => query.SortDescending
                ? queryable.OrderByDescending(a => a.AccountType)
                : queryable.OrderBy(a => a.AccountType),
            "level" => query.SortDescending
                ? queryable.OrderByDescending(a => a.Level)
                : queryable.OrderBy(a => a.Level),
            _ => query.SortDescending
                ? queryable.OrderByDescending(a => a.AccountCode)
                : queryable.OrderBy(a => a.AccountCode)
        };

        // Apply pagination
        var items = await queryable
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(a => new AccountListDto(
                a.Id,
                a.AccountCode,
                a.AccountName,
                a.AccountType,
                a.Level,
                a.IsHeader,
                a.IsActive,
                a.AllowPosting))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize);

        return new PaginatedResult<AccountListDto>(items, totalCount, query.Page, query.PageSize, totalPages);
    }

    public async Task<AccountDto?> GetAccountByIdAsync(Guid id)
    {
        var account = await _context.ChartOfAccounts
            .Include(a => a.ParentAccount)
            .FirstOrDefaultAsync(a => a.Id == id);

        return account == null ? null : MapToDto(account);
    }

    public async Task<AccountDto?> GetAccountByCodeAsync(string accountCode)
    {
        var account = await _context.ChartOfAccounts
            .Include(a => a.ParentAccount)
            .FirstOrDefaultAsync(a => a.AccountCode == accountCode);

        return account == null ? null : MapToDto(account);
    }

    public async Task<List<AccountTreeDto>> GetAccountTreeAsync(AccountType? accountType = null)
    {
        var queryable = _context.ChartOfAccounts.AsQueryable();

        if (accountType.HasValue)
        {
            queryable = queryable.Where(a => a.AccountType == accountType.Value);
        }

        var accounts = await queryable
            .Where(a => a.IsActive)
            .OrderBy(a => a.AccountCode)
            .ToListAsync();

        // Build tree structure
        var rootAccounts = accounts.Where(a => a.ParentAccountId == null).ToList();
        return rootAccounts.Select(a => BuildTreeNode(a, accounts)).ToList();
    }

    public async Task<List<AccountLookupDto>> GetAccountLookupAsync(AccountType? accountType = null, bool? allowPosting = null)
    {
        var queryable = _context.ChartOfAccounts
            .Where(a => a.IsActive);

        if (accountType.HasValue)
        {
            queryable = queryable.Where(a => a.AccountType == accountType.Value);
        }

        if (allowPosting.HasValue)
        {
            queryable = queryable.Where(a => a.AllowPosting == allowPosting.Value);
        }

        return await queryable
            .OrderBy(a => a.AccountCode)
            .Select(a => new AccountLookupDto(
                a.Id,
                a.AccountCode,
                a.AccountName,
                a.AccountType))
            .ToListAsync();
    }

    public async Task<AccountDto> CreateAccountAsync(CreateAccountRequest request)
    {
        // Validate account code doesn't exist
        if (await AccountCodeExistsAsync(request.AccountCode))
        {
            throw new InvalidOperationException($"Account code '{request.AccountCode}' already exists.");
        }

        // Validate parent account if specified
        int level = 1;
        if (request.ParentAccountId.HasValue)
        {
            var parent = await _context.ChartOfAccounts
                .FirstOrDefaultAsync(a => a.Id == request.ParentAccountId.Value);

            if (parent == null)
            {
                throw new InvalidOperationException("Parent account not found.");
            }

            level = parent.Level + 1;
        }

        var tenantId = _currentUserService.TenantId
            ?? throw new InvalidOperationException("Tenant context is required.");

        var account = new ChartOfAccount
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            AccountCode = request.AccountCode,
            AccountName = request.AccountName,
            AccountNameLocal = request.AccountNameLocal,
            AccountType = request.AccountType,
            ParentAccountId = request.ParentAccountId,
            Level = level,
            IsHeader = request.IsHeader,
            Description = request.Description,
            CurrencyCode = request.CurrencyCode,
            AllowPosting = request.AllowPosting,
            IsActive = true,
            CreatedBy = _currentUserService.Email ?? "system"
        };

        _context.ChartOfAccounts.Add(account);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created account {AccountCode} with ID {AccountId}",
            account.AccountCode, account.Id);

        // Reload with parent for mapping
        await _context.Entry(account).Reference(a => a.ParentAccount).LoadAsync();

        return MapToDto(account);
    }

    public async Task<AccountDto> UpdateAccountAsync(Guid id, UpdateAccountRequest request)
    {
        var account = await _context.ChartOfAccounts
            .FirstOrDefaultAsync(a => a.Id == id);

        if (account == null)
        {
            throw new InvalidOperationException("Account not found.");
        }

        // Validate parent account if changed
        if (request.ParentAccountId != account.ParentAccountId)
        {
            if (request.ParentAccountId.HasValue)
            {
                // Can't set parent to self
                if (request.ParentAccountId.Value == id)
                {
                    throw new InvalidOperationException("Account cannot be its own parent.");
                }

                var parent = await _context.ChartOfAccounts
                    .FirstOrDefaultAsync(a => a.Id == request.ParentAccountId.Value);

                if (parent == null)
                {
                    throw new InvalidOperationException("Parent account not found.");
                }

                // Check for circular reference
                if (await IsDescendantOfAsync(parent.Id, id))
                {
                    throw new InvalidOperationException("Circular parent reference detected.");
                }

                account.Level = parent.Level + 1;
            }
            else
            {
                account.Level = 1;
            }
        }

        account.AccountName = request.AccountName;
        account.AccountNameLocal = request.AccountNameLocal;
        account.ParentAccountId = request.ParentAccountId;
        account.IsHeader = request.IsHeader;
        account.Description = request.Description;
        account.CurrencyCode = request.CurrencyCode;
        account.AllowPosting = request.AllowPosting;
        account.IsActive = request.IsActive;
        account.UpdatedBy = _currentUserService.Email;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated account {AccountCode} with ID {AccountId}",
            account.AccountCode, account.Id);

        // Reload with parent for mapping
        await _context.Entry(account).Reference(a => a.ParentAccount).LoadAsync();

        return MapToDto(account);
    }

    public async Task DeleteAccountAsync(Guid id)
    {
        var account = await _context.ChartOfAccounts
            .FirstOrDefaultAsync(a => a.Id == id);

        if (account == null)
        {
            throw new InvalidOperationException("Account not found.");
        }

        // Check if account has transactions
        if (await AccountHasTransactionsAsync(id))
        {
            throw new InvalidOperationException("Cannot delete account with existing transactions. Deactivate it instead.");
        }

        // Check if account has children
        var hasChildren = await _context.ChartOfAccounts
            .AnyAsync(a => a.ParentAccountId == id);

        if (hasChildren)
        {
            throw new InvalidOperationException("Cannot delete account with child accounts.");
        }

        // Soft delete
        account.IsActive = false;
        account.UpdatedBy = _currentUserService.Email;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted (deactivated) account {AccountCode} with ID {AccountId}",
            account.AccountCode, account.Id);
    }

    public async Task<bool> AccountCodeExistsAsync(string accountCode, Guid? excludeId = null)
    {
        var query = _context.ChartOfAccounts
            .Where(a => a.AccountCode == accountCode);

        if (excludeId.HasValue)
        {
            query = query.Where(a => a.Id != excludeId.Value);
        }

        return await query.AnyAsync();
    }

    public async Task<bool> AccountHasTransactionsAsync(Guid id)
    {
        return await _context.JournalVoucherLines
            .AnyAsync(l => l.AccountId == id);
    }

    private static AccountDto MapToDto(ChartOfAccount account)
    {
        return new AccountDto(
            Id: account.Id,
            AccountCode: account.AccountCode,
            AccountName: account.AccountName,
            AccountNameLocal: account.AccountNameLocal,
            AccountType: account.AccountType,
            ParentAccountId: account.ParentAccountId,
            ParentAccountCode: account.ParentAccount?.AccountCode,
            ParentAccountName: account.ParentAccount?.AccountName,
            Level: account.Level,
            IsHeader: account.IsHeader,
            IsActive: account.IsActive,
            Description: account.Description,
            CurrencyCode: account.CurrencyCode,
            AllowPosting: account.AllowPosting,
            CreatedAt: account.CreatedAt,
            UpdatedAt: account.UpdatedAt
        );
    }

    private static AccountTreeDto BuildTreeNode(ChartOfAccount account, List<ChartOfAccount> allAccounts)
    {
        var children = allAccounts
            .Where(a => a.ParentAccountId == account.Id)
            .Select(a => BuildTreeNode(a, allAccounts))
            .ToList();

        return new AccountTreeDto(
            Id: account.Id,
            AccountCode: account.AccountCode,
            AccountName: account.AccountName,
            AccountType: account.AccountType,
            Level: account.Level,
            IsHeader: account.IsHeader,
            IsActive: account.IsActive,
            AllowPosting: account.AllowPosting,
            Children: children
        );
    }

    private async Task<bool> IsDescendantOfAsync(Guid accountId, Guid potentialAncestorId)
    {
        var current = await _context.ChartOfAccounts
            .FirstOrDefaultAsync(a => a.Id == accountId);

        while (current != null && current.ParentAccountId.HasValue)
        {
            if (current.ParentAccountId.Value == potentialAncestorId)
            {
                return true;
            }

            current = await _context.ChartOfAccounts
                .FirstOrDefaultAsync(a => a.Id == current.ParentAccountId.Value);
        }

        return false;
    }

    public async Task<AccountSummaryDto> GetAccountSummaryAsync(Guid accountId, DateTime? asOfDate = null)
    {
        var account = await _context.ChartOfAccounts
            .FirstOrDefaultAsync(a => a.Id == accountId);

        if (account == null)
        {
            throw new InvalidOperationException("Account not found.");
        }

        var effectiveDate = asOfDate ?? DateTime.UtcNow.Date;

        // Get all posted transactions for this account up to the as-of date
        var transactions = await _context.JournalVoucherLines
            .Include(l => l.JournalVoucher)
            .Where(l => l.AccountId == accountId &&
                        l.JournalVoucher.Status == DocumentStatus.Posted &&
                        l.JournalVoucher.VoucherDate <= effectiveDate)
            .Select(l => new { l.DebitAmount, l.CreditAmount })
            .ToListAsync();

        var totalDebit = transactions.Sum(t => t.DebitAmount);
        var totalCredit = transactions.Sum(t => t.CreditAmount);

        // Calculate balance based on account type
        // Assets and Expenses have normal debit balance (Debit - Credit)
        // Liabilities, Equity, and Revenue have normal credit balance (Credit - Debit)
        var closingBalance = CalculateBalance(account.AccountType, totalDebit, totalCredit);

        return new AccountSummaryDto(
            Id: account.Id,
            AccountCode: account.AccountCode,
            AccountName: account.AccountName,
            AccountType: account.AccountType,
            OpeningBalance: 0, // Opening balance would require period start calculation
            TotalDebit: totalDebit,
            TotalCredit: totalCredit,
            ClosingBalance: closingBalance,
            AsOfDate: effectiveDate
        );
    }

    public async Task<AccountSummaryDto> GetAccountSummaryByCodeAsync(string accountCode, DateTime? asOfDate = null)
    {
        var account = await _context.ChartOfAccounts
            .FirstOrDefaultAsync(a => a.AccountCode == accountCode);

        if (account == null)
        {
            throw new InvalidOperationException($"Account with code '{accountCode}' not found.");
        }

        return await GetAccountSummaryAsync(account.Id, asOfDate);
    }

    public async Task<AccountLedgerDto> GetAccountLedgerAsync(Guid accountId, DateTime? fromDate = null, DateTime? toDate = null)
    {
        var account = await _context.ChartOfAccounts
            .FirstOrDefaultAsync(a => a.Id == accountId);

        if (account == null)
        {
            throw new InvalidOperationException("Account not found.");
        }

        var effectiveFromDate = fromDate ?? DateTime.MinValue;
        var effectiveToDate = toDate ?? DateTime.UtcNow.Date;

        // Get opening balance (all transactions before fromDate)
        decimal openingBalance = 0;
        if (fromDate.HasValue)
        {
            var priorTransactions = await _context.JournalVoucherLines
                .Include(l => l.JournalVoucher)
                .Where(l => l.AccountId == accountId &&
                            l.JournalVoucher.Status == DocumentStatus.Posted &&
                            l.JournalVoucher.VoucherDate < fromDate.Value)
                .Select(l => new { l.DebitAmount, l.CreditAmount })
                .ToListAsync();

            var priorDebit = priorTransactions.Sum(t => t.DebitAmount);
            var priorCredit = priorTransactions.Sum(t => t.CreditAmount);
            openingBalance = CalculateBalance(account.AccountType, priorDebit, priorCredit);
        }

        // Get transactions in the date range
        var transactions = await _context.JournalVoucherLines
            .Include(l => l.JournalVoucher)
            .Where(l => l.AccountId == accountId &&
                        l.JournalVoucher.Status == DocumentStatus.Posted &&
                        l.JournalVoucher.VoucherDate >= effectiveFromDate &&
                        l.JournalVoucher.VoucherDate <= effectiveToDate)
            .OrderBy(l => l.JournalVoucher.VoucherDate)
            .ThenBy(l => l.JournalVoucher.VoucherNumber)
            .Select(l => new
            {
                Date = l.JournalVoucher.VoucherDate,
                VoucherNumber = l.JournalVoucher.VoucherNumber,
                VoucherId = l.JournalVoucherId,
                Description = l.Description ?? l.JournalVoucher.Description,
                l.DebitAmount,
                l.CreditAmount
            })
            .ToListAsync();

        // Build ledger lines with running balance
        var ledgerLines = new List<AccountLedgerLineDto>();
        var runningBalance = openingBalance;

        foreach (var t in transactions)
        {
            // Update running balance based on account type
            if (account.AccountType == AccountType.Asset || account.AccountType == AccountType.Expense)
            {
                runningBalance += t.DebitAmount - t.CreditAmount;
            }
            else
            {
                runningBalance += t.CreditAmount - t.DebitAmount;
            }

            ledgerLines.Add(new AccountLedgerLineDto(
                Date: t.Date,
                VoucherNumber: t.VoucherNumber,
                VoucherId: t.VoucherId,
                Description: t.Description,
                Debit: t.DebitAmount,
                Credit: t.CreditAmount,
                RunningBalance: runningBalance
            ));
        }

        return new AccountLedgerDto(
            AccountId: account.Id,
            AccountCode: account.AccountCode,
            AccountName: account.AccountName,
            AccountType: account.AccountType,
            FromDate: effectiveFromDate,
            ToDate: effectiveToDate,
            OpeningBalance: openingBalance,
            Transactions: ledgerLines,
            ClosingBalance: runningBalance
        );
    }

    public async Task<TrialBalanceDto> GetTrialBalanceAsync(DateTime asOfDate, Guid? fiscalPeriodId = null)
    {
        // Get fiscal period info if provided
        string? periodName = null;
        if (fiscalPeriodId.HasValue)
        {
            var period = await _context.FiscalPeriods
                .FirstOrDefaultAsync(p => p.Id == fiscalPeriodId.Value);
            periodName = period?.Name;
        }

        // Get all accounts with their balances
        var accounts = await _context.ChartOfAccounts
            .Where(a => a.IsActive)
            .OrderBy(a => a.AccountCode)
            .ToListAsync();

        // Get all posted transactions up to the as-of date
        var transactionSums = await _context.JournalVoucherLines
            .Include(l => l.JournalVoucher)
            .Where(l => l.JournalVoucher.Status == DocumentStatus.Posted &&
                        l.JournalVoucher.VoucherDate <= asOfDate)
            .GroupBy(l => l.AccountId)
            .Select(g => new
            {
                AccountId = g.Key,
                TotalDebit = g.Sum(l => l.DebitAmount),
                TotalCredit = g.Sum(l => l.CreditAmount)
            })
            .ToListAsync();

        var transactionDict = transactionSums.ToDictionary(t => t.AccountId);

        var accountBalances = new List<AccountBalanceDto>();
        decimal totalDebit = 0;
        decimal totalCredit = 0;

        foreach (var account in accounts)
        {
            decimal debit = 0;
            decimal credit = 0;
            decimal balance = 0;

            if (transactionDict.TryGetValue(account.Id, out var sums))
            {
                // For trial balance, we show debit/credit based on normal balance
                balance = CalculateBalance(account.AccountType, sums.TotalDebit, sums.TotalCredit);

                // For display: show debit or credit column based on balance sign and account type
                if (account.AccountType == AccountType.Asset || account.AccountType == AccountType.Expense)
                {
                    // Normal debit balance accounts
                    if (balance >= 0)
                    {
                        debit = balance;
                    }
                    else
                    {
                        credit = Math.Abs(balance);
                    }
                }
                else
                {
                    // Normal credit balance accounts (Liability, Equity, Revenue)
                    if (balance >= 0)
                    {
                        credit = balance;
                    }
                    else
                    {
                        debit = Math.Abs(balance);
                    }
                }
            }

            // Only include accounts with balances or header accounts
            if (debit != 0 || credit != 0 || account.IsHeader)
            {
                accountBalances.Add(new AccountBalanceDto(
                    Id: account.Id,
                    AccountCode: account.AccountCode,
                    AccountName: account.AccountName,
                    AccountType: account.AccountType,
                    Level: account.Level,
                    IsHeader: account.IsHeader,
                    Debit: debit,
                    Credit: credit,
                    Balance: balance
                ));

                totalDebit += debit;
                totalCredit += credit;
            }
        }

        return new TrialBalanceDto(
            AsOfDate: asOfDate,
            FiscalPeriodId: fiscalPeriodId,
            FiscalPeriodName: periodName,
            Accounts: accountBalances,
            TotalDebit: totalDebit,
            TotalCredit: totalCredit,
            IsBalanced: Math.Abs(totalDebit - totalCredit) < 0.01m
        );
    }

    /// <summary>
    /// Calculate balance based on account type
    /// Assets and Expenses: Debit - Credit (normal debit balance)
    /// Liabilities, Equity, Revenue: Credit - Debit (normal credit balance)
    /// </summary>
    private static decimal CalculateBalance(AccountType accountType, decimal debit, decimal credit)
    {
        return accountType switch
        {
            AccountType.Asset => debit - credit,
            AccountType.Expense => debit - credit,
            AccountType.Liability => credit - debit,
            AccountType.Equity => credit - debit,
            AccountType.Revenue => credit - debit,
            _ => debit - credit
        };
    }
}
