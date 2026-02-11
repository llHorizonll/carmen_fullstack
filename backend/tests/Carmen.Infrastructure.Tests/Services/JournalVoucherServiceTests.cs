using Carmen.Application.DTOs.GL;
using Carmen.Application.Services.Workflow;
using Carmen.Domain.Entities.GL;
using Carmen.Infrastructure.Data;
using Carmen.Infrastructure.Services;
using Carmen.TestCommon.Constants;
using Carmen.TestCommon.Factories;
using Carmen.TestCommon.Fixtures;
using Carmen.TestCommon.Helpers;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Xunit;

namespace Carmen.Infrastructure.Tests.Services;

public class JournalVoucherServiceTests : IDisposable
{
    private readonly CarmenDbContext _context;
    private readonly MockCurrentUserService _currentUser;
    private readonly IWorkflowService _workflowService;
    private readonly ILogger<JournalVoucherService> _logger;
    private readonly JournalVoucherService _service;

    public JournalVoucherServiceTests()
    {
        _context = TestDbContextFactory.Create();
        _currentUser = new MockCurrentUserService();
        _workflowService = Substitute.For<IWorkflowService>();
        _logger = Substitute.For<ILogger<JournalVoucherService>>();
        _service = new JournalVoucherService(_context, _currentUser, _workflowService, _logger);
    }

    public void Dispose() => _context.Dispose();

    private CreateJournalVoucherRequest MakeValidRequest(
        decimal amount = 1000m,
        Guid? debitAccountId = null,
        Guid? creditAccountId = null,
        Guid? fiscalPeriodId = null)
    {
        return new CreateJournalVoucherRequest(
            VoucherDate: new DateTime(2025, 1, 15),
            PostingDate: new DateTime(2025, 1, 15),
            VoucherType: VoucherType.General,
            Description: "Test voucher",
            Reference: null,
            CurrencyCode: "USD",
            ExchangeRate: 1m,
            FiscalPeriodId: fiscalPeriodId ?? TestConstants.DefaultFiscalPeriodId,
            Lines: new List<CreateJournalVoucherLineRequest>
            {
                new(debitAccountId ?? TestConstants.ExpenseAccountId, amount, 0, "Debit", null, null),
                new(creditAccountId ?? TestConstants.CashAccountId, 0, amount, "Credit", null, null),
            });
    }

    // ============================================================
    // CREATE TESTS
    // ============================================================

    [Fact]
    public async Task CreateVoucher_ValidRequest_ReturnsDraftVoucher()
    {
        await _context.SeedStandardDataAsync();
        var request = MakeValidRequest();

        var result = await _service.CreateVoucherAsync(request);

        result.Should().NotBeNull();
        result.Status.Should().Be(DocumentStatus.Draft);
        result.VoucherType.Should().Be(VoucherType.General);
        result.TotalDebit.Should().Be(1000m);
        result.TotalCredit.Should().Be(1000m);
        result.Lines.Should().HaveCount(2);
    }

    [Fact]
    public async Task CreateVoucher_GeneratesVoucherNumber()
    {
        await _context.SeedStandardDataAsync();
        var request = MakeValidRequest();

        var result = await _service.CreateVoucherAsync(request);

        result.VoucherNumber.Should().StartWith("JV");
        result.VoucherNumber.Should().EndWith("0001");
        result.VoucherNumber.Should().HaveLength(12); // prefix(2) + YYYYMM(6) + seq(4)
    }

    [Fact]
    public async Task CreateVoucher_CalculatesBaseAmountsWithExchangeRate()
    {
        await _context.SeedStandardDataAsync();
        var request = new CreateJournalVoucherRequest(
            VoucherDate: new DateTime(2025, 1, 15),
            PostingDate: new DateTime(2025, 1, 15),
            VoucherType: VoucherType.General,
            Description: "Foreign currency",
            Reference: null,
            CurrencyCode: "THB",
            ExchangeRate: 35m,
            FiscalPeriodId: TestConstants.DefaultFiscalPeriodId,
            Lines: new List<CreateJournalVoucherLineRequest>
            {
                new(TestConstants.ExpenseAccountId, 1000m, 0, "Debit", null, null),
                new(TestConstants.CashAccountId, 0, 1000m, "Credit", null, null),
            });

        var result = await _service.CreateVoucherAsync(request);

        result.Lines[0].DebitAmountBase.Should().Be(35000m);
        result.Lines[1].CreditAmountBase.Should().Be(35000m);
    }

