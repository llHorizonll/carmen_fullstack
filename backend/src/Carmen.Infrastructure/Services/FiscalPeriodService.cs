using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.GL;
using Carmen.Application.Interfaces;
using Carmen.Application.Services.GL;
using Carmen.Domain.Entities.GL;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Services;

public class FiscalPeriodService : IFiscalPeriodService
{
    private readonly CarmenDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<FiscalPeriodService> _logger;

    public FiscalPeriodService(
        CarmenDbContext context,
        ICurrentUserService currentUserService,
        ILogger<FiscalPeriodService> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    // Fiscal Year operations

    public async Task<List<FiscalYearListDto>> GetFiscalYearsAsync()
    {
        return await _context.FiscalYears
            .Include(y => y.Periods)
            .OrderByDescending(y => y.StartDate)
            .Select(y => new FiscalYearListDto(
                y.Id,
                y.Name,
                y.StartDate,
                y.EndDate,
                y.IsClosed,
                y.Periods.Count))
            .ToListAsync();
    }

    public async Task<FiscalYearDto?> GetFiscalYearByIdAsync(Guid id)
    {
        var year = await _context.FiscalYears
            .Include(y => y.Periods)
            .FirstOrDefaultAsync(y => y.Id == id);

        if (year == null) return null;

        return new FiscalYearDto(
            year.Id,
            year.Name,
            year.StartDate,
            year.EndDate,
            year.IsClosed,
            year.ClosedAt,
            year.ClosedBy,
            year.Periods.Count,
            year.Periods.Count(p => p.Status == PeriodStatus.Open),
            year.Periods.Count(p => p.Status == PeriodStatus.Closed || p.Status == PeriodStatus.Locked),
            year.CreatedAt
        );
    }

    public async Task<FiscalYearDto> CreateFiscalYearAsync(CreateFiscalYearRequest request)
    {
        var tenantId = _currentUserService.TenantId
            ?? throw new InvalidOperationException("Tenant context is required.");

        // Check for overlapping fiscal years
        var overlapping = await _context.FiscalYears
            .AnyAsync(y => y.StartDate <= request.EndDate && y.EndDate >= request.StartDate);

        if (overlapping)
        {
            throw new InvalidOperationException("Fiscal year dates overlap with an existing year.");
        }

        var fiscalYear = new FiscalYear
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = request.Name,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            IsClosed = false,
            CreatedBy = _currentUserService.Email ?? "system"
        };

        _context.FiscalYears.Add(fiscalYear);

        // Create monthly periods if requested
        if (request.CreateMonthlyPeriods)
        {
            var currentDate = request.StartDate;
            var periodNumber = 1;

            while (currentDate <= request.EndDate)
            {
                var periodStart = currentDate;
                var periodEnd = new DateTime(currentDate.Year, currentDate.Month, DateTime.DaysInMonth(currentDate.Year, currentDate.Month));

                if (periodEnd > request.EndDate)
                {
                    periodEnd = request.EndDate;
                }

                var period = new FiscalPeriod
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    FiscalYearId = fiscalYear.Id,
                    PeriodNumber = periodNumber,
                    Name = currentDate.ToString("MMMM yyyy"),
                    StartDate = periodStart,
                    EndDate = periodEnd,
                    Status = PeriodStatus.Open,
                    CreatedBy = _currentUserService.Email ?? "system"
                };

                _context.FiscalPeriods.Add(period);
                periodNumber++;
                currentDate = periodEnd.AddDays(1);
            }
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Created fiscal year {Name} with ID {YearId}",
            fiscalYear.Name, fiscalYear.Id);

