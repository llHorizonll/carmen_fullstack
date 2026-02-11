using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.Configuration;
using Carmen.Application.Interfaces;
using Carmen.Application.Services.Configuration;
using Carmen.Domain.Entities.Configuration;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Services;

public class PaymentTermService : IPaymentTermService
{
    private readonly CarmenDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<PaymentTermService> _logger;

    public PaymentTermService(
        CarmenDbContext context,
        ICurrentUserService currentUserService,
        ILogger<PaymentTermService> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<PaginatedResult<PaymentTermListDto>> GetPaymentTermsAsync(PaymentTermQueryParams query)
    {
        var queryable = _context.PaymentTerms.AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.ToLower();
            queryable = queryable.Where(p =>
                p.TermCode.ToLower().Contains(search) ||
                p.TermName.ToLower().Contains(search) ||
                (p.TermNameLocal != null && p.TermNameLocal.ToLower().Contains(search)) ||
                (p.Description != null && p.Description.ToLower().Contains(search)));
        }

        if (query.IsActive.HasValue)
        {
            queryable = queryable.Where(p => p.IsActive == query.IsActive.Value);
        }

        // Get total count
        var totalCount = await queryable.CountAsync();

        // Apply sorting
        queryable = query.SortBy.ToLower() switch
        {
            "termname" => query.SortDescending
                ? queryable.OrderByDescending(p => p.TermName)
                : queryable.OrderBy(p => p.TermName),
            "duedays" => query.SortDescending
                ? queryable.OrderByDescending(p => p.DueDays)
                : queryable.OrderBy(p => p.DueDays),
            "sortorder" => query.SortDescending
                ? queryable.OrderByDescending(p => p.SortOrder)
                : queryable.OrderBy(p => p.SortOrder),
            _ => query.SortDescending
                ? queryable.OrderByDescending(p => p.TermCode)
                : queryable.OrderBy(p => p.TermCode)
        };

        // Apply pagination
        var items = await queryable
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(p => new PaymentTermListDto(
                p.Id,
                p.TermCode,
                p.TermName,
                p.TermNameLocal,
                p.DueDays,
                p.DiscountPercent,
                p.IsDefault,
                p.IsActive))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize);

