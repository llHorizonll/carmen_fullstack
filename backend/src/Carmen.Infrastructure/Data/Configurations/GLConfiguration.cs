using Carmen.Domain.Entities.GL;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Carmen.Infrastructure.Data.Configurations;

public class ChartOfAccountConfiguration : IEntityTypeConfiguration<ChartOfAccount>
{
    public void Configure(EntityTypeBuilder<ChartOfAccount> builder)
    {
        builder.ToTable("ChartOfAccounts");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.AccountCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.AccountName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.AccountNameLocal)
            .HasMaxLength(200);

        builder.Property(e => e.Description)
            .HasMaxLength(500);

        builder.Property(e => e.CurrencyCode)
            .IsRequired()
            .HasMaxLength(3);

        builder.HasIndex(e => new { e.TenantId, e.AccountCode })
            .IsUnique();

        builder.HasOne(e => e.ParentAccount)
            .WithMany(e => e.ChildAccounts)
            .HasForeignKey(e => e.ParentAccountId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class JournalVoucherConfiguration : IEntityTypeConfiguration<JournalVoucher>
{
    public void Configure(EntityTypeBuilder<JournalVoucher> builder)
    {
        builder.ToTable("JournalVouchers");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.VoucherNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.Description)
            .HasMaxLength(500);

        builder.Property(e => e.Reference)
            .HasMaxLength(200);

        builder.Property(e => e.CurrencyCode)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(e => e.ExchangeRate)
            .HasPrecision(18, 6);

        builder.Property(e => e.TotalDebit)
            .HasPrecision(18, 2);

        builder.Property(e => e.TotalCredit)
            .HasPrecision(18, 2);

        builder.Property(e => e.ApprovedBy)
            .HasMaxLength(200);

        builder.Property(e => e.PostedBy)
            .HasMaxLength(200);

        builder.HasIndex(e => new { e.TenantId, e.VoucherNumber })
            .IsUnique();

        builder.HasIndex(e => new { e.TenantId, e.VoucherDate });
        builder.HasIndex(e => new { e.TenantId, e.Status });
    }
}

public class JournalVoucherLineConfiguration : IEntityTypeConfiguration<JournalVoucherLine>
{
    public void Configure(EntityTypeBuilder<JournalVoucherLine> builder)
    {
        builder.ToTable("JournalVoucherLines");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.DebitAmount)
            .HasPrecision(18, 2);

        builder.Property(e => e.CreditAmount)
            .HasPrecision(18, 2);

        builder.Property(e => e.DebitAmountBase)
            .HasPrecision(18, 2);

        builder.Property(e => e.CreditAmountBase)
            .HasPrecision(18, 2);

        builder.Property(e => e.Description)
            .HasMaxLength(500);

        builder.Property(e => e.Reference)
            .HasMaxLength(200);

        builder.HasOne(e => e.JournalVoucher)
            .WithMany(jv => jv.Lines)
            .HasForeignKey(e => e.JournalVoucherId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Account)
            .WithMany(a => a.JournalVoucherLines)
            .HasForeignKey(e => e.AccountId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => new { e.JournalVoucherId, e.LineNumber });
    }
}

public class RecurringVoucherConfiguration : IEntityTypeConfiguration<RecurringVoucher>
{
    public void Configure(EntityTypeBuilder<RecurringVoucher> builder)
    {
        builder.ToTable("RecurringVouchers");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Description)
            .HasMaxLength(500);

        builder.Property(e => e.CurrencyCode)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(e => e.ExchangeRate)
            .HasPrecision(18, 6);

        builder.Property(e => e.TotalDebit)
            .HasPrecision(18, 2);

        builder.Property(e => e.TotalCredit)
            .HasPrecision(18, 2);

        builder.Property(e => e.Reference)
            .HasMaxLength(200);

        builder.HasIndex(e => new { e.TenantId, e.IsActive, e.NextExecutionDate });
        builder.HasIndex(e => new { e.TenantId, e.Name });
    }
}

public class RecurringVoucherLineConfiguration : IEntityTypeConfiguration<RecurringVoucherLine>
{
    public void Configure(EntityTypeBuilder<RecurringVoucherLine> builder)
    {
        builder.ToTable("RecurringVoucherLines");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.DebitAmount)
            .HasPrecision(18, 2);

        builder.Property(e => e.CreditAmount)
            .HasPrecision(18, 2);

        builder.Property(e => e.Description)
            .HasMaxLength(500);

        builder.Property(e => e.Reference)
            .HasMaxLength(200);

        builder.HasOne(e => e.RecurringVoucher)
            .WithMany(rv => rv.Lines)
            .HasForeignKey(e => e.RecurringVoucherId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Account)
            .WithMany()
            .HasForeignKey(e => e.AccountId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(e => new { e.RecurringVoucherId, e.LineNumber });
    }
}

public class FiscalYearConfiguration : IEntityTypeConfiguration<FiscalYear>
{
    public void Configure(EntityTypeBuilder<FiscalYear> builder)
    {
        builder.ToTable("FiscalYears");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.ClosedBy)
            .HasMaxLength(200);

        builder.HasIndex(e => new { e.TenantId, e.StartDate });
    }
}

public class FiscalPeriodConfiguration : IEntityTypeConfiguration<FiscalPeriod>
{
    public void Configure(EntityTypeBuilder<FiscalPeriod> builder)
    {
        builder.ToTable("FiscalPeriods");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.ClosedBy)
            .HasMaxLength(200);

        builder.HasOne(e => e.FiscalYear)
            .WithMany(fy => fy.Periods)
            .HasForeignKey(e => e.FiscalYearId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(e => new { e.TenantId, e.FiscalYearId, e.PeriodNumber })
            .IsUnique();
    }
}

