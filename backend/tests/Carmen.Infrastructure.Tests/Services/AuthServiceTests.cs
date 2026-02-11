using Carmen.Application.DTOs.Auth;
using Carmen.Application.Interfaces;
using Carmen.Domain.Entities.Auth;
using Carmen.Infrastructure.Data;
using Carmen.Infrastructure.Services;
using Carmen.TestCommon.Constants;
using Carmen.TestCommon.Fixtures;
using FluentAssertions;
using NSubstitute;
using Xunit;

namespace Carmen.Infrastructure.Tests.Services;

public class AuthServiceTests : IDisposable
{
    private readonly CarmenDbContext _context;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly AuthService _service;

    public AuthServiceTests()
    {
        _context = TestDbContextFactory.Create();
        _jwtTokenService = Substitute.For<IJwtTokenService>();
        _passwordHasher = Substitute.For<IPasswordHasher>();
        _service = new AuthService(_context, _jwtTokenService, _passwordHasher);

        // Default mock behavior
        _jwtTokenService.GenerateAccessToken(
            Arg.Any<User>(), Arg.Any<List<string>>(), Arg.Any<List<string>>(), Arg.Any<Tenant?>())
            .Returns("mock-access-token");
        _jwtTokenService.GenerateRefreshToken().Returns("mock-refresh-token");
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    private async Task<(User user, Tenant tenant)> SeedUserWithTenant()
    {
        var tenant = new Tenant
        {
            Id = TestConstants.DefaultTenantId,
            Code = "TEST",
            Name = "Test Hotel",
            BaseCurrency = "USD",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "seed"
        };
        _context.Tenants.Add(tenant);

        var user = new User
        {
            Id = TestConstants.DefaultUserId,
            Email = TestConstants.DefaultEmail,
            PasswordHash = "hashed-password",
            FirstName = "Test",
            LastName = "User",
            TenantId = TestConstants.DefaultTenantId,
            IsActive = true,
            PreferredLanguage = "en",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "seed"
        };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Reload with tenant
        await _context.Entry(user).Reference(u => u.Tenant).LoadAsync();

        return (user, tenant);
    }

    // ─── Login Tests ────────────────────────────────────────────

    [Fact]
    public async Task Login_ValidCredentials_ReturnsTokens()
    {
        var (user, _) = await SeedUserWithTenant();
        _passwordHasher.VerifyPassword("correct-password", "hashed-password").Returns(true);

        var request = new LoginRequest(TestConstants.DefaultEmail, "correct-password", null);
        var result = await _service.LoginAsync(request);

        result.Should().NotBeNull();
        result.AccessToken.Should().Be("mock-access-token");
        result.RefreshToken.Should().Be("mock-refresh-token");
        result.User.Should().NotBeNull();
        result.User.Email.Should().Be(TestConstants.DefaultEmail);
    }

    [Fact]
    public async Task Login_InvalidPassword_Throws()
    {
        var (user, _) = await SeedUserWithTenant();
        _passwordHasher.VerifyPassword("wrong-password", "hashed-password").Returns(false);

        var request = new LoginRequest(TestConstants.DefaultEmail, "wrong-password", null);
        var act = () => _service.LoginAsync(request);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Invalid email or password");
    }

    [Fact]
    public async Task Login_NonexistentUser_Throws()
    {
        var request = new LoginRequest("nobody@test.com", "password", null);
        var act = () => _service.LoginAsync(request);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Invalid email or password");
    }

    [Fact]
    public async Task Login_InactiveUser_Throws()
    {
        var (user, _) = await SeedUserWithTenant();
        user.IsActive = false;
        await _context.SaveChangesAsync();
        _passwordHasher.VerifyPassword("password", "hashed-password").Returns(true);

        var request = new LoginRequest(TestConstants.DefaultEmail, "password", null);
        var act = () => _service.LoginAsync(request);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Account is disabled");
    }

    [Fact]
    public async Task Login_LockedAccount_Throws()
    {
        var (user, _) = await SeedUserWithTenant();
        user.LockoutEndAt = DateTime.UtcNow.AddHours(1);
        await _context.SaveChangesAsync();
        _passwordHasher.VerifyPassword("password", "hashed-password").Returns(true);

        var request = new LoginRequest(TestConstants.DefaultEmail, "password", null);
        var act = () => _service.LoginAsync(request);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Account is locked*");
    }

    [Fact]
    public async Task Login_UpdatesLastLogin()
    {
        var (user, _) = await SeedUserWithTenant();
        _passwordHasher.VerifyPassword("password", "hashed-password").Returns(true);
        user.LastLoginAt = null;
        await _context.SaveChangesAsync();

        var request = new LoginRequest(TestConstants.DefaultEmail, "password", null);
        await _service.LoginAsync(request);

        var updatedUser = await _context.Users.FindAsync(TestConstants.DefaultUserId);
        updatedUser!.LastLoginAt.Should().NotBeNull();
    }

    // ─── Refresh Token Tests ────────────────────────────────────

    [Fact]
    public async Task RefreshToken_ValidToken_ReturnsNewTokens()
    {
        var (user, _) = await SeedUserWithTenant();

        // Seed a valid refresh token
        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = "valid-refresh-token",
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow,
            CreatedBy = user.Email
        };
        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        var request = new RefreshTokenRequest("valid-refresh-token");
        var result = await _service.RefreshTokenAsync(request);

        result.Should().NotBeNull();
        result.AccessToken.Should().Be("mock-access-token");
        result.RefreshToken.Should().Be("mock-refresh-token");
    }

    [Fact]
    public async Task RefreshToken_InvalidToken_Throws()
    {
        var request = new RefreshTokenRequest("non-existent-token");
        var act = () => _service.RefreshTokenAsync(request);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Invalid or expired refresh token");
    }

    [Fact]
    public async Task RefreshToken_RevokedToken_Throws()
    {
        var (user, _) = await SeedUserWithTenant();

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = "revoked-token",
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = true,
            RevokedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = user.Email
        };
        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        var request = new RefreshTokenRequest("revoked-token");
        var act = () => _service.RefreshTokenAsync(request);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Invalid or expired refresh token");
    }

    // ─── GetCurrentUser Tests ───────────────────────────────────

    [Fact]
    public async Task GetCurrentUser_ReturnsUserDto()
    {
        var (user, _) = await SeedUserWithTenant();

        var result = await _service.GetCurrentUserAsync(user.Id);

        result.Should().NotBeNull();
        result.Email.Should().Be(TestConstants.DefaultEmail);
        result.TenantId.Should().Be(TestConstants.DefaultTenantId);
    }

    [Fact]
    public async Task GetCurrentUser_NotFound_Throws()
    {
        var act = () => _service.GetCurrentUserAsync(Guid.NewGuid());

        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("User not found");
    }

    // ─── Logout Tests ───────────────────────────────────────────

    [Fact]
    public async Task Logout_RevokesRefreshToken()
    {
        var (user, _) = await SeedUserWithTenant();

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = "token-to-revoke",
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow,
            CreatedBy = user.Email
        };
        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        await _service.LogoutAsync(user.Id, "token-to-revoke");

        var revokedToken = await _context.RefreshTokens.FindAsync(refreshToken.Id);
        revokedToken!.IsRevoked.Should().BeTrue();
        revokedToken.RevokedAt.Should().NotBeNull();
    }
}
