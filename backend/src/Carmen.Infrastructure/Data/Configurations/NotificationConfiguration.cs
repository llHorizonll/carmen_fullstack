using Carmen.Domain.Entities.Notification;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Carmen.Infrastructure.Data.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");

        builder.HasKey(n => n.Id);

        builder.Property(n => n.Title)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(n => n.Message)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(n => n.ActionUrl)
            .HasMaxLength(500);

        builder.Property(n => n.EntityType)
            .HasMaxLength(100);

        builder.Property(n => n.Data)
            .HasMaxLength(4000);

        builder.Property(n => n.CreatedBy)
            .HasMaxLength(200);

        builder.Property(n => n.UpdatedBy)
            .HasMaxLength(200);

        // Index for fast user notification queries
        builder.HasIndex(n => new { n.TenantId, n.UserId, n.IsRead })
            .HasDatabaseName("IX_Notifications_TenantId_UserId_IsRead");

        builder.HasIndex(n => new { n.TenantId, n.UserId, n.CreatedAt })
            .HasDatabaseName("IX_Notifications_TenantId_UserId_CreatedAt");
    }
}

public class NotificationPreferenceConfiguration : IEntityTypeConfiguration<NotificationPreference>
{
    public void Configure(EntityTypeBuilder<NotificationPreference> builder)
    {
        builder.ToTable("NotificationPreferences");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.CreatedBy)
            .HasMaxLength(200);

        builder.Property(p => p.UpdatedBy)
            .HasMaxLength(200);

        builder.HasIndex(p => new { p.UserId, p.Type })
            .IsUnique()
            .HasDatabaseName("IX_NotificationPreferences_UserId_Type");
    }
}

public class EmailLogConfiguration : IEntityTypeConfiguration<EmailLog>
{
    public void Configure(EntityTypeBuilder<EmailLog> builder)
    {
        builder.ToTable("EmailLogs");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.ToEmail)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(e => e.Subject)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(e => e.Body)
            .IsRequired();

        builder.Property(e => e.TemplateName)
            .HasMaxLength(200);

        builder.Property(e => e.ErrorMessage)
            .HasMaxLength(2000);

        builder.Property(e => e.CreatedBy)
            .HasMaxLength(200);

        builder.Property(e => e.UpdatedBy)
            .HasMaxLength(200);

        builder.HasIndex(e => new { e.TenantId, e.Status })
            .HasDatabaseName("IX_EmailLogs_TenantId_Status");

        builder.HasIndex(e => e.CreatedAt)
            .HasDatabaseName("IX_EmailLogs_CreatedAt");
    }
}
