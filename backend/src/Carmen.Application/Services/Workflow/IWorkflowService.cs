using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.Workflow;
using Carmen.Domain.Entities.Workflow;

namespace Carmen.Application.Services.Workflow;

public interface IWorkflowService
{
    Task<WorkflowInstanceDto?> SubmitForApprovalAsync(
        Guid tenantId, WorkflowEntityType entityType, Guid entityId,
        string entityNumber, decimal amount, Guid submittedByUserId);

    Task<WorkflowInstanceDto> ApproveAsync(Guid tenantId, Guid instanceId, Guid userId, string? comment = null);
    Task<WorkflowInstanceDto> RejectAsync(Guid tenantId, Guid instanceId, Guid userId, string? comment = null);
    Task<WorkflowInstanceDto> DelegateAsync(Guid tenantId, Guid instanceId, Guid userId, Guid delegateToUserId, string? comment = null);

    Task<PaginatedResult<PendingApprovalDto>> GetPendingApprovalsAsync(
        Guid tenantId, Guid userId, int page = 1, int pageSize = 20);

    Task<WorkflowInstanceDto?> GetInstanceAsync(Guid tenantId, Guid instanceId);
    Task<List<WorkflowHistoryDto>> GetHistoryForEntityAsync(Guid tenantId, WorkflowEntityType entityType, Guid entityId);

    Task<PaginatedResult<ApprovalHistoryDto>> GetApprovalHistoryAsync(
        Guid tenantId, Guid userId, int page = 1, int pageSize = 20);
}
