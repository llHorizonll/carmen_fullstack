using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Carmen.Domain.Entities.Auth;
using Carmen.Infrastructure.Data;
using Carmen.TestCommon.Constants;
using Carmen.WebApi.Tests.Helpers;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Carmen.WebApi.Tests.Controllers;

public class AuthControllerTests : IClassFixture<TestWebApplicationFactory>, IAsyncLifetime
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public AuthControllerTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    public async Task InitializeAsync()
    {
        using var db = _factory.CreateSeedContext();

        // Clear data
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
            PasswordHash = "$2a$11$test", // BCrypt hash placeholder
            FirstName = "Test",
            LastName = "User",
            TenantId = TestConstants.DefaultTenantId,
            IsActive = true,
            PreferredLanguage = "en",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "seed"
        });
        await db.SaveChangesAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    // ─── GET /api/v1/auth/me ─────────────────────────────────

    [Fact]
    public async Task GetMe_WithValidToken_Returns200()
    {
        var token = TestAuthHelper.AdminToken(TestConstants.DefaultUserId, TestConstants.DefaultTenantId);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await _client.GetAsync("/api/v1/auth/me");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetMe_WithoutToken_Returns401()
    {
        _client.DefaultRequestHeaders.Authorization = null;

        var response = await _client.GetAsync("/api/v1/auth/me");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetMe_WithInvalidToken_Returns401()
    {
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "invalid-token");

        var response = await _client.GetAsync("/api/v1/auth/me");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ─── POST /api/v1/auth/login ─────────────────────────────

    [Fact]
    public async Task Login_WithInvalidCredentials_Returns401()
    {
        var request = new { Email = "nobody@test.com", Password = "wrong" };

        var response = await _client.PostAsJsonAsync("/api/v1/auth/login", request);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ─── POST /api/v1/auth/refresh ───────────────────────────

    [Fact]
    public async Task Refresh_WithInvalidToken_Returns401()
    {
        var request = new { RefreshToken = "non-existent-token" };

        var response = await _client.PostAsJsonAsync("/api/v1/auth/refresh", request);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    // ─── POST /api/v1/auth/logout ────────────────────────────

    [Fact]
    public async Task Logout_WithoutAuth_Returns401()
    {
        _client.DefaultRequestHeaders.Authorization = null;

        var response = await _client.PostAsJsonAsync("/api/v1/auth/logout", new { RefreshToken = "tok" });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
