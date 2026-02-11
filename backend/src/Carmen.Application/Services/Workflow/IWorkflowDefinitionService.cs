using Carmen.Application.DTOs.Workflow;

namespace Carmen.Application.Services.Workflow;

public interface IWorkflowDefinitionService
{
    Task<List<WorkflowDefinitionListDto>> GetDefinitionsAsync();
    Task<WorkflowDefinitionDto?> GetDefinitionByIdAsync(Guid id);
    Task<WorkflowDefinitionDto> CreateDefinitionAsync(CreateWorkflowDefinitionRequest request);
    Task<WorkflowDefinitionDto> UpdateDefinitionAsync(Guid id, UpdateWorkflowDefinitionRequest request);
    Task DeleteDefinitionAsync(Guid id);
}
