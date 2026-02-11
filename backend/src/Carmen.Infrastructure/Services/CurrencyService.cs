using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.Configuration;
using Carmen.Application.Interfaces;
using Carmen.Application.Services.Configuration;
using Carmen.Domain.Entities.Configuration;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Services;

public class CurrencyService : ICurrencyService
{
    private readonly CarmenDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<CurrencyService> _logger;

    public CurrencyService(
        CarmenDbContext context,
        ICurrentUserService currentUserService,
        ILogger<CurrencyService> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<PaginatedResult<CurrencyListDto>> GetCurrenciesAsync(CurrencyQueryParams query)
    {
        var queryable = _context.Currencies.AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.ToLower();
            queryable = queryable.Where(c =>
                c.CurrencyCode.ToLower().Contains(search) ||
                c.CurrencyName.ToLower().Contains(search) ||
                (c.CurrencyNameLocal != null && c.CurrencyNameLocal.ToLower().Contains(search)));
        }

        if (query.IsActive.HasValue)
        {
            queryable = queryable.Where(c => c.IsActive == query.IsActive.Value);
        }

        if (query.IsBaseCurrency.HasValue)
        {
            queryable = queryable.Where(c => c.IsBaseCurrency == query.IsBaseCurrency.Value);
        }

        // Get total count
        var totalCount = await queryable.CountAsync();

        // Apply sorting
        queryable = query.SortBy.ToLower() switch
        {
            "currencyname" => query.SortDescending
                ? queryable.OrderByDescending(c => c.CurrencyName)
                : queryable.OrderBy(c => c.CurrencyName),
            "exchangerate" => query.SortDescending
                ? queryable.OrderByDescending(c => c.ExchangeRate)
                : queryable.OrderBy(c => c.ExchangeRate),
            "sortorder" => query.SortDescending
                ? queryable.OrderByDescending(c => c.SortOrder)
                : queryable.OrderBy(c => c.SortOrder),
            _ => query.SortDescending
                ? queryable.OrderByDescending(c => c.CurrencyCode)
                : queryable.OrderBy(c => c.CurrencyCode)
        };

        // Apply pagination
        var items = await queryable
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(c => new CurrencyListDto(
                c.Id,
                c.CurrencyCode,
                c.CurrencyName,
                c.Symbol,
                c.DecimalPlaces,
                c.ExchangeRate,
                c.IsBaseCurrency,
                c.IsActive))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize);

