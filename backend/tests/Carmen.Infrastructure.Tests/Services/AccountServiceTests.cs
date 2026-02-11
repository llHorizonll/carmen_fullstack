using Carmen.Application.DTOs.GL;
using Carmen.Domain.Entities.GL;
using Carmen.Infrastructure.Services;
using Carmen.TestCommon.Constants;
using Carmen.TestCommon.Factories;
using Carmen.TestCommon.Fixtures;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Xunit;

namespace Carmen.Infrastructure.Tests.Services;

public class AccountServiceTests : IDisposable
{
    private readonly Carmen.Infrastructure.Data.CarmenDbContext _context;
    private readonly MockCurrentUserService _currentUserService;
    private readonly ILogger<AccountService> _logger;
    private readonly AccountService _service;

    public AccountServiceTests()
    {
        _context = TestDbContextFactory.Create();
        _currentUserService = new MockCurrentUserService();
        _logger = Substitute.For<ILogger<AccountService>>();
        _service = new AccountService(_context, _currentUserService, _logger);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    private async Task SeedStandardAccounts()
    {
        var accounts = ChartOfAccountFactory.StandardSet();
        _context.ChartOfAccounts.AddRange(accounts);
        await _context.SaveChangesAsync();
    }

    // ─── Query Tests ────────────────────────────────────────────

    [Fact]
    public async Task GetAccounts_ReturnsAllAccounts()
    {
        await SeedStandardAccounts();
        var query = new AccountQueryParams(null, null, null, null, null, 1, 50, "AccountCode", false);

        var result = await _service.GetAccountsAsync(query);

        result.Items.Should().HaveCountGreaterThan(0);
        result.TotalCount.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task GetAccounts_FilterByAccountType()
    {
        await SeedStandardAccounts();
        var query = new AccountQueryParams(null, AccountType.Asset, null, null, null, 1, 50, "AccountCode", false);

        var result = await _service.GetAccountsAsync(query);

        result.Items.Should().AllSatisfy(a => a.AccountType.Should().Be(AccountType.Asset));
    }

    [Fact]
    public async Task GetAccounts_FilterByActiveStatus()
    {
        await SeedStandardAccounts();
        var query = new AccountQueryParams(null, null, true, null, null, 1, 50, "AccountCode", false);

        var result = await _service.GetAccountsAsync(query);

        result.Items.Should().AllSatisfy(a => a.IsActive.Should().BeTrue());
    }

    [Fact]
    public async Task GetAccounts_SearchByCode()
    {
        await SeedStandardAccounts();
        // Cash is "1100" - search for "11" to match
        var query = new AccountQueryParams("1100", null, null, null, null, 1, 50, "AccountCode", false);

        var result = await _service.GetAccountsAsync(query);

        result.Items.Should().NotBeEmpty();
        result.Items.Should().AllSatisfy(a =>
            (a.AccountCode.ToLower().Contains("1100") || a.AccountName.ToLower().Contains("1100"))
            .Should().BeTrue());
    }

    [Fact]
    public async Task GetAccountById_ReturnsAccount()
    {
        await SeedStandardAccounts();

        var result = await _service.GetAccountByIdAsync(TestConstants.CashAccountId);

        result.Should().NotBeNull();
        result!.AccountCode.Should().Be("1100"); // Cash is code 1100
        result.AccountName.Should().Be("Cash");
    }

    [Fact]
    public async Task GetAccountById_NotFound_ReturnsNull()
    {
        await SeedStandardAccounts();

        var result = await _service.GetAccountByIdAsync(Guid.NewGuid());

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetAccountByCode_ReturnsAccount()
    {
        await SeedStandardAccounts();

        var result = await _service.GetAccountByCodeAsync("1100"); // Cash

        result.Should().NotBeNull();
        result!.AccountName.Should().Be("Cash");
    }

    // ─── Creation Tests ─────────────────────────────────────────

    [Fact]
    public async Task CreateAccount_ValidRequest_CreatesAccount()
    {
        var request = new CreateAccountRequest(
            AccountCode: "9999",
            AccountName: "Test Account",
            AccountNameLocal: null,
            AccountType: AccountType.Expense,
            ParentAccountId: null,
            IsHeader: false,
            Description: "A test account",
            CurrencyCode: "USD",
            AllowPosting: true);

        var result = await _service.CreateAccountAsync(request);

        result.Should().NotBeNull();
        result.AccountCode.Should().Be("9999");
        result.AccountType.Should().Be(AccountType.Expense);
        result.AllowPosting.Should().BeTrue();
        result.Level.Should().Be(1);
    }

    [Fact]
    public async Task CreateAccount_DuplicateCode_Throws()
    {
        await SeedStandardAccounts();

        var request = new CreateAccountRequest(
            AccountCode: "1100", // Already exists (Cash)
            AccountName: "Duplicate",
            AccountNameLocal: null,
            AccountType: AccountType.Asset,
            ParentAccountId: null,
            IsHeader: false,
            Description: null,
            CurrencyCode: "USD",
            AllowPosting: true);

        var act = () => _service.CreateAccountAsync(request);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*already exists*");
    }

    // ─── Update/Delete Tests ────────────────────────────────────

    [Fact]
    public async Task DeleteAccount_WithoutTransactions_Deactivates()
    {
        await SeedStandardAccounts();
        var cashId = TestConstants.CashAccountId;

        await _service.DeleteAccountAsync(cashId);

        var account = await _context.ChartOfAccounts.FindAsync(cashId);
        account!.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteAccount_NotFound_Throws()
    {
        var act = () => _service.DeleteAccountAsync(Guid.NewGuid());

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Account not found.");
    }

    // ─── Account Summary Tests ──────────────────────────────────

    [Fact]
    public async Task GetAccountSummary_CalculatesDebitBalance()
    {
        await SeedStandardAccounts();

        // Directly create a posted JV + lines to avoid complex factory interactions
        var jv = new JournalVoucher
        {
            Id = Guid.NewGuid(),
            TenantId = TestConstants.DefaultTenantId,
            VoucherNumber = "JV-TEST-001",
            VoucherDate = DateTime.UtcNow.AddDays(-1),
            Status = DocumentStatus.Posted,
            VoucherType = VoucherType.General,
            Description = "Test",
            TotalDebit = 1000m,
            TotalCredit = 1000m,
            CurrencyCode = "USD",
            ExchangeRate = 1m,
            PostedAt = DateTime.UtcNow,
            PostedBy = "test",
            CreatedBy = "test"
        };
        _context.JournalVouchers.Add(jv);

        // Debit Cash 1000
        _context.JournalVoucherLines.Add(new JournalVoucherLine
        {
            Id = Guid.NewGuid(),
            TenantId = TestConstants.DefaultTenantId,
            JournalVoucherId = jv.Id,
            LineNumber = 1,
            AccountId = TestConstants.CashAccountId,
            DebitAmount = 1000m,
            CreditAmount = 0m,
            DebitAmountBase = 1000m,
            CreditAmountBase = 0m,
            CreatedBy = "test"
        });

        // Credit Revenue 1000
        _context.JournalVoucherLines.Add(new JournalVoucherLine
        {
            Id = Guid.NewGuid(),
            TenantId = TestConstants.DefaultTenantId,
            JournalVoucherId = jv.Id,
            LineNumber = 2,
            AccountId = TestConstants.RevenueAccountId,
            DebitAmount = 0m,
            CreditAmount = 1000m,
            DebitAmountBase = 0m,
            CreditAmountBase = 1000m,
            CreatedBy = "test"
        });
        await _context.SaveChangesAsync();

        var summary = await _service.GetAccountSummaryAsync(TestConstants.CashAccountId);

        summary.Should().NotBeNull();
        summary.AccountCode.Should().Be("1100");
        summary.TotalDebit.Should().Be(1000m);
        summary.TotalCredit.Should().Be(0m);
        summary.ClosingBalance.Should().Be(1000m);
    }

    [Fact]
    public async Task AccountCodeExists_ReturnsTrueForExisting()
    {
        await SeedStandardAccounts();

        var exists = await _service.AccountCodeExistsAsync("1100");

        exists.Should().BeTrue();
    }

    [Fact]
    public async Task AccountCodeExists_ReturnsFalseForNew()
    {
        await SeedStandardAccounts();

        var exists = await _service.AccountCodeExistsAsync("9999");

        exists.Should().BeFalse();
    }
}
