using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.Configuration;
using Carmen.Application.Interfaces;
using Carmen.Application.Services.Configuration;
using Carmen.Domain.Entities.Configuration;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Services;

public class TaxProfileService : ITaxProfileService
{
    private readonly CarmenDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<TaxProfileService> _logger;

    public TaxProfileService(
        CarmenDbContext context,
        ICurrentUserService currentUserService,
        ILogger<TaxProfileService> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<PaginatedResult<TaxProfileListDto>> GetTaxProfilesAsync(TaxProfileQueryParams query)
    {
        var queryable = _context.TaxProfiles.AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.ToLower();
            queryable = queryable.Where(t =>
                t.TaxCode.ToLower().Contains(search) ||
                t.TaxName.ToLower().Contains(search) ||
                (t.TaxNameLocal != null && t.TaxNameLocal.ToLower().Contains(search)));
        }

        if (query.TaxType.HasValue)
        {
            queryable = queryable.Where(t => t.TaxType == query.TaxType.Value);
        }

        if (query.IsActive.HasValue)
        {
            queryable = queryable.Where(t => t.IsActive == query.IsActive.Value);
        }

        // Get total count
        var totalCount = await queryable.CountAsync();

        // Apply sorting
        queryable = query.SortBy.ToLower() switch
        {
            "taxname" => query.SortDescending
                ? queryable.OrderByDescending(t => t.TaxName)
                : queryable.OrderBy(t => t.TaxName),
            "taxrate" => query.SortDescending
                ? queryable.OrderByDescending(t => t.TaxRate)
                : queryable.OrderBy(t => t.TaxRate),
            "taxtype" => query.SortDescending
                ? queryable.OrderByDescending(t => t.TaxType)
                : queryable.OrderBy(t => t.TaxType),
            "sortorder" => query.SortDescending
                ? queryable.OrderByDescending(t => t.SortOrder)
                : queryable.OrderBy(t => t.SortOrder),
            _ => query.SortDescending
                ? queryable.OrderByDescending(t => t.TaxCode)
                : queryable.OrderBy(t => t.TaxCode)
        };

        // Apply pagination
        var items = await queryable
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(t => new TaxProfileListDto(
                t.Id,
                t.TaxCode,
                t.TaxName,
                t.TaxType,
                t.TaxRate,
                t.IsActive,
                t.IsDefault))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize);

