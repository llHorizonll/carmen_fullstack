using Carmen.Domain.Entities.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Carmen.Infrastructure.Data.Configurations;

public class TaxProfileConfiguration : IEntityTypeConfiguration<TaxProfile>
{
    public void Configure(EntityTypeBuilder<TaxProfile> builder)
    {
        builder.ToTable("TaxProfiles");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.TaxCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.TaxName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.TaxNameLocal)
            .HasMaxLength(200);

        builder.Property(e => e.Description)
            .HasMaxLength(500);

        builder.Property(e => e.TaxRate)
            .HasPrecision(8, 4);

        builder.HasIndex(e => new { e.TenantId, e.TaxCode })
            .IsUnique();

        builder.HasIndex(e => new { e.TenantId, e.IsActive });

        builder.HasOne(e => e.TaxPayableAccount)
            .WithMany()
            .HasForeignKey(e => e.TaxPayableAccountId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.TaxReceivableAccount)
            .WithMany()
            .HasForeignKey(e => e.TaxReceivableAccountId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