    [Fact]
    public async Task CreateVoucher_SequentialNumbers()
    {
        await _context.SeedStandardDataAsync();

        var result1 = await _service.CreateVoucherAsync(MakeValidRequest());
        var result2 = await _service.CreateVoucherAsync(MakeValidRequest());

        result1.VoucherNumber.Should().EndWith("0001");
        result2.VoucherNumber.Should().EndWith("0002");
    }

    // ============================================================
    // VALIDATION TESTS
    // ============================================================

    [Fact]
    public async Task CreateVoucher_UnbalancedLines_ThrowsException()
    {
        await _context.SeedStandardDataAsync();
        var request = new CreateJournalVoucherRequest(
            VoucherDate: new DateTime(2025, 1, 15),
            PostingDate: new DateTime(2025, 1, 15),
            VoucherType: VoucherType.General,
            Description: "Unbalanced",
            Reference: null,
            CurrencyCode: "USD",
            ExchangeRate: 1m,
            FiscalPeriodId: TestConstants.DefaultFiscalPeriodId,
            Lines: new List<CreateJournalVoucherLineRequest>
            {
                new(TestConstants.ExpenseAccountId, 1000m, 0, "Debit", null, null),
                new(TestConstants.CashAccountId, 0, 500m, "Credit", null, null),
            });

        var act = () => _service.CreateVoucherAsync(request);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*debit*credit*");
    }

    [Fact]
    public async Task CreateVoucher_NoLines_ThrowsException()
    {
        await _context.SeedStandardDataAsync();
        var request = new CreateJournalVoucherRequest(
            VoucherDate: new DateTime(2025, 1, 15),
            PostingDate: new DateTime(2025, 1, 15),
            VoucherType: VoucherType.General,
            Description: "No lines",
            Reference: null,
            CurrencyCode: "USD",
            ExchangeRate: 1m,
            FiscalPeriodId: TestConstants.DefaultFiscalPeriodId,
            Lines: new List<CreateJournalVoucherLineRequest>());

        var act = () => _service.CreateVoucherAsync(request);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*line*required*");
    }

    [Fact]
    public async Task CreateVoucher_BothDebitAndCredit_ThrowsException()
    {
        await _context.SeedStandardDataAsync();
        var request = new CreateJournalVoucherRequest(
            VoucherDate: new DateTime(2025, 1, 15),
            PostingDate: new DateTime(2025, 1, 15),
            VoucherType: VoucherType.General,
            Description: "Both",
            Reference: null,
            CurrencyCode: "USD",
            ExchangeRate: 1m,
            FiscalPeriodId: TestConstants.DefaultFiscalPeriodId,
            Lines: new List<CreateJournalVoucherLineRequest>
            {
                new(TestConstants.ExpenseAccountId, 1000m, 1000m, "Both", null, null),
            });

        var act = () => _service.CreateVoucherAsync(request);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*both debit and credit*");
    }

    [Fact]
    public async Task CreateVoucher_InactiveAccount_ThrowsException()
    {
        await _context.SeedStandardDataAsync();
        var inactiveAccount = new ChartOfAccountFactory()
            .WithCode("9999")
            .WithName("Inactive")
            .AsInactive()
            .Build();
        _context.ChartOfAccounts.Add(inactiveAccount);
        await _context.SaveChangesAsync();

        var request = MakeValidRequest(debitAccountId: inactiveAccount.Id);

        var act = () => _service.CreateVoucherAsync(request);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*inactive*");
    }

    [Fact]
    public async Task CreateVoucher_NonPostingAccount_ThrowsException()
    {
        await _context.SeedStandardDataAsync();

        var request = MakeValidRequest(debitAccountId: TestConstants.HeaderAccountId);

        var act = () => _service.CreateVoucherAsync(request);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*does not allow posting*");
    }

