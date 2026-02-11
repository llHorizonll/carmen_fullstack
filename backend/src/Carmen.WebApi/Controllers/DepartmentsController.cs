using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.Configuration;
using Carmen.Application.Services.Configuration;
using Carmen.WebApi.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// Department management endpoints
/// </summary>
[ApiController]
[Route("api/v1/tenants/{tenantId:guid}/departments")]
[Authorize]
public class DepartmentsController : ControllerBase
{
    private readonly IDepartmentService _departmentService;
    private readonly ILogger<DepartmentsController> _logger;

    public DepartmentsController(
        IDepartmentService departmentService,
        ILogger<DepartmentsController> logger)
    {
        _departmentService = departmentService;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of departments
    /// </summary>
    [HttpGet]
    [RequirePermission("Configuration.Department.View")]
    [ProducesResponseType(typeof(PaginatedResult<DepartmentListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<DepartmentListDto>>> GetDepartments(
        [FromRoute] Guid tenantId,
        [FromQuery] string? search,
        [FromQuery] bool? isActive,
        [FromQuery] Guid? parentDepartmentId,
        [FromQuery] int? level,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string sortBy = "DepartmentCode",
        [FromQuery] bool sortDescending = false)
    {
        var query = new DepartmentQueryParams(
            Search: search,
            IsActive: isActive,
            ParentDepartmentId: parentDepartmentId,
            Level: level,
            Page: page,
            PageSize: Math.Min(pageSize, 100),
            SortBy: sortBy,
            SortDescending: sortDescending
        );

        var result = await _departmentService.GetDepartmentsAsync(query);
        return Ok(result);
    }

    /// <summary>
    /// Get department by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [RequirePermission("Configuration.Department.View")]
    [ProducesResponseType(typeof(DepartmentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DepartmentDto>> GetDepartment(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        var department = await _departmentService.GetDepartmentByIdAsync(id);

        if (department == null)
        {
            return NotFound(new { message = "Department not found." });
        }

        return Ok(department);
    }

    /// <summary>
    /// Get department by code
    /// </summary>
    [HttpGet("by-code/{code}")]
    [RequirePermission("Configuration.Department.View")]
    [ProducesResponseType(typeof(DepartmentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DepartmentDto>> GetDepartmentByCode(
        [FromRoute] Guid tenantId,
        [FromRoute] string code)
    {
        var department = await _departmentService.GetDepartmentByCodeAsync(code);

        if (department == null)
        {
            return NotFound(new { message = "Department not found." });
        }

        return Ok(department);
    }

    /// <summary>
    /// Get departments for lookup (dropdown/select)
    /// </summary>
    [HttpGet("lookup")]
    [RequirePermission("Configuration.Department.View")]
    [ProducesResponseType(typeof(List<DepartmentLookupDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<DepartmentLookupDto>>> GetDepartmentLookup(
        [FromRoute] Guid tenantId,
        [FromQuery] bool? isActive,
        [FromQuery] Guid? excludeId)
    {
        var departments = await _departmentService.GetDepartmentLookupAsync(isActive, excludeId);
        return Ok(departments);
    }

    /// <summary>
    /// Get departments as a hierarchical tree
    /// </summary>
    [HttpGet("tree")]
    [RequirePermission("Configuration.Department.View")]
    [ProducesResponseType(typeof(List<DepartmentTreeDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<DepartmentTreeDto>>> GetDepartmentTree(
        [FromRoute] Guid tenantId,
        [FromQuery] bool? isActive)
    {
        var tree = await _departmentService.GetDepartmentTreeAsync(isActive);
        return Ok(tree);
    }

    /// <summary>
    /// Create a new department
    /// </summary>
    [HttpPost]
    [RequirePermission("Configuration.Department.Create")]
    [ProducesResponseType(typeof(DepartmentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<DepartmentDto>> CreateDepartment(
        [FromRoute] Guid tenantId,
        [FromBody] CreateDepartmentRequest request)
    {
        try
        {
            var department = await _departmentService.CreateDepartmentAsync(request);
            _logger.LogInformation("Created department {DepartmentCode} for tenant {TenantId}",
                department.DepartmentCode, tenantId);

            return CreatedAtAction(
                nameof(GetDepartment),
                new { tenantId, id = department.Id },
                department);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to create department: {Message}", ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing department
    /// </summary>
    [HttpPut("{id:guid}")]
    [RequirePermission("Configuration.Department.Edit")]
    [ProducesResponseType(typeof(DepartmentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DepartmentDto>> UpdateDepartment(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id,
        [FromBody] UpdateDepartmentRequest request)
    {
        try
        {
            var department = await _departmentService.UpdateDepartmentAsync(id, request);
            _logger.LogInformation("Updated department {DepartmentCode} for tenant {TenantId}",
                department.DepartmentCode, tenantId);

            return Ok(department);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Department not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to update department {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Delete a department (soft delete)
    /// </summary>
    [HttpDelete("{id:guid}")]
    [RequirePermission("Configuration.Department.Delete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteDepartment(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        try
        {
            await _departmentService.DeleteDepartmentAsync(id);
            _logger.LogInformation("Deleted department {Id} for tenant {TenantId}", id, tenantId);

            return NoContent();
        }
        catch (InvalidOperationException ex) when (ex.Message == "Department not found.")
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning("Failed to delete department {Id}: {Message}", id, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Check if department code exists
    /// </summary>
    [HttpGet("check-code/{code}")]
    [RequirePermission("Configuration.Department.View")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> CheckDepartmentCode(
        [FromRoute] Guid tenantId,
        [FromRoute] string code,
        [FromQuery] Guid? excludeId)
    {
        var exists = await _departmentService.DepartmentCodeExistsAsync(code, excludeId);
        return Ok(new { exists });
    }

    /// <summary>
    /// Check if department has references (child departments or transactions)
    /// </summary>
    [HttpGet("{id:guid}/has-references")]
    [RequirePermission("Configuration.Department.View")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<ActionResult> CheckDepartmentHasReferences(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        var hasReferences = await _departmentService.DepartmentHasReferencesAsync(id);
        return Ok(new { hasReferences });
    }
}