        return new PaginatedResult<CurrencyListDto>(items, totalCount, query.Page, query.PageSize, totalPages);
    }

    public async Task<CurrencyDto?> GetCurrencyByIdAsync(Guid id)
    {
        var currency = await _context.Currencies
            .FirstOrDefaultAsync(c => c.Id == id);

        return currency == null ? null : MapToDto(currency);
    }

    public async Task<CurrencyDto?> GetCurrencyByCodeAsync(string currencyCode)
    {
        var currency = await _context.Currencies
            .FirstOrDefaultAsync(c => c.CurrencyCode == currencyCode);

        return currency == null ? null : MapToDto(currency);
    }

    public async Task<List<CurrencyLookupDto>> GetCurrencyLookupAsync(bool? isActive = null)
    {
        var queryable = _context.Currencies.AsQueryable();

        if (isActive.HasValue)
        {
            queryable = queryable.Where(c => c.IsActive == isActive.Value);
        }
        else
        {
            queryable = queryable.Where(c => c.IsActive);
        }

        return await queryable
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.CurrencyCode)
            .Select(c => new CurrencyLookupDto(
                c.Id,
                c.CurrencyCode,
                c.CurrencyName,
                c.Symbol,
                c.DecimalPlaces))
            .ToListAsync();
    }

    public async Task<CurrencyDto> CreateCurrencyAsync(CreateCurrencyRequest request)
    {
        // Validate currency code doesn't exist
        if (await CurrencyCodeExistsAsync(request.CurrencyCode))
        {
            throw new InvalidOperationException($"Currency code '{request.CurrencyCode}' already exists.");
        }

        var tenantId = _currentUserService.TenantId
            ?? throw new InvalidOperationException("Tenant context is required.");

        // If this is set as base currency, clear other base currencies
        if (request.IsBaseCurrency)
        {
            await ClearBaseCurrencyAsync();
        }

        var currency = new Currency
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            CurrencyCode = request.CurrencyCode.ToUpper(),
            CurrencyName = request.CurrencyName,
            CurrencyNameLocal = request.CurrencyNameLocal,
            Symbol = request.Symbol,
            DecimalPlaces = request.DecimalPlaces,
            ExchangeRate = request.ExchangeRate,
            ExchangeRateDate = DateTime.UtcNow,
            IsBaseCurrency = request.IsBaseCurrency,
            SortOrder = request.SortOrder,
            IsActive = true,
            CreatedBy = _currentUserService.Email ?? "system"
        };

        _context.Currencies.Add(currency);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created currency {CurrencyCode} with ID {CurrencyId}",
            currency.CurrencyCode, currency.Id);

        return MapToDto(currency);
    }

    public async Task<CurrencyDto> UpdateCurrencyAsync(Guid id, UpdateCurrencyRequest request)
    {
        var currency = await _context.Currencies
            .FirstOrDefaultAsync(c => c.Id == id);

        if (currency == null)
        {
            throw new InvalidOperationException("Currency not found.");
        }

        // If this is set as base currency, clear other base currencies
        if (request.IsBaseCurrency && !currency.IsBaseCurrency)
        {
            await ClearBaseCurrencyAsync();
        }

        currency.CurrencyName = request.CurrencyName;
        currency.CurrencyNameLocal = request.CurrencyNameLocal;
        currency.Symbol = request.Symbol;
        currency.DecimalPlaces = request.DecimalPlaces;
        currency.ExchangeRate = request.ExchangeRate;
        currency.ExchangeRateDate = request.ExchangeRateDate ?? DateTime.UtcNow;
        currency.IsBaseCurrency = request.IsBaseCurrency;
        currency.SortOrder = request.SortOrder;
        currency.IsActive = request.IsActive;
        currency.UpdatedBy = _currentUserService.Email;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated currency {CurrencyCode} with ID {CurrencyId}",
            currency.CurrencyCode, currency.Id);

        return MapToDto(currency);
    }

    public async Task DeleteCurrencyAsync(Guid id)
    {
        var currency = await _context.Currencies
            .FirstOrDefaultAsync(c => c.Id == id);

        if (currency == null)
        {
            throw new InvalidOperationException("Currency not found.");
        }

        // Check if currency is used in transactions
        if (await CurrencyHasTransactionsAsync(id))
        {
            throw new InvalidOperationException("Cannot delete currency with existing transactions. Deactivate it instead.");
        }

        // Prevent deleting base currency
        if (currency.IsBaseCurrency)
        {
            throw new InvalidOperationException("Cannot delete the base currency. Set another currency as base first.");
        }

        // Soft delete
        currency.IsActive = false;
        currency.UpdatedBy = _currentUserService.Email;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted (deactivated) currency {CurrencyCode} with ID {CurrencyId}",
            currency.CurrencyCode, currency.Id);
    }

    public async Task<bool> CurrencyCodeExistsAsync(string currencyCode, Guid? excludeId = null)
    {
        var query = _context.Currencies
            .Where(c => c.CurrencyCode == currencyCode.ToUpper());

        if (excludeId.HasValue)
        {
            query = query.Where(c => c.Id != excludeId.Value);
        }

        return await query.AnyAsync();
    }

    public async Task<bool> CurrencyHasTransactionsAsync(Guid id)
    {
        // Check if currency is used in chart of accounts
        var usedInAccounts = await _context.ChartOfAccounts
            .AnyAsync(a => a.CurrencyCode == _context.Currencies
                .Where(c => c.Id == id)
                .Select(c => c.CurrencyCode)
                .FirstOrDefault());

        if (usedInAccounts) return true;

        // TODO: Check if currency is used in other transactions
        // For now, return false as other transaction tables may not exist yet
        return false;
    }

    public async Task UpdateExchangeRateAsync(Guid id, decimal exchangeRate)
    {
        var currency = await _context.Currencies
            .FirstOrDefaultAsync(c => c.Id == id);

        if (currency == null)
        {
            throw new InvalidOperationException("Currency not found.");
        }

        if (currency.IsBaseCurrency && exchangeRate != 1.0m)
        {
            throw new InvalidOperationException("Base currency exchange rate must be 1.0.");
        }

        currency.ExchangeRate = exchangeRate;
        currency.ExchangeRateDate = DateTime.UtcNow;
        currency.UpdatedBy = _currentUserService.Email;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated exchange rate for currency {CurrencyCode} to {ExchangeRate}",
            currency.CurrencyCode, exchangeRate);
    }

    private async Task ClearBaseCurrencyAsync()
    {
        var baseCurrencies = await _context.Currencies
            .Where(c => c.IsBaseCurrency)
            .ToListAsync();

        foreach (var currency in baseCurrencies)
        {
            currency.IsBaseCurrency = false;
        }
    }

    private static CurrencyDto MapToDto(Currency currency)
    {
        return new CurrencyDto(
            Id: currency.Id,
            CurrencyCode: currency.CurrencyCode,
            CurrencyName: currency.CurrencyName,
            CurrencyNameLocal: currency.CurrencyNameLocal,
            Symbol: currency.Symbol,
            DecimalPlaces: currency.DecimalPlaces,
            ExchangeRate: currency.ExchangeRate,
            ExchangeRateDate: currency.ExchangeRateDate,
            IsBaseCurrency: currency.IsBaseCurrency,
            SortOrder: currency.SortOrder,
            IsActive: currency.IsActive,
            CreatedAt: currency.CreatedAt,
            UpdatedAt: currency.UpdatedAt
        );
    }
}