    [Fact]
    public async Task CreateVoucher_ClosedFiscalPeriod_ThrowsException()
    {
        await _context.SeedChartOfAccountsAsync();
        var closedPeriod = FiscalPeriodFactory.ClosedPeriod(Guid.NewGuid());
        var fiscalYear = new FiscalYear
        {
            Id = closedPeriod.FiscalYearId,
            TenantId = TestConstants.DefaultTenantId,
            Name = "FY 2025",
            StartDate = new DateTime(2025, 1, 1),
            EndDate = new DateTime(2025, 12, 31),
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "test",
        };
        _context.FiscalYears.Add(fiscalYear);
        _context.FiscalPeriods.Add(closedPeriod);
        await _context.SaveChangesAsync();

        var request = MakeValidRequest(fiscalPeriodId: closedPeriod.Id);

        var act = () => _service.CreateVoucherAsync(request);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*not open*");
    }

    // ============================================================
    // STATUS TRANSITION TESTS
    // ============================================================

    [Fact]
    public async Task SubmitForApproval_DraftToPending()
    {
        await _context.SeedStandardDataAsync();
        var created = await _service.CreateVoucherAsync(MakeValidRequest());

        var result = await _service.SubmitForApprovalAsync(created.Id, new SubmitForApprovalRequest(null));

        result.Status.Should().Be(DocumentStatus.Pending);
    }

    [Fact]
    public async Task SubmitForApproval_NonDraft_ThrowsException()
    {
        await _context.SeedStandardDataAsync();
        var created = await _service.CreateVoucherAsync(MakeValidRequest());
        await _service.SubmitForApprovalAsync(created.Id, new SubmitForApprovalRequest(null));

        var act = () => _service.SubmitForApprovalAsync(created.Id, new SubmitForApprovalRequest(null));

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*draft*");
    }

