using Carmen.Application.DTOs.Settings;
using Carmen.Application.Interfaces;
using Carmen.Application.Services.Settings;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Services;

public class LicenseService : ILicenseService
{
    private readonly CarmenDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<LicenseService> _logger;

    public LicenseService(
        CarmenDbContext context,
        ICurrentUserService currentUserService,
        ILogger<LicenseService> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<LicenseDto> GetLicenseInfoAsync()
    {
        var tenantId = _currentUserService.TenantId
            ?? throw new InvalidOperationException("Tenant context is required.");

        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.Id == tenantId)
            ?? throw new InvalidOperationException("Tenant not found.");

        // Count current users for this tenant
        var currentUsers = await _context.Users
            .CountAsync(u => u.TenantId == tenantId && u.IsActive);

        // Count current chart of accounts for this tenant
        var currentAccounts = await _context.ChartOfAccounts
            .CountAsync(a => a.TenantId == tenantId && a.IsActive);

        // Calculate subscription status
        var subscriptionStatus = CalculateSubscriptionStatus(tenant);

        // Calculate days remaining
        var daysRemaining = CalculateDaysRemaining(tenant);

        _logger.LogDebug("Retrieved license info for tenant {TenantId}", tenantId);

        return new LicenseDto(
            SubscriptionPlan: tenant.SubscriptionPlan,
            SubscriptionStatus: subscriptionStatus,
            SubscriptionExpiresAt: tenant.SubscriptionExpiresAt,
            MaxUsers: tenant.MaxUsers,
            CurrentUsers: currentUsers,
            MaxAccounts: tenant.MaxAccounts,
            CurrentAccounts: currentAccounts,
            IsTrialMode: tenant.IsTrialMode,
            TrialEndsAt: tenant.TrialEndsAt,
            DaysRemaining: daysRemaining
        );
    }

    private static string CalculateSubscriptionStatus(Carmen.Domain.Entities.Auth.Tenant tenant)
    {
        if (!tenant.IsActive)
        {
            return "Suspended";
        }

        if (tenant.IsTrialMode)
        {
            if (tenant.TrialEndsAt.HasValue && tenant.TrialEndsAt.Value < DateTime.UtcNow)
            {
                return "Expired";
            }
            return "Trial";
        }

        if (tenant.SubscriptionExpiresAt.HasValue)
        {
            if (tenant.SubscriptionExpiresAt.Value < DateTime.UtcNow)
            {
                return "Expired";
            }
        }

        return "Active";
    }

    private static int CalculateDaysRemaining(Carmen.Domain.Entities.Auth.Tenant tenant)
    {
        DateTime? expirationDate = tenant.IsTrialMode
            ? tenant.TrialEndsAt
            : tenant.SubscriptionExpiresAt;

        if (!expirationDate.HasValue)
        {
            return -1; // No expiration (unlimited)
        }

        var daysRemaining = (expirationDate.Value - DateTime.UtcNow).Days;
        return Math.Max(0, daysRemaining);
    }
}
