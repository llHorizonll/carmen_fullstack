using Carmen.Application.DTOs.Asset;
using Carmen.Domain.Entities.Asset;
using Carmen.Domain.Entities.GL;
using Carmen.Infrastructure.Services;
using Carmen.TestCommon.Constants;
using Carmen.TestCommon.Factories;
using Carmen.TestCommon.Fixtures;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using NSubstitute;
using Xunit;

namespace Carmen.Infrastructure.Tests.Services;

public class DepreciationServiceTests : IDisposable
{
    private readonly Carmen.Infrastructure.Data.CarmenDbContext _context;
    private readonly MockCurrentUserService _currentUserService;
    private readonly ILogger<DepreciationService> _logger;
    private readonly DepreciationService _service;

    public DepreciationServiceTests()
    {
        _context = TestDbContextFactory.Create();
        _currentUserService = new MockCurrentUserService();
        _logger = Substitute.For<ILogger<DepreciationService>>();
        _service = new DepreciationService(_context, _currentUserService, _logger);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    #region Helpers

    private async Task<(AssetCategory Category, Asset Asset)> SeedAsset(
        decimal cost = 120000m,
        decimal salvage = 0m,
        int usefulLifeMonths = 60,
        DepreciationMethod method = DepreciationMethod.StraightLine,
        decimal accumulatedDepreciation = 0m,
        int depreciatedMonths = 0)
    {
        var factory = new AssetFactory()
            .WithCost(cost)
            .WithSalvage(salvage)
            .WithUsefulLife(usefulLifeMonths)
            .WithMethod(method);

        if (accumulatedDepreciation > 0)
        {
            factory.WithAccumulatedDepreciation(accumulatedDepreciation, depreciatedMonths);
        }

        var (category, asset) = factory.Build();
        _context.AssetCategories.Add(category);
        _context.Assets.Add(asset);

        // Seed fiscal periods for schedule generation
        var fiscalYear = FiscalPeriodFactory.CreateYear(2025, TestConstants.DefaultTenantId);
        _context.FiscalYears.Add(fiscalYear.Year);
        _context.FiscalPeriods.AddRange(fiscalYear.Periods);
        await _context.SaveChangesAsync();

        return (category, asset);
    }

    private FiscalPeriod GetFirstFiscalPeriod()
    {
        return _context.FiscalPeriods.OrderBy(p => p.StartDate).First();
    }

    private async Task<DepreciationSchedule> SeedPostedSchedule(Asset asset, FiscalPeriod period, decimal amount)
    {
        var schedule = new DepreciationSchedule
        {
            Id = Guid.NewGuid(),
            TenantId = TestConstants.DefaultTenantId,
            AssetId = asset.Id,
            FiscalPeriodId = period.Id,
            ScheduleNumber = 1,
            ScheduleDate = period.EndDate,
            OpeningValue = asset.CurrentValue,
            DepreciationAmount = amount,
            DepreciationAmountBase = amount,
            ClosingValue = asset.CurrentValue - amount,
            AccumulatedDepreciation = asset.AccumulatedDepreciation + amount,
            IsPosted = true,
            PostedAt = DateTime.UtcNow,
            PostedBy = "test@carmen.dev",
            CreatedBy = "test",
        };
        _context.DepreciationSchedules.Add(schedule);
        await _context.SaveChangesAsync();
        return schedule;
    }

    private async Task<DepreciationSchedule> SeedUnpostedSchedule(Asset asset, FiscalPeriod period, decimal amount)
    {
        var schedule = new DepreciationSchedule
        {
            Id = Guid.NewGuid(),
            TenantId = TestConstants.DefaultTenantId,
            AssetId = asset.Id,
            FiscalPeriodId = period.Id,
            ScheduleNumber = 1,
            ScheduleDate = period.EndDate,
            OpeningValue = asset.CurrentValue,
            DepreciationAmount = amount,
            DepreciationAmountBase = amount,
            ClosingValue = asset.CurrentValue - amount,
            AccumulatedDepreciation = asset.AccumulatedDepreciation + amount,
            IsPosted = false,
            CreatedBy = "test",
        };
        _context.DepreciationSchedules.Add(schedule);
        await _context.SaveChangesAsync();
        return schedule;
    }

    #endregion

    // ─── Calculation Tests ─────────────────────────────────────

    [Fact]
    public async Task CalculateDepreciation_StraightLine_ReturnsCorrectAmount()
    {
        // (120,000 - 0) / 60 = 2,000
        var (_, asset) = await SeedAsset(cost: 120000m, salvage: 0m, usefulLifeMonths: 60);

        var amount = await _service.CalculateDepreciationAmountAsync(asset.Id, DateTime.UtcNow);

        amount.Should().Be(2000m);
    }

    [Fact]
    public async Task CalculateDepreciation_StraightLine_WithSalvageValue()
    {
        // (120,000 - 12,000) / 60 = 1,800
        var (_, asset) = await SeedAsset(cost: 120000m, salvage: 12000m, usefulLifeMonths: 60);

        var amount = await _service.CalculateDepreciationAmountAsync(asset.Id, DateTime.UtcNow);

        amount.Should().Be(1800m);
    }

    [Fact]
    public async Task CalculateDepreciation_DecliningBalance_ReturnsCorrectAmount()
    {
        // CurrentValue * (1 / (60/12)) / 12 = 120,000 * 0.2 / 12 = 2,000
        var (_, asset) = await SeedAsset(
            cost: 120000m, salvage: 0m, usefulLifeMonths: 60,
            method: DepreciationMethod.DecliningBalance);

        var amount = await _service.CalculateDepreciationAmountAsync(asset.Id, DateTime.UtcNow);

        amount.Should().Be(2000m);
    }

    [Fact]
    public async Task CalculateDepreciation_DoubleDecliningBalance_ReturnsCorrectAmount()
    {
        // CurrentValue * (2 / (60/12)) / 12 = 120,000 * 0.4 / 12 = 4,000
        var (_, asset) = await SeedAsset(
            cost: 120000m, salvage: 0m, usefulLifeMonths: 60,
            method: DepreciationMethod.DoubleDecliningBalance);

        var amount = await _service.CalculateDepreciationAmountAsync(asset.Id, DateTime.UtcNow);

        amount.Should().Be(4000m);
    }

    [Fact]
    public async Task CalculateDepreciation_SumOfYearsDigits_ReturnsCorrectAmount()
    {
        // yearsTotal = 60/12 = 5, sumOfYears = 5*6/2 = 15
        // remainingYears = (60 - 0) / 12 = 5
        // (120,000 - 0) * 5 / 15 / 12 = 120,000 * 0.3333 / 12 = 3,333.33
        var (_, asset) = await SeedAsset(
            cost: 120000m, salvage: 0m, usefulLifeMonths: 60,
            method: DepreciationMethod.SumOfYearsDigits);

        var amount = await _service.CalculateDepreciationAmountAsync(asset.Id, DateTime.UtcNow);

        amount.Should().Be(3333.33m);
    }

    [Fact]
    public async Task CalculateDepreciation_AssetNotFound_Throws()
    {
        // Seed data just so DB is valid
        await SeedAsset();

        var act = () => _service.CalculateDepreciationAmountAsync(Guid.NewGuid(), DateTime.UtcNow);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Asset not found.");
    }

    // ─── Schedule Generation Tests ──────────────────────────────

    [Fact]
    public async Task GenerateSchedule_CreatesCorrectNumberOfEntries()
    {
        var (_, asset) = await SeedAsset(cost: 120000m, salvage: 0m, usefulLifeMonths: 60);

        var schedules = await _service.GenerateScheduleAsync(asset.Id);

        // Should create 60 months (limited by fiscal periods available — 12 for year 2025)
        schedules.Should().HaveCountLessOrEqualTo(60);
        schedules.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GenerateSchedule_RemovesExistingUnpostedSchedules()
    {
        var (_, asset) = await SeedAsset();
        var period = GetFirstFiscalPeriod();

        // Seed an unposted schedule
        await SeedUnpostedSchedule(asset, period, 2000m);
        _context.DepreciationSchedules.Count(s => s.AssetId == asset.Id).Should().Be(1);

        // Generate should remove the unposted one and create new ones
        var schedules = await _service.GenerateScheduleAsync(asset.Id);

        // All schedules should be freshly created (unposted)
        schedules.Should().AllSatisfy(s => s.IsPosted.Should().BeFalse());
    }

    [Fact]
    public async Task GenerateSchedule_PreservesPostedSchedules()
    {
        var (_, asset) = await SeedAsset();
        var period = GetFirstFiscalPeriod();

        // Seed a posted schedule
        var postedSchedule = await SeedPostedSchedule(asset, period, 2000m);

        var schedules = await _service.GenerateScheduleAsync(asset.Id);

        // The posted schedule should still exist
        var postedInDb = _context.DepreciationSchedules.FirstOrDefault(s => s.Id == postedSchedule.Id);
        postedInDb.Should().NotBeNull();
        postedInDb!.IsPosted.Should().BeTrue();
    }

    [Fact]
    public async Task GenerateSchedule_StraightLine_DecreasingOpeningValues()
    {
        var (_, asset) = await SeedAsset(cost: 120000m, salvage: 0m, usefulLifeMonths: 60);

        var schedules = await _service.GenerateScheduleAsync(asset.Id);

        // Each schedule's closing value should be the next one's opening value
        for (int i = 0; i < schedules.Count - 1; i++)
        {
            schedules[i].ClosingValue.Should().Be(schedules[i + 1].OpeningValue);
        }
    }

    [Fact]
    public async Task GenerateSchedule_WithSalvageValue_StopsAtSalvageFloor()
    {
        var (_, asset) = await SeedAsset(cost: 120000m, salvage: 12000m, usefulLifeMonths: 60);

        var schedules = await _service.GenerateScheduleAsync(asset.Id);

        // Final schedule's closing value should not go below salvage
        var lastSchedule = schedules.Last();
        lastSchedule.ClosingValue.Should().BeGreaterOrEqualTo(12000m);
    }

    [Fact]
    public async Task GenerateSchedule_AssetNotFound_Throws()
    {
        await SeedAsset(); // ensure DB has some data

        var act = () => _service.GenerateScheduleAsync(Guid.NewGuid());

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Asset not found.");
    }

    [Fact]
    public async Task GenerateSchedule_SetsExchangeRateOnBase()
    {
        var factory = new AssetFactory()
            .WithCost(120000m)
            .WithSalvage(0m)
            .WithUsefulLife(60);
        var (category, asset) = factory.Build();

        // Set exchange rate
        asset.ExchangeRate = 35m; // e.g., THB to USD
        asset.AcquisitionCostBase = 120000m * 35m;

        _context.AssetCategories.Add(category);
        _context.Assets.Add(asset);
        var fy = FiscalPeriodFactory.CreateYear(2025, TestConstants.DefaultTenantId);
        _context.FiscalYears.Add(fy.Year);
        _context.FiscalPeriods.AddRange(fy.Periods);
        await _context.SaveChangesAsync();

        var schedules = await _service.GenerateScheduleAsync(asset.Id);

        schedules.Should().NotBeEmpty();
        // DepreciationAmountBase = DepreciationAmount * ExchangeRate
        var first = schedules.First();
        first.DepreciationAmountBase.Should().Be(first.DepreciationAmount * 35m);
    }

    // ─── Post Depreciation Tests ────────────────────────────────

    [Fact]
    public async Task PostDepreciation_UpdatesAssetValues()
    {
        var (_, asset) = await SeedAsset(cost: 120000m, salvage: 0m, usefulLifeMonths: 60);
        var period = GetFirstFiscalPeriod();
        var schedule = await SeedUnpostedSchedule(asset, period, 2000m);

        var result = await _service.PostDepreciationAsync(schedule.Id);

        result.IsPosted.Should().BeTrue();

        // Reload asset
        var updatedAsset = await _context.Assets.FindAsync(asset.Id);
        updatedAsset!.AccumulatedDepreciation.Should().Be(2000m);
        updatedAsset.CurrentValue.Should().Be(118000m);
        updatedAsset.DepreciatedMonths.Should().Be(1);
        updatedAsset.IsFullyDepreciated.Should().BeFalse();
    }

    [Fact]
    public async Task PostDepreciation_LastMonth_SetsFullyDepreciated()
    {
        // Asset with only 1 month remaining
        var (_, asset) = await SeedAsset(
            cost: 120000m, salvage: 0m, usefulLifeMonths: 60,
            accumulatedDepreciation: 118000m, depreciatedMonths: 59);
        var period = GetFirstFiscalPeriod();
        var schedule = await SeedUnpostedSchedule(asset, period, 2000m);

        var result = await _service.PostDepreciationAsync(schedule.Id);

        var updatedAsset = await _context.Assets.FindAsync(asset.Id);
        updatedAsset!.AccumulatedDepreciation.Should().Be(120000m);
        updatedAsset.CurrentValue.Should().Be(0m);
        updatedAsset.IsFullyDepreciated.Should().BeTrue();
    }

    [Fact]
    public async Task PostDepreciation_AlreadyPosted_Throws()
    {
        var (_, asset) = await SeedAsset();
        var period = GetFirstFiscalPeriod();
        var schedule = await SeedPostedSchedule(asset, period, 2000m);

        var act = () => _service.PostDepreciationAsync(schedule.Id);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Depreciation is already posted.");
    }

    [Fact]
    public async Task PostDepreciation_NotFound_Throws()
    {
        await SeedAsset();

        var act = () => _service.PostDepreciationAsync(Guid.NewGuid());

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Depreciation schedule not found.");
    }

    // ─── Reverse Depreciation Tests ─────────────────────────────

    [Fact]
    public async Task ReverseDepreciation_DecrementsAssetValues()
    {
        var (_, asset) = await SeedAsset(
            cost: 120000m, salvage: 0m, usefulLifeMonths: 60,
            accumulatedDepreciation: 2000m, depreciatedMonths: 1);
        var period = GetFirstFiscalPeriod();
        var schedule = await SeedPostedSchedule(asset, period, 2000m);

        var result = await _service.ReverseDepreciationAsync(schedule.Id);

        result.IsPosted.Should().BeFalse();

        var updatedAsset = await _context.Assets.FindAsync(asset.Id);
        updatedAsset!.AccumulatedDepreciation.Should().Be(0m);
        updatedAsset.CurrentValue.Should().Be(120000m);
        updatedAsset.DepreciatedMonths.Should().Be(0);
        updatedAsset.IsFullyDepreciated.Should().BeFalse();
    }

    [Fact]
    public async Task ReverseDepreciation_UnpostedSchedule_Throws()
    {
        var (_, asset) = await SeedAsset();
        var period = GetFirstFiscalPeriod();
        var schedule = await SeedUnpostedSchedule(asset, period, 2000m);

        var act = () => _service.ReverseDepreciationAsync(schedule.Id);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Cannot reverse unposted depreciation.");
    }

    // ─── Monthly Run Tests ──────────────────────────────────────

    [Fact]
    public async Task RunMonthlyDepreciation_CreatesSchedulesForActiveAssets()
    {
        var (cat1, asset1) = await SeedAsset(cost: 120000m, salvage: 0m, usefulLifeMonths: 60);

        // Add a second active asset
        var factory2 = new AssetFactory(cat1.Id)
            .WithCost(60000m)
            .WithSalvage(0m)
            .WithUsefulLife(60);
        var (_, asset2) = factory2.Build();
        asset2.AssetCategoryId = cat1.Id;
        _context.Assets.Add(asset2);
        await _context.SaveChangesAsync();

        var period = GetFirstFiscalPeriod();
        var request = new RunDepreciationRequest(period.Id, AutoPost: false);

        var schedules = await _service.RunMonthlyDepreciationAsync(request);

        schedules.Should().HaveCount(2);
    }

    [Fact]
    public async Task RunMonthlyDepreciation_SkipsFullyDepreciatedAssets()
    {
        var factory = new AssetFactory()
            .WithCost(120000m)
            .WithSalvage(0m)
            .WithUsefulLife(60)
            .AsFullyDepreciated();
        var (category, asset) = factory.Build();
        _context.AssetCategories.Add(category);
        _context.Assets.Add(asset);
        var fy = FiscalPeriodFactory.CreateYear(2025, TestConstants.DefaultTenantId);
        _context.FiscalYears.Add(fy.Year);
        _context.FiscalPeriods.AddRange(fy.Periods);
        await _context.SaveChangesAsync();

        var period = GetFirstFiscalPeriod();
        var request = new RunDepreciationRequest(period.Id, AutoPost: false);

        var schedules = await _service.RunMonthlyDepreciationAsync(request);

        schedules.Should().BeEmpty();
    }

    [Fact]
    public async Task RunMonthlyDepreciation_SkipsDisposedAssets()
    {
        var factory = new AssetFactory()
            .WithCost(120000m)
            .WithSalvage(0m)
            .WithUsefulLife(60)
            .AsDisposed();
        var (category, asset) = factory.Build();
        _context.AssetCategories.Add(category);
        _context.Assets.Add(asset);
        var fy = FiscalPeriodFactory.CreateYear(2025, TestConstants.DefaultTenantId);
        _context.FiscalYears.Add(fy.Year);
        _context.FiscalPeriods.AddRange(fy.Periods);
        await _context.SaveChangesAsync();

        var period = GetFirstFiscalPeriod();
        var request = new RunDepreciationRequest(period.Id, AutoPost: false);

        var schedules = await _service.RunMonthlyDepreciationAsync(request);

        schedules.Should().BeEmpty();
    }

    [Fact]
    public async Task RunMonthlyDepreciation_SkipsDuplicateForSamePeriod()
    {
        var (_, asset) = await SeedAsset();
        var period = GetFirstFiscalPeriod();

        // Pre-create a schedule for this period
        await SeedUnpostedSchedule(asset, period, 2000m);

        var request = new RunDepreciationRequest(period.Id, AutoPost: false);
        var schedules = await _service.RunMonthlyDepreciationAsync(request);

        schedules.Should().BeEmpty();
    }

    // ─── PostAll / DeleteUnposted Tests ─────────────────────────

    [Fact]
    public async Task PostAllDepreciation_PostsAllUnpostedForPeriod()
    {
        var (_, asset) = await SeedAsset();
        var period = GetFirstFiscalPeriod();
        await SeedUnpostedSchedule(asset, period, 2000m);

        var count = await _service.PostAllDepreciationAsync(period.Id);

        count.Should().Be(1);
    }

    [Fact]
    public async Task DeleteUnpostedSchedules_RemovesOnlyUnposted()
    {
        var (_, asset) = await SeedAsset();
        var periods = _context.FiscalPeriods.OrderBy(p => p.StartDate).Take(2).ToList();
        await SeedPostedSchedule(asset, periods[0], 2000m);
        await SeedUnpostedSchedule(asset, periods[1], 2000m);

        _context.DepreciationSchedules.Count(s => s.AssetId == asset.Id).Should().Be(2);

        await _service.DeleteUnpostedSchedulesAsync(asset.Id);

        _context.DepreciationSchedules.Count(s => s.AssetId == asset.Id).Should().Be(1);
        _context.DepreciationSchedules.Single(s => s.AssetId == asset.Id).IsPosted.Should().BeTrue();
    }

    // ─── Summary Tests ──────────────────────────────────────────

    [Fact]
    public async Task GetDepreciationSummary_ReturnsCorrectMetrics()
    {
        var (_, asset) = await SeedAsset();
        var period = GetFirstFiscalPeriod();
        await SeedPostedSchedule(asset, period, 2000m);
        await SeedUnpostedSchedule(asset, period, 1500m);

        var summary = await _service.GetDepreciationSummaryAsync(period.Id);

        summary.FiscalPeriodId.Should().Be(period.Id);
        summary.TotalDepreciationAmount.Should().Be(3500m);
        summary.PostedCount.Should().Be(1);
        summary.UnpostedCount.Should().Be(1);
    }
}
