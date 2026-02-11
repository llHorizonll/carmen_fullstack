using Carmen.Application.DTOs.Asset;
using Carmen.Application.DTOs.Common;
using Carmen.Application.Interfaces;
using Carmen.Application.Services.Asset;
using Carmen.Domain.Entities.Asset;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Services;

public class DepreciationService : IDepreciationService
{
    private readonly CarmenDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<DepreciationService> _logger;

    public DepreciationService(
        CarmenDbContext context,
        ICurrentUserService currentUserService,
        ILogger<DepreciationService> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<PaginatedResult<DepreciationScheduleListDto>> GetSchedulesAsync(DepreciationQueryParams query)
    {
        var queryable = _context.DepreciationSchedules
            .Include(s => s.Asset)
                .ThenInclude(a => a.AssetCategory)
            .Include(s => s.FiscalPeriod)
            .AsQueryable();

        // Apply filters
        if (query.AssetId.HasValue)
        {
            queryable = queryable.Where(s => s.AssetId == query.AssetId.Value);
        }

        if (query.FiscalPeriodId.HasValue)
        {
            queryable = queryable.Where(s => s.FiscalPeriodId == query.FiscalPeriodId.Value);
        }

        if (query.IsPosted.HasValue)
        {
            queryable = queryable.Where(s => s.IsPosted == query.IsPosted.Value);
        }

        if (query.DateFrom.HasValue)
        {
            queryable = queryable.Where(s => s.ScheduleDate >= query.DateFrom.Value);
        }

        if (query.DateTo.HasValue)
        {
            queryable = queryable.Where(s => s.ScheduleDate <= query.DateTo.Value);
        }

        // Get total count
        var totalCount = await queryable.CountAsync();

        // Apply sorting
        queryable = query.SortBy.ToLower() switch
        {
            "assetcode" => query.SortDescending
                ? queryable.OrderByDescending(s => s.Asset.AssetCode)
                : queryable.OrderBy(s => s.Asset.AssetCode),
            "depreciationamount" => query.SortDescending
                ? queryable.OrderByDescending(s => s.DepreciationAmount)
                : queryable.OrderBy(s => s.DepreciationAmount),
            "postedat" => query.SortDescending
                ? queryable.OrderByDescending(s => s.PostedAt)
                : queryable.OrderBy(s => s.PostedAt),
            _ => query.SortDescending
                ? queryable.OrderByDescending(s => s.ScheduleDate)
                : queryable.OrderBy(s => s.ScheduleDate)
        };

        // Apply pagination
        var items = await queryable
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(s => new DepreciationScheduleListDto(
                s.Id,
                s.AssetId,
                s.Asset.AssetCode,
                s.Asset.AssetName,
                s.Asset.AssetCategory.CategoryName,
                s.FiscalPeriod.Name,
                s.ScheduleDate,
                s.DepreciationAmount,
                s.AccumulatedDepreciation,
                s.ClosingValue,
                s.IsPosted,
                s.PostedAt))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize);

        return new PaginatedResult<DepreciationScheduleListDto>(items, totalCount, query.Page, query.PageSize, totalPages);
    }

    public async Task<DepreciationScheduleDto?> GetScheduleByIdAsync(Guid id)
    {
        var schedule = await _context.DepreciationSchedules
            .Include(s => s.Asset)
            .Include(s => s.FiscalPeriod)
            .Include(s => s.JournalVoucher)
            .FirstOrDefaultAsync(s => s.Id == id);

        return schedule == null ? null : MapToDto(schedule);
    }

    public async Task<List<DepreciationScheduleDto>> GetSchedulesByAssetAsync(Guid assetId)
    {
        var schedules = await _context.DepreciationSchedules
            .Include(s => s.Asset)
            .Include(s => s.FiscalPeriod)
            .Include(s => s.JournalVoucher)
            .Where(s => s.AssetId == assetId)
            .OrderBy(s => s.ScheduleNumber)
            .ToListAsync();

        return schedules.Select(MapToDto).ToList();
    }

