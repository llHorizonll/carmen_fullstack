using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.Configuration;

namespace Carmen.Application.Services.Configuration;

/// <summary>
/// Service interface for department management
/// </summary>
public interface IDepartmentService
{
    /// <summary>
    /// Get paginated list of departments
    /// </summary>
    Task<PaginatedResult<DepartmentListDto>> GetDepartmentsAsync(DepartmentQueryParams query);

    /// <summary>
    /// Get department by ID
    /// </summary>
    Task<DepartmentDto?> GetDepartmentByIdAsync(Guid id);

    /// <summary>
    /// Get department by code
    /// </summary>
    Task<DepartmentDto?> GetDepartmentByCodeAsync(string departmentCode);

    /// <summary>
    /// Get departments for lookup (dropdown/select)
    /// </summary>
    Task<List<DepartmentLookupDto>> GetDepartmentLookupAsync(bool? isActive = null, Guid? excludeId = null);

    /// <summary>
    /// Get departments as a hierarchical tree
    /// </summary>
    Task<List<DepartmentTreeDto>> GetDepartmentTreeAsync(bool? isActive = null);

    /// <summary>
    /// Create a new department
    /// </summary>
    Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentRequest request);

    /// <summary>
    /// Update an existing department
    /// </summary>
    Task<DepartmentDto> UpdateDepartmentAsync(Guid id, UpdateDepartmentRequest request);

    /// <summary>
    /// Delete a department (soft delete)
    /// </summary>
    Task DeleteDepartmentAsync(Guid id);

    /// <summary>
    /// Check if department code exists
    /// </summary>
    Task<bool> DepartmentCodeExistsAsync(string departmentCode, Guid? excludeId = null);

    /// <summary>
    /// Check if department has transactions or child departments
    /// </summary>
    Task<bool> DepartmentHasReferencesAsync(Guid id);
}