        return new PaginatedResult<PaymentTermListDto>(items, totalCount, query.Page, query.PageSize, totalPages);
    }

    public async Task<PaymentTermDto?> GetPaymentTermByIdAsync(Guid id)
    {
        var paymentTerm = await _context.PaymentTerms
            .FirstOrDefaultAsync(p => p.Id == id);

        return paymentTerm == null ? null : MapToDto(paymentTerm);
    }

    public async Task<PaymentTermDto?> GetPaymentTermByCodeAsync(string termCode)
    {
        var paymentTerm = await _context.PaymentTerms
            .FirstOrDefaultAsync(p => p.TermCode == termCode);

        return paymentTerm == null ? null : MapToDto(paymentTerm);
    }

    public async Task<List<PaymentTermLookupDto>> GetPaymentTermLookupAsync(bool? isActive = null)
    {
        var queryable = _context.PaymentTerms.AsQueryable();

        if (isActive.HasValue)
        {
            queryable = queryable.Where(p => p.IsActive == isActive.Value);
        }
        else
        {
            queryable = queryable.Where(p => p.IsActive);
        }

        return await queryable
            .OrderBy(p => p.SortOrder)
            .ThenBy(p => p.TermCode)
            .Select(p => new PaymentTermLookupDto(
                p.Id,
                p.TermCode,
                p.TermName,
                p.DueDays))
            .ToListAsync();
    }

    public async Task<PaymentTermDto> CreatePaymentTermAsync(CreatePaymentTermRequest request)
    {
        // Validate term code doesn't exist
        if (await TermCodeExistsAsync(request.TermCode))
        {
            throw new InvalidOperationException($"Payment term code '{request.TermCode}' already exists.");
        }

        var tenantId = _currentUserService.TenantId
            ?? throw new InvalidOperationException("Tenant context is required.");

        // If this is set as default, clear other defaults
        if (request.IsDefault)
        {
            await ClearDefaultPaymentTermAsync();
        }

        var paymentTerm = new PaymentTerm
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            TermCode = request.TermCode.ToUpper(),
            TermName = request.TermName,
            TermNameLocal = request.TermNameLocal,
            DueDays = request.DueDays,
            DiscountPercent = request.DiscountPercent,
            DiscountDays = request.DiscountDays,
            Description = request.Description,
            IsDefault = request.IsDefault,
            SortOrder = request.SortOrder,
            IsActive = true,
            CreatedBy = _currentUserService.Email ?? "system"
        };

        _context.PaymentTerms.Add(paymentTerm);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created payment term {TermCode} with ID {PaymentTermId}",
            paymentTerm.TermCode, paymentTerm.Id);

        return MapToDto(paymentTerm);
    }

    public async Task<PaymentTermDto> UpdatePaymentTermAsync(Guid id, UpdatePaymentTermRequest request)
    {
        var paymentTerm = await _context.PaymentTerms
            .FirstOrDefaultAsync(p => p.Id == id);

        if (paymentTerm == null)
        {
            throw new InvalidOperationException("Payment term not found.");
        }

        // If this is set as default, clear other defaults
        if (request.IsDefault && !paymentTerm.IsDefault)
        {
            await ClearDefaultPaymentTermAsync();
        }

        paymentTerm.TermName = request.TermName;
        paymentTerm.TermNameLocal = request.TermNameLocal;
        paymentTerm.DueDays = request.DueDays;
        paymentTerm.DiscountPercent = request.DiscountPercent;
        paymentTerm.DiscountDays = request.DiscountDays;
        paymentTerm.Description = request.Description;
        paymentTerm.IsDefault = request.IsDefault;
        paymentTerm.SortOrder = request.SortOrder;
        paymentTerm.IsActive = request.IsActive;
        paymentTerm.UpdatedBy = _currentUserService.Email;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated payment term {TermCode} with ID {PaymentTermId}",
            paymentTerm.TermCode, paymentTerm.Id);

        return MapToDto(paymentTerm);
    }

    public async Task DeletePaymentTermAsync(Guid id)
    {
        var paymentTerm = await _context.PaymentTerms
            .FirstOrDefaultAsync(p => p.Id == id);

        if (paymentTerm == null)
        {
            throw new InvalidOperationException("Payment term not found.");
        }

        // Check if payment term is used in transactions
        if (await PaymentTermHasTransactionsAsync(id))
        {
            throw new InvalidOperationException("Cannot delete payment term with existing transactions. Deactivate it instead.");
        }

        // Soft delete
        paymentTerm.IsActive = false;
        paymentTerm.UpdatedBy = _currentUserService.Email;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted (deactivated) payment term {TermCode} with ID {PaymentTermId}",
            paymentTerm.TermCode, paymentTerm.Id);
    }

    public async Task<bool> TermCodeExistsAsync(string termCode, Guid? excludeId = null)
    {
        var query = _context.PaymentTerms
            .Where(p => p.TermCode == termCode.ToUpper());

        if (excludeId.HasValue)
        {
            query = query.Where(p => p.Id != excludeId.Value);
        }

        return await query.AnyAsync();
    }

    public async Task<bool> PaymentTermHasTransactionsAsync(Guid id)
    {
        // TODO: Check if payment term is used in invoices or other transactions
        // For now, return false as transaction tables may not exist yet
        return await Task.FromResult(false);
    }

    private async Task ClearDefaultPaymentTermAsync()
    {
        var defaultPaymentTerms = await _context.PaymentTerms
            .Where(p => p.IsDefault)
            .ToListAsync();

        foreach (var paymentTerm in defaultPaymentTerms)
        {
            paymentTerm.IsDefault = false;
        }
    }

    private static PaymentTermDto MapToDto(PaymentTerm paymentTerm)
    {
        return new PaymentTermDto(
            Id: paymentTerm.Id,
            TermCode: paymentTerm.TermCode,
            TermName: paymentTerm.TermName,
            TermNameLocal: paymentTerm.TermNameLocal,
            DueDays: paymentTerm.DueDays,
            DiscountPercent: paymentTerm.DiscountPercent,
            DiscountDays: paymentTerm.DiscountDays,
            Description: paymentTerm.Description,
            IsDefault: paymentTerm.IsDefault,
            SortOrder: paymentTerm.SortOrder,
            IsActive: paymentTerm.IsActive,
            CreatedAt: paymentTerm.CreatedAt,
            UpdatedAt: paymentTerm.UpdatedAt
        );
    }
}
