using Carmen.Domain.Entities.Asset;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Carmen.Infrastructure.Data.Configurations;

public class AssetCategoryConfiguration : IEntityTypeConfiguration<AssetCategory>
{
    public void Configure(EntityTypeBuilder<AssetCategory> builder)
    {
        builder.ToTable("AssetCategories");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.CategoryCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.CategoryName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.CategoryNameLocal)
            .HasMaxLength(200);

        builder.Property(e => e.Description)
            .HasMaxLength(500);

        builder.Property(e => e.DefaultSalvagePercent)
            .HasPrecision(5, 2);

        builder.Property(e => e.AssetCodePrefix)
            .HasMaxLength(20);

        builder.Property(e => e.Notes)
            .HasMaxLength(2000);

        builder.Property(e => e.CreatedBy)
            .HasMaxLength(200);

        builder.Property(e => e.UpdatedBy)
            .HasMaxLength(200);

        builder.HasIndex(e => new { e.TenantId, e.CategoryCode })
            .IsUnique();

        builder.HasIndex(e => new { e.TenantId, e.IsActive });

        builder.HasOne(e => e.DefaultAssetAccount)
            .WithMany()
            .HasForeignKey(e => e.DefaultAssetAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.DefaultAccumDepreciationAccount)
            .WithMany()
            .HasForeignKey(e => e.DefaultAccumDepreciationAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.DefaultDepreciationExpenseAccount)
            .WithMany()
            .HasForeignKey(e => e.DefaultDepreciationExpenseAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.DefaultGainLossAccount)
            .WithMany()
            .HasForeignKey(e => e.DefaultGainLossAccountId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class AssetConfiguration : IEntityTypeConfiguration<Asset>
{
    public void Configure(EntityTypeBuilder<Asset> builder)
    {
        builder.ToTable("Assets");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.AssetCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.AssetName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.AssetNameLocal)
            .HasMaxLength(200);

        builder.Property(e => e.Description)
            .HasMaxLength(500);

        builder.Property(e => e.SerialNumber)
            .HasMaxLength(100);

        builder.Property(e => e.Barcode)
            .HasMaxLength(100);

        builder.Property(e => e.LocationDescription)
            .HasMaxLength(200);

        builder.Property(e => e.AcquisitionCost)
            .HasPrecision(18, 2);

        builder.Property(e => e.CurrencyCode)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(e => e.ExchangeRate)
            .HasPrecision(18, 6);

        builder.Property(e => e.AcquisitionCostBase)
            .HasPrecision(18, 2);

        builder.Property(e => e.PurchaseReference)
            .HasMaxLength(100);

        builder.Property(e => e.SalvageValue)
            .HasPrecision(18, 2);

        builder.Property(e => e.MonthlyDepreciation)
            .HasPrecision(18, 2);

        builder.Property(e => e.AccumulatedDepreciation)
            .HasPrecision(18, 2);

        builder.Property(e => e.CurrentValue)
            .HasPrecision(18, 2);

        builder.Property(e => e.DisposalValue)
            .HasPrecision(18, 2);

        builder.Property(e => e.GainLossAmount)
            .HasPrecision(18, 2);

        builder.Property(e => e.Notes)
            .HasMaxLength(2000);

        builder.Property(e => e.CreatedBy)
            .HasMaxLength(200);

        builder.Property(e => e.UpdatedBy)
            .HasMaxLength(200);

        builder.HasIndex(e => new { e.TenantId, e.AssetCode })
            .IsUnique();

        builder.HasIndex(e => new { e.TenantId, e.AssetCategoryId });
        builder.HasIndex(e => new { e.TenantId, e.Status });
        builder.HasIndex(e => new { e.TenantId, e.DepartmentId });
        builder.HasIndex(e => new { e.TenantId, e.AcquisitionDate });

        builder.HasOne(e => e.AssetCategory)
            .WithMany(c => c.Assets)
            .HasForeignKey(e => e.AssetCategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Department)
            .WithMany()
            .HasForeignKey(e => e.DepartmentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.Vendor)
            .WithMany()
            .HasForeignKey(e => e.VendorId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.ApInvoice)
            .WithMany()
            .HasForeignKey(e => e.ApInvoiceId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.AssetAccount)
            .WithMany()
            .HasForeignKey(e => e.AssetAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.AccumDepreciationAccount)
            .WithMany()
            .HasForeignKey(e => e.AccumDepreciationAccountId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(e => e.DepreciationExpenseAccount)
            .WithMany()
            .HasForeignKey(e => e.DepreciationExpenseAccountId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class DepreciationScheduleConfiguration : IEntityTypeConfiguration<DepreciationSchedule>
{
    public void Configure(EntityTypeBuilder<DepreciationSchedule> builder)
    {
        builder.ToTable("DepreciationSchedules");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.OpeningValue)
            .HasPrecision(18, 2);

        builder.Property(e => e.DepreciationAmount)
            .HasPrecision(18, 2);

        builder.Property(e => e.DepreciationAmountBase)
            .HasPrecision(18, 2);

        builder.Property(e => e.ClosingValue)
            .HasPrecision(18, 2);

        builder.Property(e => e.AccumulatedDepreciation)
            .HasPrecision(18, 2);

        builder.Property(e => e.PostedBy)
            .HasMaxLength(200);

        builder.Property(e => e.Notes)
            .HasMaxLength(500);

        builder.Property(e => e.CreatedBy)
            .HasMaxLength(200);

        builder.Property(e => e.UpdatedBy)
            .HasMaxLength(200);

        builder.HasIndex(e => new { e.TenantId, e.AssetId, e.FiscalPeriodId })
            .IsUnique();

        builder.HasIndex(e => new { e.TenantId, e.FiscalPeriodId, e.IsPosted });
        builder.HasIndex(e => new { e.TenantId, e.ScheduleDate });

        builder.HasOne(e => e.Asset)
            .WithMany(a => a.DepreciationSchedules)
            .HasForeignKey(e => e.AssetId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.FiscalPeriod)
            .WithMany()
            .HasForeignKey(e => e.FiscalPeriodId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.JournalVoucher)
            .WithMany()
            .HasForeignKey(e => e.JournalVoucherId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class AssetDisposalConfiguration : IEntityTypeConfiguration<AssetDisposal>
{
    public void Configure(EntityTypeBuilder<AssetDisposal> builder)
    {
        builder.ToTable("AssetDisposals");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.DisposalValue)
            .HasPrecision(18, 2);

        builder.Property(e => e.DisposalCost)
            .HasPrecision(18, 2);

        builder.Property(e => e.NetProceeds)
            .HasPrecision(18, 2);

        builder.Property(e => e.BookValueAtDisposal)
            .HasPrecision(18, 2);

        builder.Property(e => e.AccumulatedDepreciationAtDisposal)
            .HasPrecision(18, 2);

        builder.Property(e => e.GainLossAmount)
            .HasPrecision(18, 2);

        builder.Property(e => e.BuyerName)
            .HasMaxLength(200);

        builder.Property(e => e.Reference)
            .HasMaxLength(100);

        builder.Property(e => e.Reason)
            .HasMaxLength(500);

        builder.Property(e => e.Notes)
            .HasMaxLength(2000);

        builder.Property(e => e.PostedBy)
            .HasMaxLength(200);

        builder.Property(e => e.ApprovedBy)
            .HasMaxLength(200);

        builder.Property(e => e.CreatedBy)
            .HasMaxLength(200);

        builder.Property(e => e.UpdatedBy)
            .HasMaxLength(200);

        builder.HasIndex(e => new { e.TenantId, e.AssetId })
            .IsUnique();

        builder.HasIndex(e => new { e.TenantId, e.DisposalDate });

        builder.HasOne(e => e.Asset)
            .WithOne(a => a.Disposal)
            .HasForeignKey<AssetDisposal>(e => e.AssetId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.JournalVoucher)
            .WithMany()
            .HasForeignKey(e => e.JournalVoucherId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
