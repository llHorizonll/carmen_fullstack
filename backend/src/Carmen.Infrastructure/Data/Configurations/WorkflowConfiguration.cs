using Carmen.Domain.Entities.Workflow;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Carmen.Infrastructure.Data.Configurations;

public class WorkflowDefinitionConfiguration : IEntityTypeConfiguration<WorkflowDefinition>
{
    public void Configure(EntityTypeBuilder<WorkflowDefinition> builder)
    {
        builder.ToTable("WorkflowDefinitions");
        builder.HasKey(d => d.Id);

        builder.Property(d => d.Name).IsRequired().HasMaxLength(200);
        builder.Property(d => d.Description).HasMaxLength(500);
        builder.Property(d => d.AmountThreshold).HasPrecision(18, 2);
        builder.Property(d => d.CreatedBy).HasMaxLength(200);
        builder.Property(d => d.UpdatedBy).HasMaxLength(200);

        builder.HasMany(d => d.Steps)
            .WithOne(s => s.Definition)
            .HasForeignKey(s => s.DefinitionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(d => new { d.TenantId, d.EntityType, d.IsActive })
            .HasDatabaseName("IX_WorkflowDefinitions_TenantId_EntityType_IsActive");
    }
}

public class WorkflowStepConfiguration : IEntityTypeConfiguration<WorkflowStep>
{
    public void Configure(EntityTypeBuilder<WorkflowStep> builder)
    {
        builder.ToTable("WorkflowSteps");
        builder.HasKey(s => s.Id);

        builder.Property(s => s.StepName).IsRequired().HasMaxLength(200);
        builder.Property(s => s.CreatedBy).HasMaxLength(200);
        builder.Property(s => s.UpdatedBy).HasMaxLength(200);

        builder.HasIndex(s => new { s.DefinitionId, s.StepOrder })
            .HasDatabaseName("IX_WorkflowSteps_DefinitionId_StepOrder");
    }
}

public class WorkflowInstanceConfiguration : IEntityTypeConfiguration<WorkflowInstance>
{
    public void Configure(EntityTypeBuilder<WorkflowInstance> builder)
    {
        builder.ToTable("WorkflowInstances");
        builder.HasKey(i => i.Id);

        builder.Property(i => i.EntityNumber).IsRequired().HasMaxLength(100);
        builder.Property(i => i.CreatedBy).HasMaxLength(200);
        builder.Property(i => i.UpdatedBy).HasMaxLength(200);

        builder.HasOne(i => i.Definition)
            .WithMany()
            .HasForeignKey(i => i.DefinitionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(i => i.History)
            .WithOne(h => h.Instance)
            .HasForeignKey(h => h.InstanceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(i => new { i.TenantId, i.Status })
            .HasDatabaseName("IX_WorkflowInstances_TenantId_Status");

        builder.HasIndex(i => new { i.TenantId, i.EntityType, i.EntityId })
            .HasDatabaseName("IX_WorkflowInstances_TenantId_EntityType_EntityId");
    }
}

public class WorkflowHistoryConfiguration : IEntityTypeConfiguration<WorkflowHistory>
{
    public void Configure(EntityTypeBuilder<WorkflowHistory> builder)
    {
        builder.ToTable("WorkflowHistories");
        builder.HasKey(h => h.Id);

        builder.Property(h => h.StepName).IsRequired().HasMaxLength(200);
        builder.Property(h => h.Comment).HasMaxLength(1000);
        builder.Property(h => h.CreatedBy).HasMaxLength(200);
        builder.Property(h => h.UpdatedBy).HasMaxLength(200);

        builder.HasIndex(h => new { h.InstanceId, h.ActionAt })
            .HasDatabaseName("IX_WorkflowHistories_InstanceId_ActionAt");
    }
}
