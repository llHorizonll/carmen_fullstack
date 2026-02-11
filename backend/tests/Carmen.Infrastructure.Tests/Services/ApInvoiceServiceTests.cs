using Carmen.Application.DTOs.AP;
using Carmen.Application.Services.Workflow;
using Carmen.Domain.Entities.AP;
using Carmen.Domain.Entities.GL;
using Carmen.Infrastructure.Data;
using Carmen.Infrastructure.Services;
using Carmen.TestCommon.Constants;
using Carmen.TestCommon.Factories;
using Carmen.TestCommon.Fixtures;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Xunit;

namespace Carmen.Infrastructure.Tests.Services;

public class ApInvoiceServiceTests : IDisposable
{
    private readonly CarmenDbContext _context;
    private readonly MockCurrentUserService _currentUserService;
    private readonly IWorkflowService _workflowService;
    private readonly ILogger<ApInvoiceService> _logger;
    private readonly ApInvoiceService _service;

    public ApInvoiceServiceTests()
    {
        _context = TestDbContextFactory.Create();
        _currentUserService = new MockCurrentUserService();
        _workflowService = Substitute.For<IWorkflowService>();
        _logger = Substitute.For<ILogger<ApInvoiceService>>();
        _service = new ApInvoiceService(_context, _currentUserService, _workflowService, _logger);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    private async Task<(Vendor vendor, FiscalPeriod period)> SeedBaseData()
    {
        // Seed chart of accounts
        var accounts = ChartOfAccountFactory.StandardSet();
        _context.ChartOfAccounts.AddRange(accounts);

        // Seed fiscal periods
        var fiscalYear = FiscalPeriodFactory.CreateYear(2025, TestConstants.DefaultTenantId);
        _context.FiscalYears.Add(fiscalYear.Year);
        _context.FiscalPeriods.AddRange(fiscalYear.Periods);

        // Seed vendor
        var vendor = new Vendor
        {
            Id = Guid.NewGuid(),
            TenantId = TestConstants.DefaultTenantId,
            VendorCode = "V001",
            VendorName = "Test Vendor",
            IsActive = true,
            DefaultApAccountId = TestConstants.ApAccountId,
            CreditLimit = 100000m,
            CurrentBalance = 0m,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "test"
        };
        _context.Vendors.Add(vendor);

        await _context.SaveChangesAsync();

        var period = fiscalYear.Periods.First();
        return (vendor, period);
    }

    private CreateApInvoiceRequest MakeValidRequest(Vendor vendor, FiscalPeriod period, decimal amount = 1000m)
    {
        return new CreateApInvoiceRequest(
            VendorId: vendor.Id,
            VendorInvoiceNumber: "VINV-001",
            InvoiceDate: new DateTime(2025, 1, 15),
            DueDate: new DateTime(2025, 2, 15),
            CurrencyCode: "USD",
            ExchangeRate: 1m,
            Tax1ProfileId: null,
            Tax2ProfileId: null,
            WhtProfileId: null,
            PaymentTermId: null,
            Description: "Test invoice",
            Reference: "REF-001",
            FiscalPeriodId: period.Id,
            ApAccountId: TestConstants.ApAccountId,
            Lines: new List<CreateApInvoiceLineRequest>
            {
                new(
                    AccountId: TestConstants.ExpenseAccountId,
                    Description: "Test line item",
                    Quantity: 1m,
                    Unit: "EA",
                    UnitPrice: amount,
                    DiscountPercent: 0m,
                    Tax1ProfileId: null,
                    DepartmentId: null,
                    ProjectCode: null)
            });
    }

    private async Task<ApInvoice> SeedInvoice(Vendor vendor, ApInvoiceStatus status = ApInvoiceStatus.Draft)
    {
        var invoice = new ApInvoice
        {
            Id = Guid.NewGuid(),
            TenantId = TestConstants.DefaultTenantId,
            InvoiceNumber = "AP20250100001",
            VendorInvoiceNumber = "VINV-001",
            InvoiceDate = new DateTime(2025, 1, 15),
            DueDate = new DateTime(2025, 2, 15),
            Status = status,
            VendorId = vendor.Id,
            CurrencyCode = "USD",
            ExchangeRate = 1m,
            SubTotal = 1000m,
            TotalAmount = 1000m,
            NetAmount = 1000m,
            PaidAmount = 0m,
            BalanceAmount = 1000m,
            ApAccountId = TestConstants.ApAccountId,
            CreatedBy = "test"
        };
        _context.ApInvoices.Add(invoice);
        await _context.SaveChangesAsync();
        return invoice;
    }

    // ─── Creation Tests ─────────────────────────────────────────

    [Fact]
    public async Task CreateInvoice_ValidRequest_CreatesDraft()
    {
        var (vendor, period) = await SeedBaseData();
        var request = MakeValidRequest(vendor, period, 5000m);

        var result = await _service.CreateInvoiceAsync(request);

        result.Should().NotBeNull();
        result.Status.Should().Be(ApInvoiceStatus.Draft);
        result.SubTotal.Should().Be(5000m);
        result.VendorCode.Should().Be("V001");
    }

    [Fact]
    public async Task CreateInvoice_GeneratesInvoiceNumber()
    {
        var (vendor, period) = await SeedBaseData();
        var request = MakeValidRequest(vendor, period);

        var result = await _service.CreateInvoiceAsync(request);

        result.InvoiceNumber.Should().StartWith("AP");
        result.InvoiceNumber.Should().EndWith("0001");
    }

    [Fact]
    public async Task CreateInvoice_NoLines_Throws()
    {
        var (vendor, period) = await SeedBaseData();
        var request = new CreateApInvoiceRequest(
            VendorId: vendor.Id,
            VendorInvoiceNumber: "VINV-001",
            InvoiceDate: new DateTime(2025, 1, 15),
            DueDate: new DateTime(2025, 2, 15),
            CurrencyCode: "USD",
            ExchangeRate: 1m,
            Tax1ProfileId: null,
            Tax2ProfileId: null,
            WhtProfileId: null,
            PaymentTermId: null,
            Description: "Test",
            Reference: null,
            FiscalPeriodId: period.Id,
            ApAccountId: null,
            Lines: new List<CreateApInvoiceLineRequest>());

        var act = () => _service.CreateInvoiceAsync(request);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*line*required*");
    }

    [Fact]
    public async Task CreateInvoice_SequentialNumbers()
    {
        var (vendor, period) = await SeedBaseData();

        var result1 = await _service.CreateInvoiceAsync(MakeValidRequest(vendor, period));
        var result2 = await _service.CreateInvoiceAsync(MakeValidRequest(vendor, period));

        result1.InvoiceNumber.Should().EndWith("0001");
        result2.InvoiceNumber.Should().EndWith("0002");
    }

    // ─── Status Transition Tests ────────────────────────────────

    [Fact]
    public async Task SubmitForApproval_DraftInvoice_SetsPending()
    {
        var (vendor, period) = await SeedBaseData();
        var invoice = await SeedInvoice(vendor, ApInvoiceStatus.Draft);

        await _service.SubmitForApprovalAsync(invoice.Id, new SubmitApInvoiceRequest(null));

        var updated = await _context.ApInvoices.FindAsync(invoice.Id);
        updated!.Status.Should().Be(ApInvoiceStatus.Pending);
    }

    [Fact]
    public async Task SubmitForApproval_NonDraft_Throws()
    {
        var (vendor, _) = await SeedBaseData();
        var invoice = await SeedInvoice(vendor, ApInvoiceStatus.Pending);

        var act = () => _service.SubmitForApprovalAsync(invoice.Id, new SubmitApInvoiceRequest(null));

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Only draft invoices*");
    }

    [Fact]
    public async Task ApproveInvoice_PendingInvoice_SetsApproved()
    {
        var (vendor, _) = await SeedBaseData();
        var invoice = await SeedInvoice(vendor, ApInvoiceStatus.Pending);

        await _service.ApproveInvoiceAsync(invoice.Id, new ApproveApInvoiceRequest(null));

        var updated = await _context.ApInvoices.FindAsync(invoice.Id);
        updated!.Status.Should().Be(ApInvoiceStatus.Approved);
    }

    [Fact]
    public async Task ApproveInvoice_NonPending_Throws()
    {
        var (vendor, _) = await SeedBaseData();
        var invoice = await SeedInvoice(vendor, ApInvoiceStatus.Draft);

        var act = () => _service.ApproveInvoiceAsync(invoice.Id, new ApproveApInvoiceRequest(null));

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Only pending invoices*");
    }

    [Fact]
    public async Task RejectInvoice_PendingInvoice_SetsRejected()
    {
        var (vendor, _) = await SeedBaseData();
        var invoice = await SeedInvoice(vendor, ApInvoiceStatus.Pending);

        await _service.RejectInvoiceAsync(invoice.Id, new RejectApInvoiceRequest("Not valid"));

        var updated = await _context.ApInvoices.FindAsync(invoice.Id);
        updated!.Status.Should().Be(ApInvoiceStatus.Rejected);
    }

    // ─── Void Tests ─────────────────────────────────────────────

    [Fact]
    public async Task VoidInvoice_Draft_SetsVoid()
    {
        var (vendor, _) = await SeedBaseData();
        var invoice = await SeedInvoice(vendor, ApInvoiceStatus.Draft);

        await _service.VoidInvoiceAsync(invoice.Id, new VoidApInvoiceRequest("Cancelled"));

        var updated = await _context.ApInvoices.FindAsync(invoice.Id);
        updated!.Status.Should().Be(ApInvoiceStatus.Void);
    }

    [Fact]
    public async Task VoidInvoice_Paid_Throws()
    {
        var (vendor, _) = await SeedBaseData();
        var invoice = await SeedInvoice(vendor, ApInvoiceStatus.Paid);

        var act = () => _service.VoidInvoiceAsync(invoice.Id, new VoidApInvoiceRequest("Test"));

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Paid invoices cannot be voided.");
    }

    // ─── Update/Delete Tests ────────────────────────────────────

    [Fact]
    public async Task DeleteInvoice_DraftOnly()
    {
        var (vendor, _) = await SeedBaseData();
        var invoice = await SeedInvoice(vendor, ApInvoiceStatus.Draft);

        await _service.DeleteInvoiceAsync(invoice.Id);

        var deleted = await _context.ApInvoices.FindAsync(invoice.Id);
        deleted.Should().BeNull();
    }

    [Fact]
    public async Task DeleteInvoice_NonDraft_Throws()
    {
        var (vendor, _) = await SeedBaseData();
        var invoice = await SeedInvoice(vendor, ApInvoiceStatus.Pending);

        var act = () => _service.DeleteInvoiceAsync(invoice.Id);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Only draft invoices can be deleted.");
    }

    // ─── Payment Update Tests ───────────────────────────────────

    [Fact]
    public async Task UpdatePaidAmount_PartialPayment_SetsPartiallyPaid()
    {
        var (vendor, _) = await SeedBaseData();
        var invoice = await SeedInvoice(vendor, ApInvoiceStatus.Approved);

        await _service.UpdateInvoicePaidAmountAsync(invoice.Id, 500m);

        var updated = await _context.ApInvoices.FindAsync(invoice.Id);
        updated!.Status.Should().Be(ApInvoiceStatus.PartiallyPaid);
        updated.PaidAmount.Should().Be(500m);
        updated.BalanceAmount.Should().Be(500m);
    }

    [Fact]
    public async Task UpdatePaidAmount_FullPayment_SetsPaid()
    {
        var (vendor, _) = await SeedBaseData();
        var invoice = await SeedInvoice(vendor, ApInvoiceStatus.Approved);

        await _service.UpdateInvoicePaidAmountAsync(invoice.Id, 1000m);

        var updated = await _context.ApInvoices.FindAsync(invoice.Id);
        updated!.Status.Should().Be(ApInvoiceStatus.Paid);
        updated.BalanceAmount.Should().Be(0m);
    }

    // ─── Tax Calculation Tests ──────────────────────────────────

    [Fact]
    public async Task CalculateTaxes_NoTax_ReturnSubTotalAsNet()
    {
        await SeedBaseData();
        var request = new CalculateTaxRequest(10000m, null, null, null);

        var result = await _service.CalculateTaxesAsync(request);

        result.SubTotal.Should().Be(10000m);
        result.Tax1Amount.Should().Be(0m);
        result.Tax2Amount.Should().Be(0m);
        result.WhtAmount.Should().Be(0m);
        result.TotalAmount.Should().Be(10000m);
        result.NetAmount.Should().Be(10000m);
    }
}
