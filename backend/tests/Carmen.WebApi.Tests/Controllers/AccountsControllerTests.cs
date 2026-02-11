using System.Net;
using System.Net.Http.Headers;
using Carmen.Domain.Entities.Auth;
using Carmen.Infrastructure.Data;
using Carmen.TestCommon.Constants;
using Carmen.TestCommon.Factories;
using Carmen.WebApi.Tests.Helpers;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Carmen.WebApi.Tests.Controllers;

public class AccountsControllerTests : IClassFixture<TestWebApplicationFactory>, IAsyncLifetime
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;
    private readonly string _baseUrl;

    public AccountsControllerTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
        _baseUrl = $"/api/v1/tenants/{TestConstants.DefaultTenantId}/accounts";
    }

    public async Task InitializeAsync()
    {
        using var db = _factory.CreateSeedContext();

        db.ChartOfAccounts.RemoveRange(db.ChartOfAccounts);
        db.Users.RemoveRange(db.Users);
        db.Tenants.RemoveRange(db.Tenants);
        await db.SaveChangesAsync();

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

        var accounts = ChartOfAccountFactory.StandardSet();
        db.ChartOfAccounts.AddRange(accounts);
        await db.SaveChangesAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    private void SetAdminAuth() =>
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer",
            TestAuthHelper.AdminToken(TestConstants.DefaultUserId, TestConstants.DefaultTenantId));

    // ─── GET list ────────────────────────────────────────────

    [Fact]
    public async Task GetAccounts_WithAuth_Returns200WithAccounts()
    {
        SetAdminAuth();

        var response = await _client.GetAsync(_baseUrl);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("items");
        content.Should().Contain("1100"); // Cash account code
    }

    [Fact]
    public async Task GetAccounts_WithoutAuth_Returns401()
    {
        _client.DefaultRequestHeaders.Authorization = null;

        var response = await _client.GetAsync(_baseUrl);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetAccounts_WithoutPermission_Returns403()
    {
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer",
            TestAuthHelper.GenerateToken(
                TestConstants.DefaultUserId,
                TestConstants.DefaultTenantId,
                permissions: Array.Empty<string>()));

        var response = await _client.GetAsync(_baseUrl);

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    // ─── GET by ID ───────────────────────────────────────────

    [Fact]
    public async Task GetAccountById_ExistingAccount_Returns200()
    {
        SetAdminAuth();

        var response = await _client.GetAsync($"{_baseUrl}/{TestConstants.CashAccountId}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("Cash");
    }

    [Fact]
    public async Task GetAccountById_NonExistent_Returns404()
    {
        SetAdminAuth();

        var response = await _client.GetAsync($"{_baseUrl}/{Guid.NewGuid()}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    // ─── GET by code ─────────────────────────────────────────

    [Fact]
    public async Task GetAccountByCode_Existing_Returns200()
    {
        SetAdminAuth();

        var response = await _client.GetAsync($"{_baseUrl}/by-code/1100");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("Cash");
    }
}
