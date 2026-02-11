using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Carmen.Domain.Entities.Auth;
using Carmen.Domain.Entities.GL;
using Carmen.Infrastructure.Data;
using Carmen.TestCommon.Constants;
using Carmen.TestCommon.Factories;
using Carmen.WebApi.Tests.Helpers;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Carmen.WebApi.Tests.Controllers;

public class JournalVouchersControllerTests : IClassFixture<TestWebApplicationFactory>, IAsyncLifetime
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;
    private readonly string _baseUrl;

    public JournalVouchersControllerTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
        _baseUrl = $"/api/v1/tenants/{TestConstants.DefaultTenantId}/journal-vouchers";
    }

    public async Task InitializeAsync()
    {
        using var db = _factory.CreateSeedContext();

        // Clear existing data
        db.JournalVoucherLines.RemoveRange(db.JournalVoucherLines);
        db.JournalVouchers.RemoveRange(db.JournalVouchers);
        db.FiscalPeriods.RemoveRange(db.FiscalPeriods);
        db.FiscalYears.RemoveRange(db.FiscalYears);
        db.ChartOfAccounts.RemoveRange(db.ChartOfAccounts);
        db.Users.RemoveRange(db.Users);
        db.Tenants.RemoveRange(db.Tenants);
        await db.SaveChangesAsync();

        // Seed tenant
        db.Tenants.Add(new Tenant
        {
            Id = TestConstants.DefaultTenantId,
            Code = "TEST",
            Name = "Test Hotel",
            BaseCurrency = "USD",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "seed"
        });

        // Seed user
        db.Users.Add(new User
        {
            Id = TestConstants.DefaultUserId,
            Email = TestConstants.DefaultEmail,
            PasswordHash = "hashed",
            FirstName = "Test",
            LastName = "User",
            TenantId = TestConstants.DefaultTenantId,
            IsActive = true,
            PreferredLanguage = "en",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "seed"
        });

        // Seed chart of accounts
        var accounts = ChartOfAccountFactory.StandardSet();
        db.ChartOfAccounts.AddRange(accounts);

        // Seed fiscal periods
        var fiscalYear = FiscalPeriodFactory.CreateYear(2025, TestConstants.DefaultTenantId);
        db.FiscalYears.Add(fiscalYear.Year);
        db.FiscalPeriods.AddRange(fiscalYear.Periods);

        await db.SaveChangesAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    private void SetAuth(string token) =>
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

    private void SetAdminAuth() =>
        SetAuth(TestAuthHelper.AdminToken(TestConstants.DefaultUserId, TestConstants.DefaultTenantId));

    // ─── GET list ────────────────────────────────────────────

    [Fact]
    public async Task GetVouchers_WithValidAuth_Returns200()
    {
        SetAdminAuth();

        var response = await _client.GetAsync(_baseUrl);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("items");
    }

    [Fact]
    public async Task GetVouchers_WithoutAuth_Returns401()
    {
        _client.DefaultRequestHeaders.Authorization = null;

        var response = await _client.GetAsync(_baseUrl);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetVouchers_WithoutPermission_Returns403()
    {
        // Token with no permissions
        SetAuth(TestAuthHelper.GenerateToken(
            TestConstants.DefaultUserId,
            TestConstants.DefaultTenantId,
            permissions: Array.Empty<string>()));

        var response = await _client.GetAsync(_baseUrl);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GetVouchers_WithViewPermission_Returns200()
    {
        SetAuth(TestAuthHelper.ViewOnlyToken(
            TestConstants.DefaultUserId,
            TestConstants.DefaultTenantId,
            "GL.JournalVoucher.View"));

        var response = await _client.GetAsync(_baseUrl);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    // ─── GET by ID ───────────────────────────────────────────

    [Fact]
    public async Task GetVoucherById_NotFound_Returns404()
    {
        SetAdminAuth();

        var response = await _client.GetAsync($"{_baseUrl}/{Guid.NewGuid()}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    // ─── POST create ─────────────────────────────────────────

    [Fact]
    public async Task CreateVoucher_WithoutCreatePermission_Returns403()
    {
        SetAuth(TestAuthHelper.ViewOnlyToken(
            TestConstants.DefaultUserId,
            TestConstants.DefaultTenantId,
            "GL.JournalVoucher.View"));

        var request = new
        {
            VoucherDate = "2025-01-15",
            VoucherType = "General",
            Description = "Test",
            CurrencyCode = "USD",
            ExchangeRate = 1m,
            Lines = new[]
            {
                new { AccountId = TestConstants.CashAccountId, DebitAmount = 100m, CreditAmount = 0m },
                new { AccountId = TestConstants.RevenueAccountId, DebitAmount = 0m, CreditAmount = 100m }
            }
        };

        var response = await _client.PostAsJsonAsync(_baseUrl, request);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    // ─── DELETE ──────────────────────────────────────────────

    [Fact]
    public async Task DeleteVoucher_NotFound_Returns404()
    {
        SetAdminAuth();

        var response = await _client.DeleteAsync($"{_baseUrl}/{Guid.NewGuid()}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
