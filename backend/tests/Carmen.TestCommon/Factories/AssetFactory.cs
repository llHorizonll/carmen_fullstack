using Carmen.Domain.Entities.Asset;
using Carmen.TestCommon.Constants;

namespace Carmen.TestCommon.Factories;

/// <summary>
/// Builder for creating Asset and AssetCategory test entities
/// </summary>
public class AssetFactory
{
    private static int _counter = 1;

    private readonly Asset _asset;
    private readonly Guid _categoryId;

    public AssetFactory(Guid? categoryId = null)
    {
        _categoryId = categoryId ?? Guid.NewGuid();
        _asset = new Asset
        {
            Id = Guid.NewGuid(),
            TenantId = TestConstants.DefaultTenantId,
            AssetCode = $"AST-{_counter++:D4}",
            AssetName = "Test Asset",
            AssetCategoryId = _categoryId,
            AcquisitionDate = new DateTime(2025, 1, 1),
            AcquisitionCost = 120000m,
            CurrencyCode = "USD",
            ExchangeRate = 1m,
            AcquisitionCostBase = 120000m,
            DepreciationMethod = DepreciationMethod.StraightLine,
            UsefulLifeMonths = 60,
            SalvageValue = 0m,
            DepreciationStartDate = new DateTime(2025, 1, 1),
            MonthlyDepreciation = 2000m,
            Status = AssetStatus.Active,
            AccumulatedDepreciation = 0m,
            CurrentValue = 120000m,
            DepreciatedMonths = 0,
            IsFullyDepreciated = false,
            AssetAccountId = TestConstants.FixedAssetAccountId,
            AccumDepreciationAccountId = TestConstants.AccumDepreciationAccountId,
            DepreciationExpenseAccountId = TestConstants.DepreciationExpenseAccountId,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "test",
        };
    }

    public AssetFactory WithId(Guid id) { _asset.Id = id; return this; }
    public AssetFactory WithTenant(Guid tenantId) { _asset.TenantId = tenantId; return this; }
    public AssetFactory WithName(string name) { _asset.AssetName = name; return this; }
    public AssetFactory WithCost(decimal cost) { _asset.AcquisitionCost = cost; _asset.AcquisitionCostBase = cost; _asset.CurrentValue = cost; return this; }
    public AssetFactory WithSalvage(decimal salvage) { _asset.SalvageValue = salvage; return this; }
    public AssetFactory WithUsefulLife(int months) { _asset.UsefulLifeMonths = months; return this; }
    public AssetFactory WithMethod(DepreciationMethod method) { _asset.DepreciationMethod = method; return this; }
    public AssetFactory WithDepreciationStart(DateTime date) { _asset.DepreciationStartDate = date; return this; }

    public AssetFactory WithAccumulatedDepreciation(decimal amount, int months)
    {
        _asset.AccumulatedDepreciation = amount;
        _asset.DepreciatedMonths = months;
        _asset.CurrentValue = _asset.AcquisitionCost - amount;
        return this;
    }

    public AssetFactory AsFullyDepreciated()
    {
        _asset.AccumulatedDepreciation = _asset.AcquisitionCost - _asset.SalvageValue;
        _asset.CurrentValue = _asset.SalvageValue;
        _asset.DepreciatedMonths = _asset.UsefulLifeMonths;
        _asset.IsFullyDepreciated = true;
        return this;
    }

    public AssetFactory AsDisposed()
    {
        _asset.Status = AssetStatus.Disposed;
        _asset.DisposedAt = DateTime.UtcNow;
        return this;
    }

    public (AssetCategory Category, Asset Asset) Build()
    {
        // Recalculate monthly depreciation for straight line
        if (_asset.DepreciationMethod == DepreciationMethod.StraightLine && _asset.UsefulLifeMonths > 0)
        {
            _asset.MonthlyDepreciation = (_asset.AcquisitionCost - _asset.SalvageValue) / _asset.UsefulLifeMonths;
        }

        var category = CreateCategory(_categoryId, _asset.TenantId);
        return (category, _asset);
    }

    public static AssetCategory CreateCategory(Guid? id = null, Guid? tenantId = null)
    {
        return new AssetCategory
        {
            Id = id ?? Guid.NewGuid(),
            TenantId = tenantId ?? TestConstants.DefaultTenantId,
            CategoryCode = "FF&E",
            CategoryName = "Furniture, Fixtures & Equipment",
            IsActive = true,
            DefaultUsefulLifeMonths = 60,
            DefaultDepreciationMethod = DepreciationMethod.StraightLine,
            DefaultSalvagePercent = 0,
            DefaultAssetAccountId = TestConstants.FixedAssetAccountId,
            DefaultAccumDepreciationAccountId = TestConstants.AccumDepreciationAccountId,
            DefaultDepreciationExpenseAccountId = TestConstants.DepreciationExpenseAccountId,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "test",
        };
    }

    /// <summary>
    /// Creates a standard active asset: $120,000 cost, 60 months, straight-line, no salvage
    /// </summary>
    public static (AssetCategory Category, Asset Asset) StandardAsset()
    {
        return new AssetFactory().Build();
    }

    /// <summary>
    /// Creates an asset with salvage value
    /// </summary>
    public static (AssetCategory Category, Asset Asset) WithSalvageValue(decimal cost = 120000m, decimal salvage = 12000m)
    {
        return new AssetFactory()
            .WithCost(cost)
            .WithSalvage(salvage)
            .Build();
    }
}
