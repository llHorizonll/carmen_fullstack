using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.Notification;
using Carmen.Application.DTOs.Workflow;
using Carmen.Application.Services.Notification;
using Carmen.Application.Services.Workflow;
using Carmen.Domain.Entities.Workflow;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Services;

public class WorkflowService : IWorkflowService
{
    private readonly CarmenDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly ILogger<WorkflowService> _logger;

    public WorkflowService(
        CarmenDbContext context,
        INotificationService notificationService,
        ILogger<WorkflowService> logger)
    {
        _context = context;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<WorkflowInstanceDto?> SubmitForApprovalAsync(
        Guid tenantId, WorkflowEntityType entityType, Guid entityId,
        string entityNumber, decimal amount, Guid submittedByUserId)
    {
        // Find applicable workflow definition
        var definition = await FindApplicableDefinitionAsync(entityType, amount);
        if (definition == null)
            return null; // No workflow configured - use inline approval

        var firstStep = definition.Steps.OrderBy(s => s.StepOrder).First();

        var instance = new WorkflowInstance
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            DefinitionId = definition.Id,
            EntityType = entityType,
            EntityId = entityId,
            EntityNumber = entityNumber,
            CurrentStepOrder = firstStep.StepOrder,
            Status = WorkflowStatus.InProgress,
            SubmittedByUserId = submittedByUserId,
            SubmittedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system",
        };

        _context.WorkflowInstances.Add(instance);
        await _context.SaveChangesAsync();

        // Notify the approver of the first step
        await NotifyApproverAsync(tenantId, instance, firstStep);

        _logger.LogInformation("Created workflow instance {InstanceId} for {EntityType} {EntityNumber}",
            instance.Id, entityType, entityNumber);

        return await GetInstanceAsync(tenantId, instance.Id);
    }

    public async Task<WorkflowInstanceDto> ApproveAsync(
        Guid tenantId, Guid instanceId, Guid userId, string? comment = null)
    {
        var instance = await GetInstanceWithDetailsAsync(instanceId);
        if (instance == null)
            throw new InvalidOperationException("Workflow instance not found.");

        if (instance.Status != WorkflowStatus.InProgress)
            throw new InvalidOperationException("Workflow is not in progress.");

        // Record history
        var currentStep = instance.Definition.Steps
            .FirstOrDefault(s => s.StepOrder == instance.CurrentStepOrder);

        _context.WorkflowHistories.Add(new WorkflowHistory
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            InstanceId = instanceId,
            StepOrder = instance.CurrentStepOrder,
            StepName = currentStep?.StepName ?? $"Step {instance.CurrentStepOrder}",
            ActionByUserId = userId,
            Action = WorkflowStepAction.Approved,
            Comment = comment,
            ActionAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system",
        });

        // Check if there's a next step
        var nextStep = instance.Definition.Steps
            .Where(s => s.StepOrder > instance.CurrentStepOrder)
            .OrderBy(s => s.StepOrder)
            .FirstOrDefault();

        if (nextStep != null)
        {
            // Advance to next step
            instance.CurrentStepOrder = nextStep.StepOrder;
            await _context.SaveChangesAsync();

            await NotifyApproverAsync(tenantId, instance, nextStep);
        }
        else
        {
            // All steps complete - approve the workflow
            instance.Status = WorkflowStatus.Approved;
            instance.CompletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Notify the submitter
            await _notificationService.CreateAsync(tenantId, new CreateNotificationRequest
            {
                UserId = instance.SubmittedByUserId,
                Type = Domain.Entities.Notification.NotificationType.Approval,
                Priority = Domain.Entities.Notification.NotificationPriority.Normal,
                Title = $"{instance.EntityType} {instance.EntityNumber} Approved",
                Message = $"Your {instance.EntityType} {instance.EntityNumber} has been fully approved.",
                ActionUrl = GetEntityUrl(instance.EntityType, instance.EntityId),
                EntityType = instance.EntityType.ToString(),
                EntityId = instance.EntityId,
            });
        }

        _logger.LogInformation("Step {StepOrder} approved for workflow {InstanceId} by user {UserId}",
            currentStep?.StepOrder, instanceId, userId);

