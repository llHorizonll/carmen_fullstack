using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.Workflow;
using Carmen.Application.Services.Workflow;
using Carmen.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// Workflow definition management and approval actions
/// </summary>
[ApiController]
[Route("api/v1/tenants/{tenantId:guid}/workflows")]
[Authorize]
public class WorkflowsController : ControllerBase
{
    private readonly IWorkflowService _workflowService;
    private readonly IWorkflowDefinitionService _definitionService;
    private readonly ILogger<WorkflowsController> _logger;

    public WorkflowsController(
        IWorkflowService workflowService,
        IWorkflowDefinitionService definitionService,
        ILogger<WorkflowsController> logger)
    {
        _workflowService = workflowService;
        _definitionService = definitionService;
        _logger = logger;
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("sub")?.Value
            ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }

    // === Workflow Definitions ===

    /// <summary>
    /// Get all workflow definitions
    /// </summary>
    [HttpGet("definitions")]
    [ProducesResponseType(typeof(List<WorkflowDefinitionListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<WorkflowDefinitionListDto>>> GetDefinitions(
        [FromRoute] Guid tenantId)
    {
        var result = await _definitionService.GetDefinitionsAsync();
        return Ok(result);
    }

    /// <summary>
    /// Get workflow definition by ID
    /// </summary>
    [HttpGet("definitions/{id:guid}")]
    [ProducesResponseType(typeof(WorkflowDefinitionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WorkflowDefinitionDto>> GetDefinition(
        [FromRoute] Guid tenantId, [FromRoute] Guid id)
    {
        var result = await _definitionService.GetDefinitionByIdAsync(id);
        if (result == null) return NotFound(new { message = "Workflow definition not found." });
        return Ok(result);
    }

    /// <summary>
    /// Create a workflow definition
    /// </summary>
    [HttpPost("definitions")]
    [ProducesResponseType(typeof(WorkflowDefinitionDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<WorkflowDefinitionDto>> CreateDefinition(
        [FromRoute] Guid tenantId, [FromBody] CreateWorkflowDefinitionRequest request)
    {
        try
        {
            var result = await _definitionService.CreateDefinitionAsync(request);
            return CreatedAtAction(nameof(GetDefinition), new { tenantId, id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update a workflow definition
    /// </summary>
    [HttpPut("definitions/{id:guid}")]
    [ProducesResponseType(typeof(WorkflowDefinitionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WorkflowDefinitionDto>> UpdateDefinition(
        [FromRoute] Guid tenantId, [FromRoute] Guid id,
        [FromBody] UpdateWorkflowDefinitionRequest request)
    {
        try
        {
            var result = await _definitionService.UpdateDefinitionAsync(id, request);
            return Ok(result);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete a workflow definition
    /// </summary>
    [HttpDelete("definitions/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> DeleteDefinition(
        [FromRoute] Guid tenantId, [FromRoute] Guid id)
    {
        try
        {
            await _definitionService.DeleteDefinitionAsync(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // === Approval Actions ===

    /// <summary>
    /// Get pending approvals for current user
    /// </summary>
    [HttpGet("pending")]
    [ProducesResponseType(typeof(PaginatedResult<PendingApprovalDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<PendingApprovalDto>>> GetPendingApprovals(
        [FromRoute] Guid tenantId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = GetCurrentUserId();
        var result = await _workflowService.GetPendingApprovalsAsync(tenantId, userId, page, pageSize);
        return Ok(result);
    }

    /// <summary>
    /// Get workflow instance details
    /// </summary>
    [HttpGet("instances/{instanceId:guid}")]
    [ProducesResponseType(typeof(WorkflowInstanceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WorkflowInstanceDto>> GetInstance(
        [FromRoute] Guid tenantId, [FromRoute] Guid instanceId)
    {
        var result = await _workflowService.GetInstanceAsync(tenantId, instanceId);
        if (result == null) return NotFound(new { message = "Workflow instance not found." });
        return Ok(result);
    }

    /// <summary>
    /// Approve current step
    /// </summary>
    [HttpPost("instances/{instanceId:guid}/approve")]
    [ProducesResponseType(typeof(WorkflowInstanceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<WorkflowInstanceDto>> Approve(
        [FromRoute] Guid tenantId, [FromRoute] Guid instanceId,
        [FromBody] WorkflowActionRequest? request = null)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _workflowService.ApproveAsync(tenantId, instanceId, userId, request?.Comment);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Reject current step
    /// </summary>
    [HttpPost("instances/{instanceId:guid}/reject")]
    [ProducesResponseType(typeof(WorkflowInstanceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<WorkflowInstanceDto>> Reject(
        [FromRoute] Guid tenantId, [FromRoute] Guid instanceId,
        [FromBody] WorkflowActionRequest? request = null)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _workflowService.RejectAsync(tenantId, instanceId, userId, request?.Comment);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delegate current step to another user
    /// </summary>
    [HttpPost("instances/{instanceId:guid}/delegate")]
    [ProducesResponseType(typeof(WorkflowInstanceDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<WorkflowInstanceDto>> Delegate(
        [FromRoute] Guid tenantId, [FromRoute] Guid instanceId,
        [FromBody] WorkflowActionRequest request)
    {
        try
        {
            if (!request.DelegateToUserId.HasValue)
                return BadRequest(new { message = "DelegateToUserId is required." });

            var userId = GetCurrentUserId();
            var result = await _workflowService.DelegateAsync(
                tenantId, instanceId, userId, request.DelegateToUserId.Value, request.Comment);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Get approval history for current user
    /// </summary>
    [HttpGet("history")]
    [ProducesResponseType(typeof(PaginatedResult<ApprovalHistoryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<ApprovalHistoryDto>>> GetApprovalHistory(
        [FromRoute] Guid tenantId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = GetCurrentUserId();
        var result = await _workflowService.GetApprovalHistoryAsync(tenantId, userId, page, pageSize);
        return Ok(result);
    }
}
