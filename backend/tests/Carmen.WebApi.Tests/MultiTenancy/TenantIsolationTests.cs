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

namespace Carmen.WebApi.Tests.MultiTenancy;

public class TenantIsolationTests : IClassFixture<TestWebApplicationFactory>, IAsyncLifetime
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    private static readonly Guid TenantAId = TestConstants.DefaultTenantId;
    private static readonly Guid TenantBId = TestConstants.SecondTenantId;
    private static readonly Guid UserAId = TestConstants.DefaultUserId;
    private static readonly Guid UserBId = Guid.Parse("20000000-0000-0000-0000-000000000002");

    public TenantIsolationTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    public async Task InitializeAsync()
    {
        using var db = _factory.CreateSeedContext();

        // Clear all data
        db.JournalVoucherLines.RemoveRange(db.JournalVoucherLines);
        db.JournalVouchers.RemoveRange(db.JournalVouchers);
        db.FiscalPeriods.RemoveRange(db.FiscalPeriods);
        db.FiscalYears.RemoveRange(db.FiscalYears);
        db.ChartOfAccounts.RemoveRange(db.ChartOfAccounts);
        db.Users.RemoveRange(db.Users);
        db.Tenants.RemoveRange(db.Tenants);
        await db.SaveChangesAsync();

        // Seed Tenant A
        db.Tenants.Add(new Tenant
        {
            Id = TenantAId,
            Code = "TESTA",
            Name = "Hotel A",
            BaseCurrency = "USD",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "seed"
        });
        db.Users.Add(new User
        {
            Id = UserAId,
            Email = "usera@test.com",
            PasswordHash = "hashed",
            FirstName = "User",
            LastName = "A",
            TenantId = TenantAId,
            IsActive = true,
            PreferredLanguage = "en",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "seed"
        });

        // Seed Tenant B
        db.Tenants.Add(new Tenant
        {
            Id = TenantBId,
            Code = "TESTB",
            Name = "Hotel B",
            BaseCurrency = "THB",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "seed"
        });
        db.Users.Add(new User
        {
            Id = UserBId,
            Email = "userb@test.com",
            PasswordHash = "hashed",
            FirstName = "User",
            LastName = "B",
            TenantId = TenantBId,
            IsActive = true,
            PreferredLanguage = "en",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "seed"
        });

        // Seed accounts for Tenant A
        var accountsA = ChartOfAccountFactory.StandardSet(); // Uses DefaultTenantId
        db.ChartOfAccounts.AddRange(accountsA);

        // Seed accounts for Tenant B with different tenant ID
        var cashB = new ChartOfAccount
        {
            Id = Guid.NewGuid(),
            TenantId = TenantBId,
            AccountCode = "1100",
            AccountName = "Cash (B)",
            AccountType = AccountType.Asset,
            IsActive = true,
            IsHeader = false,
            AllowPosting = true,
            Level = 1,
            CurrencyCode = "THB",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "seed"
        };
        db.ChartOfAccounts.Add(cashB);

        await db.SaveChangesAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    // ─── Tenant A sees only its own data ─────────────────────

    [Fact]
    public async Task TenantA_SeesOnlyOwnAccounts()
    {
        var token = TestAuthHelper.AdminToken(UserAId, TenantAId);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.GetAsync($"/api/v1/tenants/{TenantAId}/accounts");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("Cash");
        content.Should().NotContain("Cash (B)");
    }

    // ─── Tenant B sees only its own data ─────────────────────

    [Fact]
    public async Task TenantB_SeesOnlyOwnAccounts()
    {
        var token = TestAuthHelper.AdminToken(UserBId, TenantBId);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.GetAsync($"/api/v1/tenants/{TenantBId}/accounts");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("Cash (B)");
    }

    // ─── Cross-tenant access ─────────────────────────────────

    [Fact]
    public async Task TenantA_CannotAccessTenantB_Accounts()
    {
        // User A tries to access Tenant B's accounts
        var token = TestAuthHelper.AdminToken(UserAId, TenantAId);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.GetAsync($"/api/v1/tenants/{TenantBId}/accounts");

        // Should return empty results (query filter scopes to JWT tenantId, not route tenantId)
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().NotContain("Cash (B)");
    }
}
