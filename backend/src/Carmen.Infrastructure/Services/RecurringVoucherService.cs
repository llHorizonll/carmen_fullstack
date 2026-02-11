using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.GL;
using Carmen.Application.Interfaces;
using Carmen.Application.Services.GL;
using Carmen.Domain.Entities.GL;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Services;

public class RecurringVoucherService : IRecurringVoucherService
{
    private readonly CarmenDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<RecurringVoucherService> _logger;

    public RecurringVoucherService(
        CarmenDbContext context,
        ICurrentUserService currentUserService,
        ILogger<RecurringVoucherService> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<PaginatedResult<RecurringVoucherListDto>> GetRecurringVouchersAsync(RecurringVoucherQueryParams query)
    {
        var queryable = _context.RecurringVouchers
            .Include(rv => rv.Lines)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.ToLower();
            queryable = queryable.Where(rv =>
                rv.Name.ToLower().Contains(search) ||
                (rv.Description != null && rv.Description.ToLower().Contains(search)));
        }

        if (query.IsActive.HasValue)
        {
            queryable = queryable.Where(rv => rv.IsActive == query.IsActive.Value);
        }

        if (query.Frequency.HasValue)
        {
            queryable = queryable.Where(rv => rv.Frequency == query.Frequency.Value);
        }

        // Sorting
        queryable = query.SortBy.ToLower() switch
        {
            "nextexecutiondate" => query.SortDescending
                ? queryable.OrderByDescending(rv => rv.NextExecutionDate)
                : queryable.OrderBy(rv => rv.NextExecutionDate),
            "createdat" => query.SortDescending
                ? queryable.OrderByDescending(rv => rv.CreatedAt)
                : queryable.OrderBy(rv => rv.CreatedAt),
            _ => query.SortDescending
                ? queryable.OrderByDescending(rv => rv.Name)
                : queryable.OrderBy(rv => rv.Name),
        };

        var totalCount = await queryable.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize);

        var items = await queryable
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(rv => new RecurringVoucherListDto(
                rv.Id,
                rv.Name,
                rv.Description,
                rv.Frequency,
                rv.NextExecutionDate,
                rv.LastExecutionDate,
                rv.IsActive,
                rv.CurrencyCode,
                rv.TotalDebit,
                rv.TotalCredit,
                rv.ExecutionCount,
                rv.Lines.Count,
                rv.CreatedAt
            ))
            .ToListAsync();

