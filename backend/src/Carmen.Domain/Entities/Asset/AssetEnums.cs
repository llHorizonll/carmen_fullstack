namespace Carmen.Domain.Entities.Asset;

/// <summary>
/// Asset status enumeration
/// </summary>
public enum AssetStatus
{
    /// <summary>Asset is active and in use</summary>
    Active = 0,
    /// <summary>Asset has been disposed/retired</summary>
    Disposed = 1,
    /// <summary>Asset has been transferred to another location/department</summary>
    Transferred = 2,
    /// <summary>Asset has been sold</summary>
    Sold = 3,
    /// <summary>Asset has been written off</summary>
    WrittenOff = 4
}

/// <summary>
/// Depreciation calculation method
/// </summary>
public enum DepreciationMethod
{
    /// <summary>Straight-line depreciation: (Cost - Salvage) / Useful Life</summary>
    StraightLine = 1,
    /// <summary>Declining balance: Book Value * Rate</summary>
    DecliningBalance = 2,
    /// <summary>Double declining balance: Book Value * (2 / Useful Life)</summary>
    DoubleDecliningBalance = 3,
    /// <summary>Sum of years' digits method</summary>
    SumOfYearsDigits = 4,
    /// <summary>Units of production method</summary>
    UnitsOfProduction = 5
}

/// <summary>
/// Asset physical condition
/// </summary>
public enum AssetCondition
{
    /// <summary>Brand new asset</summary>
    New = 1,
    /// <summary>Good condition</summary>
    Good = 2,
    /// <summary>Fair condition</summary>
    Fair = 3,
    /// <summary>Poor condition</summary>
    Poor = 4
}

/// <summary>
/// Asset disposal method
/// </summary>
public enum DisposalMethod
{
    /// <summary>Asset sold to external party</summary>
    Sale = 1,
    /// <summary>Asset written off (no value recovered)</summary>
    WriteOff = 2,
    /// <summary>Asset transferred to another entity</summary>
    Transfer = 3,
    /// <summary>Asset scrapped/discarded</summary>
    Scrap = 4,
    /// <summary>Asset donated</summary>
    Donation = 5
}
