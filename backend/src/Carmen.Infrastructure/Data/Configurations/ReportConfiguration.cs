using Carmen.Domain.Entities.Report;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Carmen.Infrastructure.Data.Configurations;

public class ReportTemplateConfiguration : IEntityTypeConfiguration<ReportTemplate>
{
    public void Configure(EntityTypeBuilder<ReportTemplate> builder)
    {
        builder.ToTable("ReportTemplates");
        builder.HasKey(r => r.Id);

        builder.Property(r => r.Name).IsRequired().HasMaxLength(200);
        builder.Property(r => r.Description).HasMaxLength(1000);
        builder.Property(r => r.CreatedBy).HasMaxLength(200);
        builder.Property(r => r.UpdatedBy).HasMaxLength(200);

        builder.HasIndex(r => new { r.TenantId, r.Name })
            .HasDatabaseName("IX_ReportTemplates_TenantId_Name");

        builder.HasMany(r => r.Columns)
            .WithOne(c => c.ReportTemplate)
            .HasForeignKey(c => c.ReportTemplateId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(r => r.Filters)
            .WithOne(f => f.ReportTemplate)
            .HasForeignKey(f => f.ReportTemplateId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(r => r.Groups)
            .WithOne(g => g.ReportTemplate)
            .HasForeignKey(g => g.ReportTemplateId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(r => r.ScheduledReports)
            .WithOne(s => s.ReportTemplate)
            .HasForeignKey(s => s.ReportTemplateId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ReportTemplateColumnConfiguration : IEntityTypeConfiguration<ReportTemplateColumn>
{
    public void Configure(EntityTypeBuilder<ReportTemplateColumn> builder)
    {
        builder.ToTable("ReportTemplateColumns");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.FieldName).IsRequired().HasMaxLength(100);
        builder.Property(c => c.DisplayName).IsRequired().HasMaxLength(200);
        builder.Property(c => c.CreatedBy).HasMaxLength(200);
        builder.Property(c => c.UpdatedBy).HasMaxLength(200);

        builder.HasIndex(c => new { c.ReportTemplateId, c.Order })
            .HasDatabaseName("IX_ReportTemplateColumns_TemplateId_Order");
    }
}

public class ReportTemplateFilterConfiguration : IEntityTypeConfiguration<ReportTemplateFilter>
{
    public void Configure(EntityTypeBuilder<ReportTemplateFilter> builder)
    {
        builder.ToTable("ReportTemplateFilters");
        builder.HasKey(f => f.Id);

        builder.Property(f => f.FieldName).IsRequired().HasMaxLength(100);
        builder.Property(f => f.Value).HasMaxLength(500);
        builder.Property(f => f.Value2).HasMaxLength(500);
        builder.Property(f => f.CreatedBy).HasMaxLength(200);
        builder.Property(f => f.UpdatedBy).HasMaxLength(200);
    }
}

public class ReportTemplateGroupConfiguration : IEntityTypeConfiguration<ReportTemplateGroup>
{
    public void Configure(EntityTypeBuilder<ReportTemplateGroup> builder)
    {
        builder.ToTable("ReportTemplateGroups");
        builder.HasKey(g => g.Id);

        builder.Property(g => g.FieldName).IsRequired().HasMaxLength(100);
        builder.Property(g => g.CreatedBy).HasMaxLength(200);
        builder.Property(g => g.UpdatedBy).HasMaxLength(200);

        builder.HasIndex(g => new { g.ReportTemplateId, g.Order })
            .HasDatabaseName("IX_ReportTemplateGroups_TemplateId_Order");
    }
}

public class ScheduledReportConfiguration : IEntityTypeConfiguration<ScheduledReport>
{
    public void Configure(EntityTypeBuilder<ScheduledReport> builder)
    {
        builder.ToTable("ScheduledReports");
        builder.HasKey(s => s.Id);

        builder.Property(s => s.CronExpression).HasMaxLength(100);
        builder.Property(s => s.Recipients).IsRequired().HasMaxLength(2000);
        builder.Property(s => s.CreatedBy).HasMaxLength(200);
        builder.Property(s => s.UpdatedBy).HasMaxLength(200);

        builder.HasIndex(s => new { s.TenantId, s.IsActive })
            .HasDatabaseName("IX_ScheduledReports_TenantId_IsActive");
    }
}