        return new PaginatedResult<RecurringVoucherListDto>(items, totalCount, query.Page, query.PageSize, totalPages);
    }

    public async Task<RecurringVoucherDto?> GetRecurringVoucherByIdAsync(Guid id)
    {
        var rv = await _context.RecurringVouchers
            .Include(r => r.Lines)
                .ThenInclude(l => l.Account)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (rv == null) return null;

        return MapToDto(rv);
    }

    public async Task<RecurringVoucherDto> CreateRecurringVoucherAsync(CreateRecurringVoucherRequest request)
    {
        // Validate lines balance
        var totalDebit = request.Lines.Sum(l => l.DebitAmount);
        var totalCredit = request.Lines.Sum(l => l.CreditAmount);
        if (totalDebit != totalCredit)
            throw new InvalidOperationException("Lines must be balanced. Total debit must equal total credit.");

        if (request.Lines.Count == 0)
            throw new InvalidOperationException("At least one line is required.");

        var tenantId = _currentUserService.TenantId
            ?? throw new InvalidOperationException("Tenant context is required.");

        var rv = new RecurringVoucher
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = request.Name,
            Description = request.Description,
            Frequency = request.Frequency,
            CustomIntervalDays = request.CustomIntervalDays,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            NextExecutionDate = request.StartDate,
            IsActive = true,
            CurrencyCode = request.CurrencyCode,
            ExchangeRate = request.ExchangeRate,
            Reference = request.Reference,
            TotalDebit = totalDebit,
            TotalCredit = totalCredit,
            ExecutionCount = 0,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = _currentUserService.Email ?? "system"
        };

        for (int i = 0; i < request.Lines.Count; i++)
        {
            var line = request.Lines[i];
            rv.Lines.Add(new RecurringVoucherLine
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                RecurringVoucherId = rv.Id,
                LineNumber = i + 1,
                AccountId = line.AccountId,
                DebitAmount = line.DebitAmount,
                CreditAmount = line.CreditAmount,
                Description = line.Description,
                Reference = line.Reference,
                DepartmentId = line.DepartmentId,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = _currentUserService.Email ?? "system"
            });
        }

        _context.RecurringVouchers.Add(rv);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created recurring voucher {Name} ({Id})", rv.Name, rv.Id);

        return (await GetRecurringVoucherByIdAsync(rv.Id))!;
    }

    public async Task<RecurringVoucherDto> UpdateRecurringVoucherAsync(Guid id, UpdateRecurringVoucherRequest request)
    {
        var rv = await _context.RecurringVouchers
            .Include(r => r.Lines)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (rv == null)
            throw new InvalidOperationException("Recurring voucher not found.");

        // Validate lines balance
        var totalDebit = request.Lines.Sum(l => l.DebitAmount);
        var totalCredit = request.Lines.Sum(l => l.CreditAmount);
        if (totalDebit != totalCredit)
            throw new InvalidOperationException("Lines must be balanced. Total debit must equal total credit.");

        if (request.Lines.Count == 0)
            throw new InvalidOperationException("At least one line is required.");

        var tenantId = _currentUserService.TenantId
            ?? throw new InvalidOperationException("Tenant context is required.");

        rv.Name = request.Name;
        rv.Description = request.Description;
        rv.Frequency = request.Frequency;
        rv.CustomIntervalDays = request.CustomIntervalDays;
        rv.StartDate = request.StartDate;
        rv.EndDate = request.EndDate;
        rv.CurrencyCode = request.CurrencyCode;
        rv.ExchangeRate = request.ExchangeRate;
        rv.Reference = request.Reference;
        rv.TotalDebit = totalDebit;
        rv.TotalCredit = totalCredit;
        rv.UpdatedAt = DateTime.UtcNow;
        rv.UpdatedBy = _currentUserService.Email;

        // Remove existing lines
        _context.RecurringVoucherLines.RemoveRange(rv.Lines);

        // Add new lines
        for (int i = 0; i < request.Lines.Count; i++)
        {
            var line = request.Lines[i];
            _context.RecurringVoucherLines.Add(new RecurringVoucherLine
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                RecurringVoucherId = rv.Id,
                LineNumber = i + 1,
                AccountId = line.AccountId,
                DebitAmount = line.DebitAmount,
                CreditAmount = line.CreditAmount,
                Description = line.Description,
                Reference = line.Reference,
                DepartmentId = line.DepartmentId,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = _currentUserService.Email ?? "system"
            });
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated recurring voucher {Name} ({Id})", rv.Name, rv.Id);

        return (await GetRecurringVoucherByIdAsync(rv.Id))!;
    }

    public async Task DeleteRecurringVoucherAsync(Guid id)
    {
        var rv = await _context.RecurringVouchers
            .Include(r => r.Lines)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (rv == null)
            throw new InvalidOperationException("Recurring voucher not found.");

        _context.RecurringVoucherLines.RemoveRange(rv.Lines);
        _context.RecurringVouchers.Remove(rv);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted recurring voucher {Name} ({Id})", rv.Name, rv.Id);
    }

    public async Task<RecurringVoucherDto> ActivateAsync(Guid id)
    {
        var rv = await _context.RecurringVouchers.FindAsync(id);
        if (rv == null)
            throw new InvalidOperationException("Recurring voucher not found.");

        rv.IsActive = true;
        rv.UpdatedAt = DateTime.UtcNow;
        rv.UpdatedBy = _currentUserService.Email;
        await _context.SaveChangesAsync();

        return (await GetRecurringVoucherByIdAsync(rv.Id))!;
    }

    public async Task<RecurringVoucherDto> DeactivateAsync(Guid id)
    {
        var rv = await _context.RecurringVouchers.FindAsync(id);
        if (rv == null)
            throw new InvalidOperationException("Recurring voucher not found.");

        rv.IsActive = false;
        rv.UpdatedAt = DateTime.UtcNow;
        rv.UpdatedBy = _currentUserService.Email;
        await _context.SaveChangesAsync();

        return (await GetRecurringVoucherByIdAsync(rv.Id))!;
    }

    public async Task<List<RecurringVoucher>> GetDueVouchersAsync(DateTime processDate)
    {
        return await _context.RecurringVouchers
            .Include(rv => rv.Lines)
            .Where(rv => rv.IsActive
                && rv.NextExecutionDate <= processDate
                && (rv.EndDate == null || rv.EndDate >= processDate))
            .ToListAsync();
    }

    private RecurringVoucherDto MapToDto(RecurringVoucher rv)
    {
        return new RecurringVoucherDto(
            rv.Id,
            rv.Name,
            rv.Description,
            rv.Frequency,
            rv.CustomIntervalDays,
            rv.StartDate,
            rv.EndDate,
            rv.NextExecutionDate,
            rv.LastExecutionDate,
            rv.IsActive,
            rv.CurrencyCode,
            rv.ExchangeRate,
            rv.Reference,
            rv.TotalDebit,
            rv.TotalCredit,
            rv.ExecutionCount,
            rv.Lines.OrderBy(l => l.LineNumber).Select(l => new RecurringVoucherLineDto(
                l.Id,
                l.LineNumber,
                l.AccountId,
                l.Account?.AccountCode ?? "",
                l.Account?.AccountName ?? "",
                l.DebitAmount,
                l.CreditAmount,
                l.Description,
                l.Reference,
                l.DepartmentId,
                null // DepartmentName - not loaded in this query
            )).ToList(),
            rv.CreatedAt,
            rv.CreatedBy,
            rv.UpdatedAt
        );
    }
}
