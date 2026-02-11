using Carmen.Application.DTOs.Settings;
using Carmen.Application.Interfaces;
using Carmen.Application.Services.Settings;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Services;

public class TenantSettingsService : ITenantSettingsService
{
    private readonly CarmenDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<TenantSettingsService> _logger;

    public TenantSettingsService(
        CarmenDbContext context,
        ICurrentUserService currentUserService,
        ILogger<TenantSettingsService> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<TenantSettingsDto?> GetTenantSettingsAsync()
    {
        var tenantId = _currentUserService.TenantId
            ?? throw new InvalidOperationException("Tenant context is required.");

        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.Id == tenantId);

        return tenant == null ? null : MapToDto(tenant);
    }

    public async Task<TenantSettingsDto> UpdateTenantSettingsAsync(UpdateTenantSettingsRequest request)
    {
        var tenantId = _currentUserService.TenantId
            ?? throw new InvalidOperationException("Tenant context is required.");

        var tenant = await _context.Tenants
            .FirstOrDefaultAsync(t => t.Id == tenantId);

        if (tenant == null)
        {
            throw new InvalidOperationException("Tenant not found.");
        }

        tenant.Name = request.Name;
        tenant.Description = request.Description;
        tenant.Address = request.Address;
        tenant.Phone = request.Phone;
        tenant.Email = request.Email;
        tenant.TaxId = request.TaxId;
        tenant.Website = request.Website;
        tenant.BaseCurrency = request.BaseCurrency;
        tenant.DefaultLanguage = request.DefaultLanguage;
        tenant.TimeZone = request.TimeZone;
        tenant.LogoUrl = request.LogoUrl;
        tenant.UpdatedBy = _currentUserService.Email;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated tenant settings for tenant {TenantId}", tenantId);

        return MapToDto(tenant);
    }

    private static TenantSettingsDto MapToDto(Carmen.Domain.Entities.Auth.Tenant tenant)
    {
        return new TenantSettingsDto(
            Id: tenant.Id,
            Code: tenant.Code,
            Name: tenant.Name,
            Description: tenant.Description,
            Address: tenant.Address,
            Phone: tenant.Phone,
            Email: tenant.Email,
            TaxId: tenant.TaxId,
            Website: tenant.Website,
            BaseCurrency: tenant.BaseCurrency,
            DefaultLanguage: tenant.DefaultLanguage,
            TimeZone: tenant.TimeZone,
            LogoUrl: tenant.LogoUrl,
            IsActive: tenant.IsActive,
            SubscriptionExpiresAt: tenant.SubscriptionExpiresAt,
            CreatedAt: tenant.CreatedAt,
            UpdatedAt: tenant.UpdatedAt
        );
    }
}