        return (await GetFiscalYearByIdAsync(fiscalYear.Id))!;
    }

    // Fiscal Period operations

    public async Task<PaginatedResult<FiscalPeriodListDto>> GetPeriodsAsync(FiscalPeriodQueryParams query)
    {
        var queryable = _context.FiscalPeriods.AsQueryable();

        if (query.FiscalYearId.HasValue)
        {
            queryable = queryable.Where(p => p.FiscalYearId == query.FiscalYearId.Value);
        }

        if (query.Status.HasValue)
        {
            queryable = queryable.Where(p => p.Status == query.Status.Value);
        }

        var totalCount = await queryable.CountAsync();

        var items = await queryable
            .OrderByDescending(p => p.StartDate)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(p => new FiscalPeriodListDto(
                p.Id,
                p.FiscalYearId,
                p.PeriodNumber,
                p.Name,
                p.StartDate,
                p.EndDate,
                p.Status,
                p.ClosedAt))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize);

        return new PaginatedResult<FiscalPeriodListDto>(items, totalCount, query.Page, query.PageSize, totalPages);
    }

    public async Task<FiscalPeriodDto?> GetPeriodByIdAsync(Guid id)
    {
        var period = await _context.FiscalPeriods
            .Include(p => p.FiscalYear)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (period == null) return null;

        return MapToDto(period);
    }

    public async Task<List<FiscalPeriodLookupDto>> GetPeriodLookupAsync(Guid? fiscalYearId = null, bool openOnly = false)
    {
        var queryable = _context.FiscalPeriods.AsQueryable();

        if (fiscalYearId.HasValue)
        {
            queryable = queryable.Where(p => p.FiscalYearId == fiscalYearId.Value);
        }

        if (openOnly)
        {
            queryable = queryable.Where(p => p.Status == PeriodStatus.Open);
        }

        return await queryable
            .OrderByDescending(p => p.StartDate)
            .Select(p => new FiscalPeriodLookupDto(
                p.Id,
                p.Name,
                p.StartDate,
                p.EndDate,
                p.Status))
            .ToListAsync();
    }

    public async Task<FiscalPeriodDto?> GetCurrentPeriodAsync()
    {
        var today = DateTime.UtcNow.Date;

        var period = await _context.FiscalPeriods
            .Include(p => p.FiscalYear)
            .Where(p => p.Status == PeriodStatus.Open &&
                        p.StartDate <= today &&
                        p.EndDate >= today)
            .FirstOrDefaultAsync();

        return period == null ? null : MapToDto(period);
    }

    public async Task<FiscalPeriodDto?> GetPeriodByDateAsync(DateTime date)
    {
        var period = await _context.FiscalPeriods
            .Include(p => p.FiscalYear)
            .Where(p => p.StartDate <= date && p.EndDate >= date)
            .FirstOrDefaultAsync();

        return period == null ? null : MapToDto(period);
    }

    // Period Closing operations

    public async Task<PeriodCloseValidationResult> ValidatePeriodCloseAsync(Guid periodId)
    {
        var period = await _context.FiscalPeriods
            .FirstOrDefaultAsync(p => p.Id == periodId);

        if (period == null)
        {
            throw new InvalidOperationException("Period not found.");
        }

        var warnings = new List<string>();
        var errors = new List<string>();

        // Check if period is already closed or locked
        if (period.Status == PeriodStatus.Closed)
        {
            errors.Add("Period is already closed.");
        }
        else if (period.Status == PeriodStatus.Locked)
        {
            errors.Add("Period is locked and cannot be modified.");
        }

        // Get vouchers in this period
        var vouchers = await _context.JournalVouchers
            .Where(v => v.FiscalPeriodId == periodId)
            .ToListAsync();

        var draftCount = vouchers.Count(v => v.Status == DocumentStatus.Draft);
        var pendingCount = vouchers.Count(v => v.Status == DocumentStatus.Pending);
        var approvedCount = vouchers.Count(v => v.Status == DocumentStatus.Approved);

        // Draft and Pending vouchers block closing
        if (draftCount > 0)
        {
            errors.Add($"There are {draftCount} draft voucher(s) that must be posted or deleted.");
        }

        if (pendingCount > 0)
        {
            errors.Add($"There are {pendingCount} pending voucher(s) that must be approved or rejected.");
        }

        // Approved vouchers should be posted
        if (approvedCount > 0)
        {
            warnings.Add($"There are {approvedCount} approved voucher(s) that should be posted before closing.");
        }

        // Calculate totals for posted vouchers
        var postedVouchers = vouchers.Where(v => v.Status == DocumentStatus.Posted).ToList();
        var totalDebit = postedVouchers.Sum(v => v.TotalDebit);
        var totalCredit = postedVouchers.Sum(v => v.TotalCredit);
        var isBalanced = Math.Abs(totalDebit - totalCredit) < 0.01m;

        if (!isBalanced)
        {
            warnings.Add($"Posted vouchers are not balanced. Debit: {totalDebit:N2}, Credit: {totalCredit:N2}");
        }

        var canClose = errors.Count == 0;

        return new PeriodCloseValidationResult(
            CanClose: canClose,
            Warnings: warnings,
            Errors: errors,
            PendingVouchersCount: pendingCount,
            DraftVouchersCount: draftCount,
            ApprovedVouchersCount: approvedCount,
            TotalDebit: totalDebit,
            TotalCredit: totalCredit,
            IsBalanced: isBalanced
        );
    }

    public async Task<PeriodBlockingVouchersDto> GetBlockingVouchersAsync(Guid periodId)
    {
        var vouchers = await _context.JournalVouchers
            .Where(v => v.FiscalPeriodId == periodId &&
                        (v.Status == DocumentStatus.Draft ||
                         v.Status == DocumentStatus.Pending ||
                         v.Status == DocumentStatus.Approved))
            .OrderBy(v => v.VoucherDate)
            .ThenBy(v => v.VoucherNumber)
            .ToListAsync();

        var mapToDto = (JournalVoucher v) => new BlockingVoucherDto(
            v.Id,
            v.VoucherNumber,
            v.VoucherDate,
            v.Status.ToString(),
            v.TotalDebit,
            v.TotalCredit,
            v.Description
        );

        return new PeriodBlockingVouchersDto(
            DraftVouchers: vouchers.Where(v => v.Status == DocumentStatus.Draft).Select(mapToDto).ToList(),
            PendingVouchers: vouchers.Where(v => v.Status == DocumentStatus.Pending).Select(mapToDto).ToList(),
            ApprovedVouchers: vouchers.Where(v => v.Status == DocumentStatus.Approved).Select(mapToDto).ToList()
        );
    }

    public async Task<FiscalPeriodDto> ClosePeriodAsync(Guid periodId, ClosePeriodRequest request)
    {
        var period = await _context.FiscalPeriods
            .Include(p => p.FiscalYear)
            .FirstOrDefaultAsync(p => p.Id == periodId);

        if (period == null)
        {
            throw new InvalidOperationException("Period not found.");
        }

        // Validate before closing
        var validation = await ValidatePeriodCloseAsync(periodId);
        if (!validation.CanClose)
        {
            throw new InvalidOperationException($"Cannot close period: {string.Join("; ", validation.Errors)}");
        }

        // Close the period
        period.Status = PeriodStatus.Closed;
        period.ClosedAt = DateTime.UtcNow;
        period.ClosedBy = _currentUserService.Email ?? "system";
        period.UpdatedBy = _currentUserService.Email;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Closed fiscal period {PeriodName} (ID: {PeriodId}) by {User}",
            period.Name, period.Id, period.ClosedBy);

        return MapToDto(period);
    }

    public async Task<FiscalPeriodDto> ReopenPeriodAsync(Guid periodId, ReopenPeriodRequest request)
    {
        var period = await _context.FiscalPeriods
            .Include(p => p.FiscalYear)
            .FirstOrDefaultAsync(p => p.Id == periodId);

        if (period == null)
        {
            throw new InvalidOperationException("Period not found.");
        }

        if (period.Status == PeriodStatus.Locked)
        {
            throw new InvalidOperationException("Locked periods cannot be reopened.");
        }

        if (period.Status == PeriodStatus.Open)
        {
            throw new InvalidOperationException("Period is already open.");
        }

        if (string.IsNullOrWhiteSpace(request.Reason))
        {
            throw new InvalidOperationException("Reason is required to reopen a period.");
        }

        // Reopen the period
        period.Status = PeriodStatus.Open;
        period.ClosedAt = null;
        period.ClosedBy = null;
        period.UpdatedBy = _currentUserService.Email;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Reopened fiscal period {PeriodName} (ID: {PeriodId}) by {User}. Reason: {Reason}",
            period.Name, period.Id, _currentUserService.Email, request.Reason);

        return MapToDto(period);
    }

    public async Task<FiscalPeriodDto> LockPeriodAsync(Guid periodId)
    {
        var period = await _context.FiscalPeriods
            .Include(p => p.FiscalYear)
            .FirstOrDefaultAsync(p => p.Id == periodId);

        if (period == null)
        {
            throw new InvalidOperationException("Period not found.");
        }

        if (period.Status == PeriodStatus.Locked)
        {
            throw new InvalidOperationException("Period is already locked.");
        }

        if (period.Status == PeriodStatus.Open)
        {
            throw new InvalidOperationException("Period must be closed before it can be locked.");
        }

        // Lock the period permanently
        period.Status = PeriodStatus.Locked;
        period.UpdatedBy = _currentUserService.Email;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Locked fiscal period {PeriodName} (ID: {PeriodId}) by {User}",
            period.Name, period.Id, _currentUserService.Email);

        return MapToDto(period);
    }

    private static FiscalPeriodDto MapToDto(FiscalPeriod period)
    {
        return new FiscalPeriodDto(
            Id: period.Id,
            FiscalYearId: period.FiscalYearId,
            FiscalYearName: period.FiscalYear?.Name ?? "",
            PeriodNumber: period.PeriodNumber,
            Name: period.Name,
            StartDate: period.StartDate,
            EndDate: period.EndDate,
            Status: period.Status,
            ClosedAt: period.ClosedAt,
            ClosedBy: period.ClosedBy,
            CreatedAt: period.CreatedAt
        );
    }
}