        return new PaginatedResult<TaxProfileListDto>(items, totalCount, query.Page, query.PageSize, totalPages);
    }

    public async Task<TaxProfileDto?> GetTaxProfileByIdAsync(Guid id)
    {
        var taxProfile = await _context.TaxProfiles
            .Include(t => t.TaxPayableAccount)
            .Include(t => t.TaxReceivableAccount)
            .FirstOrDefaultAsync(t => t.Id == id);

        return taxProfile == null ? null : MapToDto(taxProfile);
    }

    public async Task<TaxProfileDto?> GetTaxProfileByCodeAsync(string taxCode)
    {
        var taxProfile = await _context.TaxProfiles
            .Include(t => t.TaxPayableAccount)
            .Include(t => t.TaxReceivableAccount)
            .FirstOrDefaultAsync(t => t.TaxCode == taxCode);

        return taxProfile == null ? null : MapToDto(taxProfile);
    }

    public async Task<List<TaxProfileLookupDto>> GetTaxProfileLookupAsync(bool? isActive = null)
    {
        var queryable = _context.TaxProfiles.AsQueryable();

        if (isActive.HasValue)
        {
            queryable = queryable.Where(t => t.IsActive == isActive.Value);
        }
        else
        {
            queryable = queryable.Where(t => t.IsActive);
        }

        return await queryable
            .OrderBy(t => t.SortOrder)
            .ThenBy(t => t.TaxCode)
            .Select(t => new TaxProfileLookupDto(
                t.Id,
                t.TaxCode,
                t.TaxName,
                t.TaxRate))
            .ToListAsync();
    }

    public async Task<TaxProfileDto> CreateTaxProfileAsync(CreateTaxProfileRequest request)
    {
        // Validate tax code doesn't exist
        if (await TaxCodeExistsAsync(request.TaxCode))
        {
            throw new InvalidOperationException($"Tax code '{request.TaxCode}' already exists.");
        }

        // Validate GL accounts if specified
        if (request.TaxPayableAccountId.HasValue)
        {
            var payableAccount = await _context.ChartOfAccounts
                .FirstOrDefaultAsync(a => a.Id == request.TaxPayableAccountId.Value);
            if (payableAccount == null)
            {
                throw new InvalidOperationException("Tax payable account not found.");
            }
        }

        if (request.TaxReceivableAccountId.HasValue)
        {
            var receivableAccount = await _context.ChartOfAccounts
                .FirstOrDefaultAsync(a => a.Id == request.TaxReceivableAccountId.Value);
            if (receivableAccount == null)
            {
                throw new InvalidOperationException("Tax receivable account not found.");
            }
        }

        var tenantId = _currentUserService.TenantId
            ?? throw new InvalidOperationException("Tenant context is required.");

        // If this is set as default, clear other defaults
        if (request.IsDefault)
        {
            await ClearDefaultTaxProfileAsync();
        }

        var taxProfile = new TaxProfile
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            TaxCode = request.TaxCode,
            TaxName = request.TaxName,
            TaxNameLocal = request.TaxNameLocal,
            TaxType = request.TaxType,
            CalculationMethod = request.CalculationMethod,
            TaxRate = request.TaxRate,
            Description = request.Description,
            IsActive = true,
            IsDefault = request.IsDefault,
            TaxPayableAccountId = request.TaxPayableAccountId,
            TaxReceivableAccountId = request.TaxReceivableAccountId,
            SortOrder = request.SortOrder,
            CreatedBy = _currentUserService.Email ?? "system"
        };

        _context.TaxProfiles.Add(taxProfile);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created tax profile {TaxCode} with ID {TaxProfileId}",
            taxProfile.TaxCode, taxProfile.Id);

        // Reload with accounts for mapping
        await _context.Entry(taxProfile).Reference(t => t.TaxPayableAccount).LoadAsync();
        await _context.Entry(taxProfile).Reference(t => t.TaxReceivableAccount).LoadAsync();

        return MapToDto(taxProfile);
    }

    public async Task<TaxProfileDto> UpdateTaxProfileAsync(Guid id, UpdateTaxProfileRequest request)
    {
        var taxProfile = await _context.TaxProfiles
            .FirstOrDefaultAsync(t => t.Id == id);

        if (taxProfile == null)
        {
            throw new InvalidOperationException("Tax profile not found.");
        }

        // Validate GL accounts if specified
        if (request.TaxPayableAccountId.HasValue)
        {
            var payableAccount = await _context.ChartOfAccounts
                .FirstOrDefaultAsync(a => a.Id == request.TaxPayableAccountId.Value);
            if (payableAccount == null)
            {
                throw new InvalidOperationException("Tax payable account not found.");
            }
        }

        if (request.TaxReceivableAccountId.HasValue)
        {
            var receivableAccount = await _context.ChartOfAccounts
                .FirstOrDefaultAsync(a => a.Id == request.TaxReceivableAccountId.Value);
            if (receivableAccount == null)
            {
                throw new InvalidOperationException("Tax receivable account not found.");
            }
        }

        // If this is set as default, clear other defaults
        if (request.IsDefault && !taxProfile.IsDefault)
        {
            await ClearDefaultTaxProfileAsync();
        }

        taxProfile.TaxName = request.TaxName;
        taxProfile.TaxNameLocal = request.TaxNameLocal;
        taxProfile.TaxType = request.TaxType;
        taxProfile.CalculationMethod = request.CalculationMethod;
        taxProfile.TaxRate = request.TaxRate;
        taxProfile.Description = request.Description;
        taxProfile.IsActive = request.IsActive;
        taxProfile.IsDefault = request.IsDefault;
        taxProfile.TaxPayableAccountId = request.TaxPayableAccountId;
        taxProfile.TaxReceivableAccountId = request.TaxReceivableAccountId;
        taxProfile.SortOrder = request.SortOrder;
        taxProfile.UpdatedBy = _currentUserService.Email;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated tax profile {TaxCode} with ID {TaxProfileId}",
            taxProfile.TaxCode, taxProfile.Id);

        // Reload with accounts for mapping
        await _context.Entry(taxProfile).Reference(t => t.TaxPayableAccount).LoadAsync();
        await _context.Entry(taxProfile).Reference(t => t.TaxReceivableAccount).LoadAsync();

        return MapToDto(taxProfile);
    }

    public async Task DeleteTaxProfileAsync(Guid id)
    {
        var taxProfile = await _context.TaxProfiles
            .FirstOrDefaultAsync(t => t.Id == id);

        if (taxProfile == null)
        {
            throw new InvalidOperationException("Tax profile not found.");
        }

        // Check if tax profile is used in transactions
        if (await TaxProfileHasTransactionsAsync(id))
        {
            throw new InvalidOperationException("Cannot delete tax profile with existing transactions. Deactivate it instead.");
        }

        // Soft delete
        taxProfile.IsActive = false;
        taxProfile.UpdatedBy = _currentUserService.Email;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted (deactivated) tax profile {TaxCode} with ID {TaxProfileId}",
            taxProfile.TaxCode, taxProfile.Id);
    }

    public async Task<bool> TaxCodeExistsAsync(string taxCode, Guid? excludeId = null)
    {
        var query = _context.TaxProfiles
            .Where(t => t.TaxCode == taxCode);

        if (excludeId.HasValue)
        {
            query = query.Where(t => t.Id != excludeId.Value);
        }

        return await query.AnyAsync();
    }

    public async Task<bool> TaxProfileHasTransactionsAsync(Guid id)
    {
        // TODO: Check if tax profile is used in invoice lines or other transactions
        // For now, return false as transaction tables may not exist yet
        return await Task.FromResult(false);
    }

    private async Task ClearDefaultTaxProfileAsync()
    {
        var defaultTaxProfiles = await _context.TaxProfiles
            .Where(t => t.IsDefault)
            .ToListAsync();

        foreach (var taxProfile in defaultTaxProfiles)
        {
            taxProfile.IsDefault = false;
        }
    }

    private static TaxProfileDto MapToDto(TaxProfile taxProfile)
    {
        return new TaxProfileDto(
            Id: taxProfile.Id,
            TaxCode: taxProfile.TaxCode,
            TaxName: taxProfile.TaxName,
            TaxNameLocal: taxProfile.TaxNameLocal,
            TaxType: taxProfile.TaxType,
            CalculationMethod: taxProfile.CalculationMethod,
            TaxRate: taxProfile.TaxRate,
            Description: taxProfile.Description,
            IsActive: taxProfile.IsActive,
            IsDefault: taxProfile.IsDefault,
            TaxPayableAccountId: taxProfile.TaxPayableAccountId,
            TaxPayableAccountCode: taxProfile.TaxPayableAccount?.AccountCode,
            TaxPayableAccountName: taxProfile.TaxPayableAccount?.AccountName,
            TaxReceivableAccountId: taxProfile.TaxReceivableAccountId,
            TaxReceivableAccountCode: taxProfile.TaxReceivableAccount?.AccountCode,
            TaxReceivableAccountName: taxProfile.TaxReceivableAccount?.AccountName,
            SortOrder: taxProfile.SortOrder,
            CreatedAt: taxProfile.CreatedAt,
            UpdatedAt: taxProfile.UpdatedAt
        );
    }
}
