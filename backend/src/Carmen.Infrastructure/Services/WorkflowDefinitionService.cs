using Carmen.Application.DTOs.Workflow;
using Carmen.Application.Services.Workflow;
using Carmen.Domain.Entities.Workflow;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Services;

public class WorkflowDefinitionService : IWorkflowDefinitionService
{
    private readonly CarmenDbContext _context;
    private readonly ILogger<WorkflowDefinitionService> _logger;

    public WorkflowDefinitionService(CarmenDbContext context, ILogger<WorkflowDefinitionService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<WorkflowDefinitionListDto>> GetDefinitionsAsync()
    {
        return await _context.WorkflowDefinitions
            .Include(d => d.Steps)
            .OrderBy(d => d.EntityType)
            .ThenBy(d => d.Name)
            .Select(d => new WorkflowDefinitionListDto
            {
                Id = d.Id,
                Name = d.Name,
                EntityType = d.EntityType,
                AmountThreshold = d.AmountThreshold,
                IsDefault = d.IsDefault,
                IsActive = d.IsActive,
                StepCount = d.Steps.Count,
                CreatedAt = d.CreatedAt,
            })
            .ToListAsync();
    }

    public async Task<WorkflowDefinitionDto?> GetDefinitionByIdAsync(Guid id)
    {
        var definition = await _context.WorkflowDefinitions
            .Include(d => d.Steps.OrderBy(s => s.StepOrder))
            .FirstOrDefaultAsync(d => d.Id == id);

        if (definition == null) return null;

        return MapToDto(definition);
    }

    public async Task<WorkflowDefinitionDto> CreateDefinitionAsync(CreateWorkflowDefinitionRequest request)
    {
        if (request.Steps.Count == 0)
            throw new InvalidOperationException("Workflow definition must have at least one step.");

        var definition = new WorkflowDefinition
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            EntityType = request.EntityType,
            AmountThreshold = request.AmountThreshold,
            IsDefault = request.IsDefault,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system",
        };

        _context.WorkflowDefinitions.Add(definition);

        foreach (var stepReq in request.Steps.OrderBy(s => s.StepOrder))
        {
            _context.WorkflowSteps.Add(new WorkflowStep
            {
                Id = Guid.NewGuid(),
                DefinitionId = definition.Id,
                StepOrder = stepReq.StepOrder,
                StepName = stepReq.StepName,
                ApproverUserId = stepReq.ApproverUserId,
                ApproverRoleId = stepReq.ApproverRoleId,
                AllowDelegation = stepReq.AllowDelegation,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "system",
            });
        }

        // If this is set as default, unset other defaults for same entity type
        if (request.IsDefault)
        {
            var existingDefaults = await _context.WorkflowDefinitions
                .Where(d => d.EntityType == request.EntityType && d.IsDefault && d.Id != definition.Id)
                .ToListAsync();

            foreach (var d in existingDefaults)
                d.IsDefault = false;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Created workflow definition {Name} for {EntityType}", definition.Name, definition.EntityType);

        return (await GetDefinitionByIdAsync(definition.Id))!;
    }

    public async Task<WorkflowDefinitionDto> UpdateDefinitionAsync(Guid id, UpdateWorkflowDefinitionRequest request)
    {
        var definition = await _context.WorkflowDefinitions
            .Include(d => d.Steps)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (definition == null)
            throw new InvalidOperationException("Workflow definition not found.");

        definition.Name = request.Name;
        definition.Description = request.Description;
        definition.AmountThreshold = request.AmountThreshold;
        definition.IsDefault = request.IsDefault;
        definition.IsActive = request.IsActive;
        definition.UpdatedAt = DateTime.UtcNow;

        // Remove old steps and add new ones
        _context.WorkflowSteps.RemoveRange(definition.Steps);

        foreach (var stepReq in request.Steps.OrderBy(s => s.StepOrder))
        {
            _context.WorkflowSteps.Add(new WorkflowStep
            {
                Id = Guid.NewGuid(),
                DefinitionId = definition.Id,
                StepOrder = stepReq.StepOrder,
                StepName = stepReq.StepName,
                ApproverUserId = stepReq.ApproverUserId,
                ApproverRoleId = stepReq.ApproverRoleId,
                AllowDelegation = stepReq.AllowDelegation,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "system",
            });
        }

        // If this is set as default, unset other defaults
        if (request.IsDefault)
        {
            var existingDefaults = await _context.WorkflowDefinitions
                .Where(d => d.EntityType == definition.EntityType && d.IsDefault && d.Id != definition.Id)
                .ToListAsync();

            foreach (var d in existingDefaults)
                d.IsDefault = false;
        }

        await _context.SaveChangesAsync();

        return (await GetDefinitionByIdAsync(definition.Id))!;
    }

    public async Task DeleteDefinitionAsync(Guid id)
    {
        var definition = await _context.WorkflowDefinitions
            .Include(d => d.Steps)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (definition == null)
            throw new InvalidOperationException("Workflow definition not found.");

        // Check for active instances
        var hasActiveInstances = await _context.WorkflowInstances
            .AnyAsync(i => i.DefinitionId == id && i.Status == WorkflowStatus.InProgress);

        if (hasActiveInstances)
            throw new InvalidOperationException("Cannot delete workflow definition with active instances.");

        _context.WorkflowSteps.RemoveRange(definition.Steps);
        _context.WorkflowDefinitions.Remove(definition);
        await _context.SaveChangesAsync();
    }

    private static WorkflowDefinitionDto MapToDto(WorkflowDefinition d)
    {
        return new WorkflowDefinitionDto
        {
            Id = d.Id,
            Name = d.Name,
            Description = d.Description,
            EntityType = d.EntityType,
            AmountThreshold = d.AmountThreshold,
            IsDefault = d.IsDefault,
            IsActive = d.IsActive,
            Steps = d.Steps.OrderBy(s => s.StepOrder).Select(s => new WorkflowStepDto
            {
                Id = s.Id,
                StepOrder = s.StepOrder,
                StepName = s.StepName,
                ApproverUserId = s.ApproverUserId,
                ApproverRoleId = s.ApproverRoleId,
                AllowDelegation = s.AllowDelegation,
            }).ToList(),
            CreatedAt = d.CreatedAt,
        };
    }
}