        return (await GetInstanceAsync(tenantId, instanceId))!;
    }

    public async Task<WorkflowInstanceDto> RejectAsync(
        Guid tenantId, Guid instanceId, Guid userId, string? comment = null)
    {
        var instance = await GetInstanceWithDetailsAsync(instanceId);
        if (instance == null)
            throw new InvalidOperationException("Workflow instance not found.");

        if (instance.Status != WorkflowStatus.InProgress)
            throw new InvalidOperationException("Workflow is not in progress.");

        var currentStep = instance.Definition.Steps
            .FirstOrDefault(s => s.StepOrder == instance.CurrentStepOrder);

        _context.WorkflowHistories.Add(new WorkflowHistory
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            InstanceId = instanceId,
            StepOrder = instance.CurrentStepOrder,
            StepName = currentStep?.StepName ?? $"Step {instance.CurrentStepOrder}",
            ActionByUserId = userId,
            Action = WorkflowStepAction.Rejected,
            Comment = comment,
            ActionAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system",
        });

        instance.Status = WorkflowStatus.Rejected;
        instance.CompletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Notify the submitter
        await _notificationService.CreateAsync(tenantId, new CreateNotificationRequest
        {
            UserId = instance.SubmittedByUserId,
            Type = Domain.Entities.Notification.NotificationType.Approval,
            Priority = Domain.Entities.Notification.NotificationPriority.High,
            Title = $"{instance.EntityType} {instance.EntityNumber} Rejected",
            Message = $"Your {instance.EntityType} {instance.EntityNumber} was rejected. {comment ?? ""}".Trim(),
            ActionUrl = GetEntityUrl(instance.EntityType, instance.EntityId),
            EntityType = instance.EntityType.ToString(),
            EntityId = instance.EntityId,
        });

        _logger.LogInformation("Workflow {InstanceId} rejected by user {UserId}", instanceId, userId);

        return (await GetInstanceAsync(tenantId, instanceId))!;
    }

    public async Task<WorkflowInstanceDto> DelegateAsync(
        Guid tenantId, Guid instanceId, Guid userId, Guid delegateToUserId, string? comment = null)
    {
        var instance = await GetInstanceWithDetailsAsync(instanceId);
        if (instance == null)
            throw new InvalidOperationException("Workflow instance not found.");

        if (instance.Status != WorkflowStatus.InProgress)
            throw new InvalidOperationException("Workflow is not in progress.");

        var currentStep = instance.Definition.Steps
            .FirstOrDefault(s => s.StepOrder == instance.CurrentStepOrder);

        if (currentStep != null && !currentStep.AllowDelegation)
            throw new InvalidOperationException("Delegation is not allowed for this step.");

        _context.WorkflowHistories.Add(new WorkflowHistory
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            InstanceId = instanceId,
            StepOrder = instance.CurrentStepOrder,
            StepName = currentStep?.StepName ?? $"Step {instance.CurrentStepOrder}",
            ActionByUserId = userId,
            Action = WorkflowStepAction.Delegated,
            Comment = comment ?? $"Delegated to user {delegateToUserId}",
            ActionAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system",
        });

        await _context.SaveChangesAsync();

        // Notify the delegate
        await _notificationService.CreateAsync(tenantId, new CreateNotificationRequest
        {
            UserId = delegateToUserId,
            Type = Domain.Entities.Notification.NotificationType.Approval,
            Priority = Domain.Entities.Notification.NotificationPriority.High,
            Title = $"Approval Delegated: {instance.EntityType} {instance.EntityNumber}",
            Message = $"An approval for {instance.EntityType} {instance.EntityNumber} has been delegated to you.",
            ActionUrl = GetEntityUrl(instance.EntityType, instance.EntityId),
            EntityType = instance.EntityType.ToString(),
            EntityId = instance.EntityId,
        });

        return (await GetInstanceAsync(tenantId, instanceId))!;
    }

    public async Task<PaginatedResult<PendingApprovalDto>> GetPendingApprovalsAsync(
        Guid tenantId, Guid userId, int page = 1, int pageSize = 20)
    {
        // Get roles for the user
        var userRoleIds = await _context.UserRoles
            .Where(ur => ur.UserId == userId)
            .Select(ur => ur.RoleId)
            .ToListAsync();

        var query = _context.WorkflowInstances
            .Include(i => i.Definition)
            .ThenInclude(d => d.Steps)
            .Where(i => i.TenantId == tenantId && i.Status == WorkflowStatus.InProgress)
            .Where(i => i.Definition.Steps.Any(s =>
                s.StepOrder == i.CurrentStepOrder &&
                (s.ApproverUserId == userId || (s.ApproverRoleId != null && userRoleIds.Contains(s.ApproverRoleId.Value)))));

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(i => i.SubmittedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(i => new PendingApprovalDto
            {
                InstanceId = i.Id,
                EntityType = i.EntityType,
                EntityId = i.EntityId,
                EntityNumber = i.EntityNumber,
                DefinitionName = i.Definition.Name,
                CurrentStepOrder = i.CurrentStepOrder,
                CurrentStepName = i.Definition.Steps
                    .Where(s => s.StepOrder == i.CurrentStepOrder)
                    .Select(s => s.StepName)
                    .FirstOrDefault() ?? "",
                SubmittedAt = i.SubmittedAt,
            })
            .ToListAsync();

        return new PaginatedResult<PendingApprovalDto>(
            items, totalCount, page, pageSize,
            (int)Math.Ceiling(totalCount / (double)pageSize));
    }

    public async Task<WorkflowInstanceDto?> GetInstanceAsync(Guid tenantId, Guid instanceId)
    {
        var instance = await _context.WorkflowInstances
            .Include(i => i.Definition)
            .ThenInclude(d => d.Steps)
            .Include(i => i.History.OrderBy(h => h.ActionAt))
            .FirstOrDefaultAsync(i => i.TenantId == tenantId && i.Id == instanceId);

        if (instance == null) return null;

        return new WorkflowInstanceDto
        {
            Id = instance.Id,
            DefinitionId = instance.DefinitionId,
            DefinitionName = instance.Definition.Name,
            EntityType = instance.EntityType,
            EntityId = instance.EntityId,
            EntityNumber = instance.EntityNumber,
            CurrentStepOrder = instance.CurrentStepOrder,
            CurrentStepName = instance.Definition.Steps
                .FirstOrDefault(s => s.StepOrder == instance.CurrentStepOrder)?.StepName,
            Status = instance.Status,
            SubmittedByUserId = instance.SubmittedByUserId,
            SubmittedAt = instance.SubmittedAt,
            CompletedAt = instance.CompletedAt,
            History = instance.History.Select(h => new WorkflowHistoryDto
            {
                Id = h.Id,
                StepOrder = h.StepOrder,
                StepName = h.StepName,
                ActionByUserId = h.ActionByUserId,
                Action = h.Action,
                Comment = h.Comment,
                ActionAt = h.ActionAt,
            }).ToList(),
        };
    }

    public async Task<List<WorkflowHistoryDto>> GetHistoryForEntityAsync(
        Guid tenantId, WorkflowEntityType entityType, Guid entityId)
    {
        return await _context.WorkflowHistories
            .Include(h => h.Instance)
            .Where(h => h.Instance.TenantId == tenantId
                && h.Instance.EntityType == entityType
                && h.Instance.EntityId == entityId)
            .OrderBy(h => h.ActionAt)
            .Select(h => new WorkflowHistoryDto
            {
                Id = h.Id,
                StepOrder = h.StepOrder,
                StepName = h.StepName,
                ActionByUserId = h.ActionByUserId,
                Action = h.Action,
                Comment = h.Comment,
                ActionAt = h.ActionAt,
            })
            .ToListAsync();
    }

    public async Task<PaginatedResult<ApprovalHistoryDto>> GetApprovalHistoryAsync(
        Guid tenantId, Guid userId, int page = 1, int pageSize = 20)
    {
        var query = _context.WorkflowHistories
            .Include(h => h.Instance)
                .ThenInclude(i => i.Definition)
            .Where(h => h.Instance.TenantId == tenantId &&
                        h.ActionByUserId == userId);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(h => h.ActionAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(h => new ApprovalHistoryDto
            {
                InstanceId = h.InstanceId,
                EntityType = h.Instance.EntityType,
                EntityId = h.Instance.EntityId,
                EntityNumber = h.Instance.EntityNumber,
                DefinitionName = h.Instance.Definition.Name,
                StepOrder = h.StepOrder,
                StepName = h.StepName,
                Action = h.Action,
                ActionByUserName = _context.Users
                    .Where(u => u.Id == h.ActionByUserId)
                    .Select(u => u.FirstName + " " + u.LastName)
                    .FirstOrDefault(),
                ActionAt = h.ActionAt,
                Comment = h.Comment,
            })
            .ToListAsync();

        return new PaginatedResult<ApprovalHistoryDto>(
            items, totalCount, page, pageSize,
            (int)Math.Ceiling(totalCount / (double)pageSize));
    }

    private async Task<WorkflowDefinition?> FindApplicableDefinitionAsync(
        WorkflowEntityType entityType, decimal amount)
    {
        // Find definitions for this entity type, ordered by specificity (threshold first, then default)
        var definitions = await _context.WorkflowDefinitions
            .Include(d => d.Steps)
            .Where(d => d.EntityType == entityType && d.IsActive)
            .OrderByDescending(d => d.AmountThreshold)
            .ToListAsync();

        // Find first definition where amount meets threshold
        foreach (var def in definitions)
        {
            if (def.AmountThreshold.HasValue && amount >= def.AmountThreshold.Value)
                return def;
        }

        // Fall back to default definition
        return definitions.FirstOrDefault(d => d.IsDefault);
    }

    private async Task<WorkflowInstance?> GetInstanceWithDetailsAsync(Guid instanceId)
    {
        return await _context.WorkflowInstances
            .Include(i => i.Definition)
            .ThenInclude(d => d.Steps)
            .FirstOrDefaultAsync(i => i.Id == instanceId);
    }

    private async Task NotifyApproverAsync(
        Guid tenantId, WorkflowInstance instance, WorkflowStep step)
    {
        if (step.ApproverUserId.HasValue)
        {
            await _notificationService.CreateAsync(tenantId, new CreateNotificationRequest
            {
                UserId = step.ApproverUserId.Value,
                Type = Domain.Entities.Notification.NotificationType.Approval,
                Priority = Domain.Entities.Notification.NotificationPriority.High,
                Title = $"Approval Required: {instance.EntityType} {instance.EntityNumber}",
                Message = $"Step '{step.StepName}' requires your approval for {instance.EntityType} {instance.EntityNumber}.",
                ActionUrl = GetEntityUrl(instance.EntityType, instance.EntityId),
                EntityType = instance.EntityType.ToString(),
                EntityId = instance.EntityId,
            });
        }
        else if (step.ApproverRoleId.HasValue)
        {
            // Notify all users in the role
            var userIds = await _context.UserRoles
                .Where(ur => ur.RoleId == step.ApproverRoleId.Value)
                .Select(ur => ur.UserId)
                .ToListAsync();

            foreach (var userId in userIds)
            {
                await _notificationService.CreateAsync(tenantId, new CreateNotificationRequest
                {
                    UserId = userId,
                    Type = Domain.Entities.Notification.NotificationType.Approval,
                    Priority = Domain.Entities.Notification.NotificationPriority.High,
                    Title = $"Approval Required: {instance.EntityType} {instance.EntityNumber}",
                    Message = $"Step '{step.StepName}' requires your approval for {instance.EntityType} {instance.EntityNumber}.",
                    ActionUrl = GetEntityUrl(instance.EntityType, instance.EntityId),
                    EntityType = instance.EntityType.ToString(),
                    EntityId = instance.EntityId,
                });
            }
        }
    }

    private static string GetEntityUrl(WorkflowEntityType entityType, Guid entityId)
    {
        return entityType switch
        {
            WorkflowEntityType.JournalVoucher => $"/gl/journal-vouchers/{entityId}",
            WorkflowEntityType.ApInvoice => $"/ap/invoices/{entityId}",
            WorkflowEntityType.ArInvoice => $"/ar/invoices/{entityId}",
            WorkflowEntityType.ApPayment => $"/ap/payments/{entityId}",
            WorkflowEntityType.ArReceipt => $"/ar/receipts/{entityId}",
            _ => "/dashboard",
        };
    }
}