    public async Task<List<DepreciationScheduleDto>> GenerateScheduleAsync(Guid assetId)
    {
        var asset = await _context.Assets
            .Include(a => a.DepreciationSchedules)
            .FirstOrDefaultAsync(a => a.Id == assetId)
            ?? throw new InvalidOperationException("Asset not found.");

        // Remove existing unposted schedules
        var unpostedSchedules = asset.DepreciationSchedules.Where(s => !s.IsPosted).ToList();
        _context.DepreciationSchedules.RemoveRange(unpostedSchedules);

        var tenantId = _currentUserService.TenantId
            ?? throw new InvalidOperationException("Tenant context is required.");

        var schedules = new List<DepreciationSchedule>();
        var currentDate = asset.DepreciationStartDate;
        var openingValue = asset.AcquisitionCost;
        var accumulatedDepreciation = asset.AccumulatedDepreciation;
        var scheduleNumber = asset.DepreciatedMonths + 1;

        for (int month = scheduleNumber; month <= asset.UsefulLifeMonths; month++)
        {
            // Get or create fiscal period for this date
            var fiscalPeriod = await GetOrCreateFiscalPeriodAsync(currentDate);
            if (fiscalPeriod == null)
            {
                _logger.LogWarning("Could not find fiscal period for date {Date}, stopping schedule generation", currentDate);
                break;
            }

            var depreciationAmount = CalculateDepreciationAmount(asset, currentDate);

            // Don't depreciate below salvage value
            if (openingValue - depreciationAmount < asset.SalvageValue)
            {
                depreciationAmount = openingValue - asset.SalvageValue;
            }

            if (depreciationAmount <= 0) break;

            accumulatedDepreciation += depreciationAmount;
            var closingValue = asset.AcquisitionCost - accumulatedDepreciation;

            var schedule = new DepreciationSchedule
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                AssetId = assetId,
                FiscalPeriodId = fiscalPeriod.Id,
                ScheduleNumber = month,
                ScheduleDate = currentDate.AddMonths(1).AddDays(-1), // End of month
                OpeningValue = openingValue,
                DepreciationAmount = depreciationAmount,
                DepreciationAmountBase = depreciationAmount * asset.ExchangeRate,
                ClosingValue = closingValue,
                AccumulatedDepreciation = accumulatedDepreciation,
                IsPosted = false,
                CreatedBy = _currentUserService.Email ?? "system"
            };

            schedules.Add(schedule);
            openingValue = closingValue;
            currentDate = currentDate.AddMonths(1);
        }

