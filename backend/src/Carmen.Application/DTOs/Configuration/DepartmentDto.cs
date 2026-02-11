namespace Carmen.Application.DTOs.Configuration;

/// <summary>
/// Full department data transfer object
/// </summary>
public record DepartmentDto(
    Guid Id,
    string DepartmentCode,
    string DepartmentName,
    string? DepartmentNameLocal,
    Guid? ParentDepartmentId,
    string? ParentDepartmentName,
    int Level,
    string? Description,
    string? CostCenterCode,
    string? ManagerName,
    int SortOrder,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

/// <summary>
/// Department list item for data tables
/// </summary>
public record DepartmentListDto(
    Guid Id,
    string DepartmentCode,
    string DepartmentName,
    string? ParentDepartmentName,
    int Level,
    string? CostCenterCode,
    bool IsActive
);

/// <summary>
/// Department lookup for dropdowns
/// </summary>
public record DepartmentLookupDto(
    Guid Id,
    string DepartmentCode,
    string DepartmentName,
    int Level
);

/// <summary>
/// Department tree node for hierarchical display
/// </summary>
public record DepartmentTreeDto(
    Guid Id,
    string DepartmentCode,
    string DepartmentName,
    int Level,
    bool IsActive,
    List<DepartmentTreeDto> Children
);

/// <summary>
/// Request to create a new department
/// </summary>
public record CreateDepartmentRequest(
    string DepartmentCode,
    string DepartmentName,
    string? DepartmentNameLocal,
    Guid? ParentDepartmentId,
    string? Description,
    string? CostCenterCode,
    string? ManagerName,
    int SortOrder = 0
);

/// <summary>
/// Request to update an existing department
/// </summary>
public record UpdateDepartmentRequest(
    string DepartmentName,
    string? DepartmentNameLocal,
    Guid? ParentDepartmentId,
    string? Description,
    string? CostCenterCode,
    string? ManagerName,
    int SortOrder,
    bool IsActive
);

/// <summary>
/// Query parameters for department list
/// </summary>
public record DepartmentQueryParams(
    string? Search = null,
    bool? IsActive = null,
    Guid? ParentDepartmentId = null,
    int? Level = null,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "DepartmentCode",
    bool SortDescending = false
);
