using Carmen.Domain.Entities.Common;

namespace Carmen.Domain.Entities.GL;

/// <summary>
/// Period status enumeration
/// </summary>
public enum PeriodStatus
{
    Open = 1,
    Closed = 2,
    Locked = 3
}

/// <summary>
/// Represents a fiscal year
/// </summary>
public class FiscalYear : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsClosed { get; set; }
    public DateTime? ClosedAt { get; set; }
    public string? ClosedBy { get; set; }

    // Navigation properties
    public virtual ICollection<FiscalPeriod> Periods { get; set; } = new List<FiscalPeriod>();
}

/// <summary>
/// Represents a fiscal period (month)
/// </summary>
public class FiscalPeriod : TenantEntity
{
    public Guid FiscalYearId { get; set; }
    public int PeriodNumber { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public PeriodStatus Status { get; set; } = PeriodStatus.Open;
    public DateTime? ClosedAt { get; set; }
    public string? ClosedBy { get; set; }

    // Navigation properties
    public virtual FiscalYear FiscalYear { get; set; } = null!;
}