        _context.DepreciationSchedules.AddRange(schedules);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Generated {Count} depreciation schedules for asset {AssetCode}",
            schedules.Count, asset.AssetCode);

        return schedules.Select(MapToDto).ToList();
    }

    public async Task<List<DepreciationScheduleDto>> RunMonthlyDepreciationAsync(RunDepreciationRequest request)
    {
        var tenantId = _currentUserService.TenantId
            ?? throw new InvalidOperationException("Tenant context is required.");

        var fiscalPeriod = await _context.FiscalPeriods.FindAsync(request.FiscalPeriodId)
            ?? throw new InvalidOperationException("Fiscal period not found.");

        // Get all active assets that need depreciation
        var activeAssets = await _context.Assets
            .Where(a => a.Status == AssetStatus.Active && !a.IsFullyDepreciated)
            .Where(a => a.DepreciationStartDate <= fiscalPeriod.EndDate)
            .ToListAsync();

        var createdSchedules = new List<DepreciationSchedule>();

        foreach (var asset in activeAssets)
        {
            // Check if schedule already exists for this period
            var existingSchedule = await _context.DepreciationSchedules
                .FirstOrDefaultAsync(s => s.AssetId == asset.Id && s.FiscalPeriodId == request.FiscalPeriodId);

            if (existingSchedule != null) continue;

            var depreciationAmount = CalculateDepreciationAmount(asset, fiscalPeriod.EndDate);

            // Don't depreciate below salvage value
            if (asset.CurrentValue - depreciationAmount < asset.SalvageValue)
            {
                depreciationAmount = asset.CurrentValue - asset.SalvageValue;
            }

            if (depreciationAmount <= 0) continue;

            var schedule = new DepreciationSchedule
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                AssetId = asset.Id,
                FiscalPeriodId = request.FiscalPeriodId,
                ScheduleNumber = asset.DepreciatedMonths + 1,
                ScheduleDate = fiscalPeriod.EndDate,
                OpeningValue = asset.CurrentValue,
                DepreciationAmount = depreciationAmount,
                DepreciationAmountBase = depreciationAmount * asset.ExchangeRate,
                ClosingValue = asset.CurrentValue - depreciationAmount,
                AccumulatedDepreciation = asset.AccumulatedDepreciation + depreciationAmount,
                IsPosted = false,
                CreatedBy = _currentUserService.Email ?? "system"
            };

            createdSchedules.Add(schedule);
        }

        _context.DepreciationSchedules.AddRange(createdSchedules);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created {Count} depreciation schedules for period {Period}",
            createdSchedules.Count, fiscalPeriod.Name);

        // Auto-post if requested
        if (request.AutoPost)
        {
            foreach (var schedule in createdSchedules)
            {
                await PostDepreciationAsync(schedule.Id);
            }
        }

        return createdSchedules.Select(MapToDto).ToList();
    }

    public async Task<DepreciationScheduleDto> PostDepreciationAsync(Guid scheduleId)
    {
        var schedule = await _context.DepreciationSchedules
            .Include(s => s.Asset)
            .Include(s => s.FiscalPeriod)
            .FirstOrDefaultAsync(s => s.Id == scheduleId)
            ?? throw new InvalidOperationException("Depreciation schedule not found.");

        if (schedule.IsPosted)
        {
            throw new InvalidOperationException("Depreciation is already posted.");
        }

        var asset = schedule.Asset;

        // TODO: Create journal voucher
        // Debit: Depreciation Expense (DepreciationExpenseAccountId)
        // Credit: Accumulated Depreciation (AccumDepreciationAccountId)

        // Update schedule
        schedule.IsPosted = true;
        schedule.PostedAt = DateTime.UtcNow;
        schedule.PostedBy = _currentUserService.Email;

        // Update asset
        asset.AccumulatedDepreciation += schedule.DepreciationAmount;
        asset.CurrentValue = asset.AcquisitionCost - asset.AccumulatedDepreciation;
        asset.DepreciatedMonths++;
        asset.IsFullyDepreciated = asset.CurrentValue <= asset.SalvageValue;
        asset.UpdatedBy = _currentUserService.Email;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Posted depreciation {ScheduleId} for asset {AssetCode}, amount: {Amount}",
            scheduleId, asset.AssetCode, schedule.DepreciationAmount);

        return MapToDto(schedule);
    }

    public async Task<int> PostAllDepreciationAsync(Guid fiscalPeriodId)
    {
        var unpostedSchedules = await _context.DepreciationSchedules
            .Where(s => s.FiscalPeriodId == fiscalPeriodId && !s.IsPosted)
            .ToListAsync();

        foreach (var schedule in unpostedSchedules)
        {
            await PostDepreciationAsync(schedule.Id);
        }

        _logger.LogInformation("Posted {Count} depreciation schedules for period {PeriodId}",
            unpostedSchedules.Count, fiscalPeriodId);

        return unpostedSchedules.Count;
    }

    public async Task<DepreciationScheduleDto> ReverseDepreciationAsync(Guid scheduleId)
    {
        var schedule = await _context.DepreciationSchedules
            .Include(s => s.Asset)
            .Include(s => s.FiscalPeriod)
            .FirstOrDefaultAsync(s => s.Id == scheduleId)
            ?? throw new InvalidOperationException("Depreciation schedule not found.");

        if (!schedule.IsPosted)
        {
            throw new InvalidOperationException("Cannot reverse unposted depreciation.");
        }

        var asset = schedule.Asset;

        // TODO: Create reversal journal voucher
        // Debit: Accumulated Depreciation
        // Credit: Depreciation Expense

        // Update asset
        asset.AccumulatedDepreciation -= schedule.DepreciationAmount;
        asset.CurrentValue = asset.AcquisitionCost - asset.AccumulatedDepreciation;
        asset.DepreciatedMonths--;
        asset.IsFullyDepreciated = false;
        asset.UpdatedBy = _currentUserService.Email;

        // Update schedule (mark as unposted instead of deleting for audit trail)
        schedule.IsPosted = false;
        schedule.PostedAt = null;
        schedule.PostedBy = null;
        schedule.Notes = "Reversed";

        await _context.SaveChangesAsync();

        _logger.LogInformation("Reversed depreciation {ScheduleId} for asset {AssetCode}",
            scheduleId, asset.AssetCode);

        return MapToDto(schedule);
    }

    public async Task<DepreciationSummaryDto> GetDepreciationSummaryAsync(Guid fiscalPeriodId)
    {
        var fiscalPeriod = await _context.FiscalPeriods.FindAsync(fiscalPeriodId)
            ?? throw new InvalidOperationException("Fiscal period not found.");

        var schedules = await _context.DepreciationSchedules
            .Where(s => s.FiscalPeriodId == fiscalPeriodId)
            .ToListAsync();

        var totalAssets = await _context.Assets
            .Where(a => a.Status == AssetStatus.Active && !a.IsFullyDepreciated)
            .CountAsync();

        return new DepreciationSummaryDto(
            fiscalPeriodId,
            fiscalPeriod.Name,
            totalAssets,
            schedules.Select(s => s.AssetId).Distinct().Count(),
            schedules.Sum(s => s.DepreciationAmount),
            schedules.Sum(s => s.DepreciationAmountBase),
            schedules.Count(s => s.IsPosted),
            schedules.Count(s => !s.IsPosted)
        );
    }

    public async Task<decimal> CalculateDepreciationAmountAsync(Guid assetId, DateTime periodEndDate)
    {
        var asset = await _context.Assets.FindAsync(assetId)
            ?? throw new InvalidOperationException("Asset not found.");

        return CalculateDepreciationAmount(asset, periodEndDate);
    }

    private decimal CalculateDepreciationAmount(Asset asset, DateTime periodEndDate)
    {
        decimal amount;

        switch (asset.DepreciationMethod)
        {
            case DepreciationMethod.StraightLine:
                // (Cost - Salvage) / Useful Life Months
                amount = (asset.AcquisitionCost - asset.SalvageValue) / asset.UsefulLifeMonths;
                break;

            case DepreciationMethod.DecliningBalance:
                // Book Value * (1 / Useful Life Years)
                var rateYearly = 1.0m / (asset.UsefulLifeMonths / 12.0m);
                amount = asset.CurrentValue * rateYearly / 12;
                break;

            case DepreciationMethod.DoubleDecliningBalance:
                // Book Value * (2 / Useful Life Years)
                var doubleRate = 2.0m / (asset.UsefulLifeMonths / 12.0m);
                amount = asset.CurrentValue * doubleRate / 12;
                break;

            case DepreciationMethod.SumOfYearsDigits:
                // (Cost - Salvage) * (Remaining Years / Sum of Years)
                var yearsTotal = asset.UsefulLifeMonths / 12.0m;
                var sumOfYears = yearsTotal * (yearsTotal + 1) / 2;
                var remainingYears = (asset.UsefulLifeMonths - asset.DepreciatedMonths) / 12.0m;
                amount = (asset.AcquisitionCost - asset.SalvageValue) * remainingYears / sumOfYears / 12;
                break;

            case DepreciationMethod.UnitsOfProduction:
                // Not fully implemented - requires units produced tracking
                amount = asset.MonthlyDepreciation;
                break;

            default:
                amount = asset.MonthlyDepreciation;
                break;
        }

        return Math.Round(amount, 2);
    }

    public async Task<List<DepreciationForecastDto>> GetDepreciationForecastAsync(Guid assetId, int months = 12)
    {
        var asset = await _context.Assets.FindAsync(assetId)
            ?? throw new InvalidOperationException("Asset not found.");

        var forecast = new List<DepreciationForecastDto>();
        var currentDate = DateTime.UtcNow;
        var openingValue = asset.CurrentValue;
        var accumulatedDepreciation = asset.AccumulatedDepreciation;

        for (int i = 1; i <= months; i++)
        {
            var periodDate = currentDate.AddMonths(i);

            // Check if already have a schedule for this period
            var existingSchedule = await _context.DepreciationSchedules
                .FirstOrDefaultAsync(s => s.AssetId == assetId &&
                    s.ScheduleDate.Year == periodDate.Year &&
                    s.ScheduleDate.Month == periodDate.Month);

            if (existingSchedule != null)
            {
                forecast.Add(new DepreciationForecastDto(
                    i,
                    existingSchedule.ScheduleDate,
                    existingSchedule.OpeningValue,
                    existingSchedule.DepreciationAmount,
                    existingSchedule.ClosingValue,
                    existingSchedule.AccumulatedDepreciation,
                    false
                ));
                openingValue = existingSchedule.ClosingValue;
                accumulatedDepreciation = existingSchedule.AccumulatedDepreciation;
            }
            else
            {
                var depreciationAmount = CalculateDepreciationAmount(asset, periodDate);

                // Don't depreciate below salvage value
                if (openingValue - depreciationAmount < asset.SalvageValue)
                {
                    depreciationAmount = openingValue - asset.SalvageValue;
                }

                if (depreciationAmount <= 0) break;

                accumulatedDepreciation += depreciationAmount;
                var closingValue = asset.AcquisitionCost - accumulatedDepreciation;

                forecast.Add(new DepreciationForecastDto(
                    i,
                    new DateTime(periodDate.Year, periodDate.Month, DateTime.DaysInMonth(periodDate.Year, periodDate.Month)),
                    openingValue,
                    depreciationAmount,
                    closingValue,
                    accumulatedDepreciation,
                    true
                ));

                openingValue = closingValue;
            }
        }

        return forecast;
    }

    public async Task DeleteUnpostedSchedulesAsync(Guid assetId)
    {
        var unpostedSchedules = await _context.DepreciationSchedules
            .Where(s => s.AssetId == assetId && !s.IsPosted)
            .ToListAsync();

        _context.DepreciationSchedules.RemoveRange(unpostedSchedules);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted {Count} unposted depreciation schedules for asset {AssetId}",
            unpostedSchedules.Count, assetId);
    }

    private async Task<Domain.Entities.GL.FiscalPeriod?> GetOrCreateFiscalPeriodAsync(DateTime date)
    {
        // Find existing fiscal period containing this date
        var period = await _context.FiscalPeriods
            .FirstOrDefaultAsync(p => p.StartDate <= date && p.EndDate >= date);

        return period;
    }

    private static DepreciationScheduleDto MapToDto(DepreciationSchedule schedule)
    {
        return new DepreciationScheduleDto(
            schedule.Id,
            schedule.AssetId,
            schedule.Asset?.AssetCode ?? "",
            schedule.Asset?.AssetName ?? "",
            schedule.FiscalPeriodId,
            schedule.FiscalPeriod?.Name ?? "",
            schedule.ScheduleNumber,
            schedule.ScheduleDate,
            schedule.OpeningValue,
            schedule.DepreciationAmount,
            schedule.DepreciationAmountBase,
            schedule.ClosingValue,
            schedule.AccumulatedDepreciation,
            schedule.IsPosted,
            schedule.JournalVoucherId,
            schedule.JournalVoucher?.VoucherNumber,
            schedule.PostedAt,
            schedule.PostedBy,
            schedule.Notes,
            schedule.CreatedAt
        );
    }
}
