using Carmen.Domain.Entities.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Carmen.Infrastructure.Data.Configurations;

public class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.ToTable("Tenants");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Description)
            .HasMaxLength(500);

        builder.Property(e => e.Address)
            .HasMaxLength(500);

        builder.Property(e => e.Phone)
            .HasMaxLength(50);

        builder.Property(e => e.Email)
            .HasMaxLength(200);

        builder.Property(e => e.TaxId)
            .HasMaxLength(50);

        builder.Property(e => e.BaseCurrency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(e => e.DefaultLanguage)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(e => e.TimeZone)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(e => e.Code)
            .IsUnique();
    }
}

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Email)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.PasswordHash)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(e => e.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Phone)
            .HasMaxLength(50);

        builder.Property(e => e.PreferredLanguage)
            .IsRequired()
            .HasMaxLength(10);

        builder.HasIndex(e => e.Email)
            .IsUnique();

        builder.HasOne(e => e.Tenant)
            .WithMany(t => t.Users)
            .HasForeignKey(e => e.TenantId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("Roles");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Description)
            .HasMaxLength(500);

        builder.HasIndex(e => e.Name)
            .IsUnique();
    }
}

public class PermissionConfiguration : IEntityTypeConfiguration<Permission>
{
    public void Configure(EntityTypeBuilder<Permission> builder)
    {
        builder.ToTable("Permissions");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Code)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Module)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.Description)
            .HasMaxLength(500);

        builder.HasIndex(e => e.Code)
            .IsUnique();
    }
}

public class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
{
    public void Configure(EntityTypeBuilder<UserRole> builder)
    {
        builder.ToTable("UserRoles");

        builder.HasKey(e => new { e.UserId, e.RoleId });

        builder.HasOne(e => e.User)
            .WithMany(u => u.UserRoles)
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Role)
            .WithMany(r => r.UserRoles)
            .HasForeignKey(e => e.RoleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class RolePermissionConfiguration : IEntityTypeConfiguration<RolePermission>
{
    public void Configure(EntityTypeBuilder<RolePermission> builder)
    {
        builder.ToTable("RolePermissions");

        builder.HasKey(e => new { e.RoleId, e.PermissionId });

        builder.HasOne(e => e.Role)
            .WithMany(r => r.RolePermissions)
            .HasForeignKey(e => e.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(e => e.Permission)
            .WithMany(p => p.RolePermissions)
            .HasForeignKey(e => e.PermissionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("RefreshTokens");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Token)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(e => e.ReplacedByToken)
            .HasMaxLength(500);

        builder.HasIndex(e => e.Token);

        builder.HasOne(e => e.User)
            .WithMany(u => u.RefreshTokens)
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class GroupTenantAccessConfiguration : IEntityTypeConfiguration<GroupTenantAccess>
{
    public void Configure(EntityTypeBuilder<GroupTenantAccess> builder)
    {
        builder.ToTable("GroupTenantAccess");

        // Composite primary key
        builder.HasKey(e => new { e.UserId, e.TenantId });

        // Foreign key to User
        builder.HasOne(e => e.User)
            .WithMany(u => u.AccessibleTenants)
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Foreign key to Tenant
        builder.HasOne(e => e.Tenant)
            .WithMany(t => t.GroupTenantAccesses)
            .HasForeignKey(e => e.TenantId)
            .OnDelete(DeleteBehavior.Cascade);

        // Index on AssignedAt for querying recent assignments
        builder.HasIndex(e => e.AssignedAt);
    }
}