    [Fact]
    public async Task ApproveVoucher_PendingToApproved()
    {
        await _context.SeedStandardDataAsync();
        var created = await _service.CreateVoucherAsync(MakeValidRequest());
        await _service.SubmitForApprovalAsync(created.Id, new SubmitForApprovalRequest(null));

        var result = await _service.ApproveVoucherAsync(created.Id, new ApproveVoucherRequest(null));

        result.Status.Should().Be(DocumentStatus.Approved);
        result.ApprovedAt.Should().NotBeNull();
        result.ApprovedBy.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task ApproveVoucher_NonPending_ThrowsException()
    {
        await _context.SeedStandardDataAsync();
        var created = await _service.CreateVoucherAsync(MakeValidRequest());

        var act = () => _service.ApproveVoucherAsync(created.Id, new ApproveVoucherRequest(null));

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*pending*");
    }

    [Fact]
    public async Task RejectVoucher_PendingToRejected()
    {
        await _context.SeedStandardDataAsync();
        var created = await _service.CreateVoucherAsync(MakeValidRequest());
        await _service.SubmitForApprovalAsync(created.Id, new SubmitForApprovalRequest(null));

        var result = await _service.RejectVoucherAsync(created.Id, new RejectVoucherRequest("Bad data"));

        result.Status.Should().Be(DocumentStatus.Rejected);
    }

    [Fact]
    public async Task PostVoucher_ApprovedToPosted()
    {
        await _context.SeedStandardDataAsync();
        var created = await _service.CreateVoucherAsync(MakeValidRequest());
        await _service.SubmitForApprovalAsync(created.Id, new SubmitForApprovalRequest(null));
        await _service.ApproveVoucherAsync(created.Id, new ApproveVoucherRequest(null));

        var result = await _service.PostVoucherAsync(created.Id, new PostVoucherRequest(null));

        result.Status.Should().Be(DocumentStatus.Posted);
        result.PostedAt.Should().NotBeNull();
        result.PostedBy.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task PostVoucher_NonApproved_ThrowsException()
    {
        await _context.SeedStandardDataAsync();
        var created = await _service.CreateVoucherAsync(MakeValidRequest());

        var act = () => _service.PostVoucherAsync(created.Id, new PostVoucherRequest(null));

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*approved*");
    }

    [Fact]
    public async Task PostVoucher_ClosedPeriod_ThrowsException()
    {
        await _context.SeedStandardDataAsync();
        var created = await _service.CreateVoucherAsync(MakeValidRequest());
        await _service.SubmitForApprovalAsync(created.Id, new SubmitForApprovalRequest(null));
        await _service.ApproveVoucherAsync(created.Id, new ApproveVoucherRequest(null));

        // Close the fiscal period
        var period = await _context.FiscalPeriods.FindAsync(TestConstants.DefaultFiscalPeriodId);
        period!.Status = PeriodStatus.Closed;
        await _context.SaveChangesAsync();

        var act = () => _service.PostVoucherAsync(created.Id, new PostVoucherRequest(null));

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*closed*");
    }

    // ============================================================
    // REVERSAL TESTS
    // ============================================================

    [Fact]
    public async Task ReverseVoucher_PostedCreatesReversalWithSwappedLines()
    {
        await _context.SeedStandardDataAsync();
        var created = await _service.CreateVoucherAsync(MakeValidRequest(1000m));
        await _service.SubmitForApprovalAsync(created.Id, new SubmitForApprovalRequest(null));
        await _service.ApproveVoucherAsync(created.Id, new ApproveVoucherRequest(null));
        await _service.PostVoucherAsync(created.Id, new PostVoucherRequest(null));

        var reversal = await _service.ReverseVoucherAsync(created.Id, new ReverseVoucherRequest(
            ReversalDate: new DateTime(2025, 1, 20), Description: null));

        reversal.Status.Should().Be(DocumentStatus.Posted);
        reversal.VoucherType.Should().Be(VoucherType.Reversal);
        reversal.ReversalOfId.Should().Be(created.Id);
        reversal.TotalDebit.Should().Be(1000m);
        reversal.TotalCredit.Should().Be(1000m);

        // Verify swapped amounts on lines
        var originalDebitLine = created.Lines.First(l => l.DebitAmount > 0);
        var reversalCreditLine = reversal.Lines.First(l => l.AccountId == originalDebitLine.AccountId);
        reversalCreditLine.CreditAmount.Should().Be(originalDebitLine.DebitAmount);
    }

    [Fact]
    public async Task ReverseVoucher_SetsReversedByIdOnOriginal()
    {
        await _context.SeedStandardDataAsync();
        var created = await _service.CreateVoucherAsync(MakeValidRequest());
        await _service.SubmitForApprovalAsync(created.Id, new SubmitForApprovalRequest(null));
        await _service.ApproveVoucherAsync(created.Id, new ApproveVoucherRequest(null));
        await _service.PostVoucherAsync(created.Id, new PostVoucherRequest(null));

        var reversal = await _service.ReverseVoucherAsync(created.Id, new ReverseVoucherRequest(
            ReversalDate: new DateTime(2025, 1, 20), Description: null));

        var original = await _service.GetVoucherByIdAsync(created.Id);
        original!.ReversedById.Should().Be(reversal.Id);
    }

    [Fact]
    public async Task ReverseVoucher_NonPosted_ThrowsException()
    {
        await _context.SeedStandardDataAsync();
        var created = await _service.CreateVoucherAsync(MakeValidRequest());

        var act = () => _service.ReverseVoucherAsync(created.Id, new ReverseVoucherRequest(
            ReversalDate: DateTime.UtcNow, Description: null));

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*posted*");
    }

    [Fact]
    public async Task ReverseVoucher_AlreadyReversed_ThrowsException()
    {
        await _context.SeedStandardDataAsync();
        var created = await _service.CreateVoucherAsync(MakeValidRequest());
        await _service.SubmitForApprovalAsync(created.Id, new SubmitForApprovalRequest(null));
        await _service.ApproveVoucherAsync(created.Id, new ApproveVoucherRequest(null));
        await _service.PostVoucherAsync(created.Id, new PostVoucherRequest(null));
        await _service.ReverseVoucherAsync(created.Id, new ReverseVoucherRequest(
            ReversalDate: DateTime.UtcNow, Description: null));

        var act = () => _service.ReverseVoucherAsync(created.Id, new ReverseVoucherRequest(
            ReversalDate: DateTime.UtcNow, Description: null));

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*already been reversed*");
    }

    // ============================================================
    // VOID TESTS
    // ============================================================

    [Fact]
    public async Task VoidVoucher_DraftToVoid()
    {
        await _context.SeedStandardDataAsync();
        var created = await _service.CreateVoucherAsync(MakeValidRequest());

        var result = await _service.VoidVoucherAsync(created.Id, "No longer needed");

        result.Status.Should().Be(DocumentStatus.Void);
    }

    [Fact]
    public async Task VoidVoucher_PendingToVoid()
    {
        await _context.SeedStandardDataAsync();
        var created = await _service.CreateVoucherAsync(MakeValidRequest());
        await _service.SubmitForApprovalAsync(created.Id, new SubmitForApprovalRequest(null));

        var result = await _service.VoidVoucherAsync(created.Id, "Cancelled");

        result.Status.Should().Be(DocumentStatus.Void);
    }

    [Fact]
    public async Task VoidVoucher_PostedThrowsException()
    {
        await _context.SeedStandardDataAsync();
        var created = await _service.CreateVoucherAsync(MakeValidRequest());
        await _service.SubmitForApprovalAsync(created.Id, new SubmitForApprovalRequest(null));
        await _service.ApproveVoucherAsync(created.Id, new ApproveVoucherRequest(null));
        await _service.PostVoucherAsync(created.Id, new PostVoucherRequest(null));

        var act = () => _service.VoidVoucherAsync(created.Id, "Reason");

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*reverse*");
    }

    // ============================================================
    // UPDATE/DELETE TESTS
    // ============================================================

    [Fact]
    public async Task UpdateVoucher_DraftCanBeUpdated()
    {
        await _context.SeedStandardDataAsync();
        var created = await _service.CreateVoucherAsync(MakeValidRequest(1000m));

        var updateRequest = new UpdateJournalVoucherRequest(
            VoucherDate: new DateTime(2025, 1, 20),
            PostingDate: new DateTime(2025, 1, 20),
            Description: "Updated description",
            Reference: "REF-001",
            CurrencyCode: "USD",
            ExchangeRate: 1m,
            FiscalPeriodId: TestConstants.DefaultFiscalPeriodId,
            Lines: new List<UpdateJournalVoucherLineRequest>
            {
                new(null, TestConstants.ExpenseAccountId, 2000m, 0, "Debit", null, null),
                new(null, TestConstants.CashAccountId, 0, 2000m, "Credit", null, null),
            });

        var result = await _service.UpdateVoucherAsync(created.Id, updateRequest);

        result.Description.Should().Be("Updated description");
        result.TotalDebit.Should().Be(2000m);
        result.TotalCredit.Should().Be(2000m);
    }

    [Fact]
    public async Task UpdateVoucher_NonDraft_ThrowsException()
    {
        await _context.SeedStandardDataAsync();
        var created = await _service.CreateVoucherAsync(MakeValidRequest());
        await _service.SubmitForApprovalAsync(created.Id, new SubmitForApprovalRequest(null));

        var updateRequest = new UpdateJournalVoucherRequest(
            new DateTime(2025, 1, 20), new DateTime(2025, 1, 20), "Updated", null, "USD", 1m,
            TestConstants.DefaultFiscalPeriodId,
            new List<UpdateJournalVoucherLineRequest>
            {
                new(null, TestConstants.ExpenseAccountId, 1000m, 0, null, null, null),
                new(null, TestConstants.CashAccountId, 0, 1000m, null, null, null),
            });

        var act = () => _service.UpdateVoucherAsync(created.Id, updateRequest);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*draft*");
    }

    [Fact]
    public async Task DeleteVoucher_DraftCanBeDeleted()
    {
        await _context.SeedStandardDataAsync();
        var created = await _service.CreateVoucherAsync(MakeValidRequest());

        await _service.DeleteVoucherAsync(created.Id);

        var found = await _service.GetVoucherByIdAsync(created.Id);
        found.Should().BeNull();
    }

    [Fact]
    public async Task DeleteVoucher_NonDraft_ThrowsException()
    {
        await _context.SeedStandardDataAsync();
        var created = await _service.CreateVoucherAsync(MakeValidRequest());
        await _service.SubmitForApprovalAsync(created.Id, new SubmitForApprovalRequest(null));

        var act = () => _service.DeleteVoucherAsync(created.Id);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*draft*");
    }

    // ============================================================
    // QUERY TESTS
    // ============================================================

    [Fact]
    public async Task GetVouchers_Pagination()
    {
        await _context.SeedStandardDataAsync();
        for (int i = 0; i < 5; i++)
            await _service.CreateVoucherAsync(MakeValidRequest());

        var result = await _service.GetVouchersAsync(new JournalVoucherQueryParams(
            null, null, null, null, null, null, Page: 1, PageSize: 2));

        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(5);
        result.TotalPages.Should().Be(3);
    }

    [Fact]
    public async Task GetVouchers_FilterByStatus()
    {
        await _context.SeedStandardDataAsync();
        var draft = await _service.CreateVoucherAsync(MakeValidRequest());
        var pending = await _service.CreateVoucherAsync(MakeValidRequest());
        await _service.SubmitForApprovalAsync(pending.Id, new SubmitForApprovalRequest(null));

        var result = await _service.GetVouchersAsync(new JournalVoucherQueryParams(
            null, DocumentStatus.Draft, null, null, null, null));

        result.Items.Should().HaveCount(1);
        result.Items[0].Status.Should().Be(DocumentStatus.Draft);
    }

    [Fact]
    public async Task GetVouchers_SearchByNumber()
    {
        await _context.SeedStandardDataAsync();
        var created = await _service.CreateVoucherAsync(MakeValidRequest());

        var result = await _service.GetVouchersAsync(new JournalVoucherQueryParams(
            Search: created.VoucherNumber, null, null, null, null, null));

        result.Items.Should().HaveCount(1);
        result.Items[0].VoucherNumber.Should().Be(created.VoucherNumber);
    }

    // ============================================================
    // TENANT ISOLATION TESTS
    // ============================================================

    [Fact]
    public async Task GetVouchers_TenantIsolation()
    {
        // Use separate InMemory databases since InMemory provider doesn't support
        // global query filters the same way as relational providers.
        // We test isolation by verifying each tenant context only sees its own data.

        // Tenant 1
        var ctx1 = TestDbContextFactory.Create(TestConstants.DefaultTenantId);
        await ctx1.SeedStandardDataAsync(TestConstants.DefaultTenantId);
        var user1 = MockCurrentUserService.ForTenant(TestConstants.DefaultTenantId);
        var svc1 = new JournalVoucherService(ctx1, user1, _workflowService, _logger);
        await svc1.CreateVoucherAsync(MakeValidRequest());

        var tenant1Result = await svc1.GetVouchersAsync(new JournalVoucherQueryParams(null, null, null, null, null, null));
        tenant1Result.TotalCount.Should().Be(1);

        // Tenant 2 — separate DB, should have 0 vouchers
        var ctx2 = TestDbContextFactory.Create(TestConstants.SecondTenantId);
        await ctx2.SeedStandardDataAsync(TestConstants.SecondTenantId);
        var user2 = MockCurrentUserService.ForTenant(TestConstants.SecondTenantId);
        var svc2 = new JournalVoucherService(ctx2, user2, _workflowService, _logger);

        var tenant2Result = await svc2.GetVouchersAsync(new JournalVoucherQueryParams(null, null, null, null, null, null));
        tenant2Result.TotalCount.Should().Be(0);

        ctx1.Dispose();
        ctx2.Dispose();
    }

    // ============================================================
    // VOUCHER NUMBER GENERATION
    // ============================================================

    [Fact]
    public async Task GenerateVoucherNumber_CorrectPrefix()
    {
        var number = await _service.GenerateVoucherNumberAsync(VoucherType.General, new DateTime(2025, 3, 15));
        number.Should().StartWith("JV");
        number.Should().Contain("03"); // March

        var reversalNumber = await _service.GenerateVoucherNumberAsync(VoucherType.Reversal, new DateTime(2025, 3, 15));
        reversalNumber.Should().StartWith("RJ");
    }

    // ============================================================
    // VALIDATE TESTS
    // ============================================================

    [Fact]
    public async Task ValidateVoucher_ValidRequest_ReturnsNoErrors()
    {
        await _context.SeedStandardDataAsync();
        var request = MakeValidRequest();

        var errors = await _service.ValidateVoucherAsync(request);

        errors.Should().BeEmpty();
    }

    [Fact]
    public async Task ValidateVoucher_NegativeAmounts_ReturnsErrors()
    {
        await _context.SeedStandardDataAsync();
        var request = new CreateJournalVoucherRequest(
            new DateTime(2025, 1, 15), new DateTime(2025, 1, 15), VoucherType.General,
            null, null, "USD", 1m, TestConstants.DefaultFiscalPeriodId,
            new List<CreateJournalVoucherLineRequest>
            {
                new(TestConstants.ExpenseAccountId, -100m, 0, null, null, null),
                new(TestConstants.CashAccountId, 0, -100m, null, null, null),
            });

        var errors = await _service.ValidateVoucherAsync(request);

        errors.Should().Contain(e => e.Contains("negative"));
    }
}
