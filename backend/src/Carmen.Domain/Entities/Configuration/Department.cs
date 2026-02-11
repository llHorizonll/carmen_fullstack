using Carmen.Domain.Entities.Common;

namespace Carmen.Domain.Entities.Configuration;

/// <summary>
/// Represents a department within an organization
/// </summary>
public class Department : TenantEntity
{
    /// <summary>
    /// Unique code for the department
    /// </summary>
    public string DepartmentCode { get; set; } = string.Empty;

    /// <summary>
    /// Department name
    /// </summary>
    public string DepartmentName { get; set; } = string.Empty;

    /// <summary>
    /// Department name in local language
    /// </summary>
    public string? DepartmentNameLocal { get; set; }

    /// <summary>
    /// Parent department ID for hierarchy (null if top-level)
    /// </summary>
    public Guid? ParentDepartmentId { get; set; }

    /// <summary>
    /// Parent department navigation property
    /// </summary>
    public Department? ParentDepartment { get; set; }

    /// <summary>
    /// Child departments navigation property
    /// </summary>
    public ICollection<Department>? ChildDepartments { get; set; }

    /// <summary>
    /// Hierarchy level (1 = top-level, 2 = second level, etc.)
    /// </summary>
    public int Level { get; set; } = 1;

    /// <summary>
    /// Description of the department
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Cost center code for accounting integration
    /// </summary>
    public string? CostCenterCode { get; set; }

    /// <summary>
    /// Department manager/head name
    /// </summary>
    public string? ManagerName { get; set; }

    /// <summary>
    /// Display order for sorting
    /// </summary>
    public int SortOrder { get; set; }

    /// <summary>
    /// Whether the department is active
    /// </summary>
    public bool IsActive { get; set; } = true;
}
