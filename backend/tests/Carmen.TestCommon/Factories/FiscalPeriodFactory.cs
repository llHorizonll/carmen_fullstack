using Carmen.Domain.Entities.GL;
using Carmen.TestCommon.Constants;

namespace Carmen.TestCommon.Factories;

/// <summary>
/// Builder for creating FiscalYear and FiscalPeriod test entities
/// </summary>
public class FiscalPeriodFactory
{
    /// <summary>
    /// Creates a fiscal year with 12 open monthly periods for the specified year
    /// </summary>
    public static (FiscalYear Year, List<FiscalPeriod> Periods) CreateYear(
        int year = 2025,
        Guid? tenantId = null,
        Guid? yearId = null)
    {
        tenantId ??= TestConstants.DefaultTenantId;
        yearId ??= TestConstants.DefaultFiscalYearId;

        var fiscalYear = new FiscalYear
        {
            Id = yearId.Value,
            TenantId = tenantId.Value,
            Name = $"FY {year}",
            StartDate = new DateTime(year, 1, 1),
            EndDate = new DateTime(year, 12, 31),
            IsClosed = false,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "test",
        };

        var periods = new List<FiscalPeriod>();
        for (int month = 1; month <= 12; month++)
        {
            var periodId = month == 1
                ? TestConstants.DefaultFiscalPeriodId
                : Guid.NewGuid();

            periods.Add(new FiscalPeriod
            {
                Id = periodId,
                TenantId = tenantId.Value,
                FiscalYearId = yearId.Value,
                PeriodNumber = month,
                Name = $"{year}-{month:D2}",
                StartDate = new DateTime(year, month, 1),
                EndDate = new DateTime(year, month, DateTime.DaysInMonth(year, month)),
                Status = PeriodStatus.Open,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "test",
            });
        }

        return (fiscalYear, periods);
    }

    /// <summary>
    /// Creates a single open fiscal period
    /// </summary>
    public static FiscalPeriod OpenPeriod(Guid? id = null, Guid? tenantId = null, Guid? yearId = null)
    {
        return new FiscalPeriod
        {
            Id = id ?? TestConstants.DefaultFiscalPeriodId,
            TenantId = tenantId ?? TestConstants.DefaultTenantId,
            FiscalYearId = yearId ?? TestConstants.DefaultFiscalYearId,
            PeriodNumber = 1,
            Name = "2025-01",
            StartDate = new DateTime(2025, 1, 1),
            EndDate = new DateTime(2025, 1, 31),
            Status = PeriodStatus.Open,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "test",
        };
    }

    /// <summary>
    /// Creates a closed fiscal period
    /// </summary>
    public static FiscalPeriod ClosedPeriod(Guid? id = null, Guid? tenantId = null)
    {
        var period = OpenPeriod(id, tenantId);
        period.Status = PeriodStatus.Closed;
        period.ClosedAt = DateTime.UtcNow;
        period.ClosedBy = "test";
        return period;
    }
}
