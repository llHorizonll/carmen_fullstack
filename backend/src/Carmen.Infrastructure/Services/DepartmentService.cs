using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.Configuration;
using Carmen.Application.Interfaces;
using Carmen.Application.Services.Configuration;
using Carmen.Domain.Entities.Configuration;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Services;

public class DepartmentService : IDepartmentService
{
    private readonly CarmenDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<DepartmentService> _logger;

    public DepartmentService(
        CarmenDbContext context,
        ICurrentUserService currentUserService,
        ILogger<DepartmentService> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<PaginatedResult<DepartmentListDto>> GetDepartmentsAsync(DepartmentQueryParams query)
    {
        var queryable = _context.Departments
            .Include(d => d.ParentDepartment)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.ToLower();
            queryable = queryable.Where(d =>
                d.DepartmentCode.ToLower().Contains(search) ||
                d.DepartmentName.ToLower().Contains(search) ||
                (d.Description != null && d.Description.ToLower().Contains(search)) ||
                (d.CostCenterCode != null && d.CostCenterCode.ToLower().Contains(search)));
        }

        if (query.IsActive.HasValue)
        {
            queryable = queryable.Where(d => d.IsActive == query.IsActive.Value);
        }

        if (query.ParentDepartmentId.HasValue)
        {
            queryable = queryable.Where(d => d.ParentDepartmentId == query.ParentDepartmentId.Value);
        }

        if (query.Level.HasValue)
        {
            queryable = queryable.Where(d => d.Level == query.Level.Value);
        }

        // Get total count
        var totalCount = await queryable.CountAsync();

        // Apply sorting
        queryable = query.SortBy.ToLower() switch
        {
            "departmentname" => query.SortDescending
                ? queryable.OrderByDescending(d => d.DepartmentName)
                : queryable.OrderBy(d => d.DepartmentName),
            "level" => query.SortDescending
                ? queryable.OrderByDescending(d => d.Level)
                : queryable.OrderBy(d => d.Level),
            "sortorder" => query.SortDescending
                ? queryable.OrderByDescending(d => d.SortOrder)
                : queryable.OrderBy(d => d.SortOrder),
            _ => query.SortDescending
                ? queryable.OrderByDescending(d => d.DepartmentCode)
                : queryable.OrderBy(d => d.DepartmentCode)
        };

        // Apply pagination
        var items = await queryable
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(d => new DepartmentListDto(
                d.Id,
                d.DepartmentCode,
                d.DepartmentName,
                d.ParentDepartment != null ? d.ParentDepartment.DepartmentName : null,
                d.Level,
                d.CostCenterCode,
                d.IsActive))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize);

        return new PaginatedResult<DepartmentListDto>(items, totalCount, query.Page, query.PageSize, totalPages);
    }

    public async Task<DepartmentDto?> GetDepartmentByIdAsync(Guid id)
    {
        var department = await _context.Departments
            .Include(d => d.ParentDepartment)
            .FirstOrDefaultAsync(d => d.Id == id);

        return department == null ? null : MapToDto(department);
    }

    public async Task<DepartmentDto?> GetDepartmentByCodeAsync(string departmentCode)
    {
        var department = await _context.Departments
            .Include(d => d.ParentDepartment)
            .FirstOrDefaultAsync(d => d.DepartmentCode == departmentCode);

        return department == null ? null : MapToDto(department);
    }

    public async Task<List<DepartmentLookupDto>> GetDepartmentLookupAsync(bool? isActive = null, Guid? excludeId = null)
    {
        var queryable = _context.Departments.AsQueryable();

        if (isActive.HasValue)
        {
            queryable = queryable.Where(d => d.IsActive == isActive.Value);
        }
        else
        {
            queryable = queryable.Where(d => d.IsActive);
        }

        if (excludeId.HasValue)
        {
            // Exclude the department and all its descendants to prevent circular references
            var descendantIds = await GetDescendantIdsAsync(excludeId.Value);
            descendantIds.Add(excludeId.Value);
            queryable = queryable.Where(d => !descendantIds.Contains(d.Id));
        }

        return await queryable
            .OrderBy(d => d.Level)
            .ThenBy(d => d.SortOrder)
            .ThenBy(d => d.DepartmentCode)
            .Select(d => new DepartmentLookupDto(
                d.Id,
                d.DepartmentCode,
                d.DepartmentName,
                d.Level))
            .ToListAsync();
    }

    public async Task<List<DepartmentTreeDto>> GetDepartmentTreeAsync(bool? isActive = null)
    {
        var queryable = _context.Departments.AsQueryable();

        if (isActive.HasValue)
        {
            queryable = queryable.Where(d => d.IsActive == isActive.Value);
        }

        var allDepartments = await queryable
            .OrderBy(d => d.SortOrder)
            .ThenBy(d => d.DepartmentCode)
            .ToListAsync();

        return BuildTree(allDepartments, null);
    }

    public async Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentRequest request)
    {
        // Validate department code doesn't exist
        if (await DepartmentCodeExistsAsync(request.DepartmentCode))
        {
            throw new InvalidOperationException($"Department code '{request.DepartmentCode}' already exists.");
        }

        var tenantId = _currentUserService.TenantId
            ?? throw new InvalidOperationException("Tenant context is required.");

        // Calculate level based on parent
        var level = 1;
        if (request.ParentDepartmentId.HasValue)
        {
            var parent = await _context.Departments.FindAsync(request.ParentDepartmentId.Value);
            if (parent == null)
            {
                throw new InvalidOperationException("Parent department not found.");
            }
            level = parent.Level + 1;
        }

        var department = new Department
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            DepartmentCode = request.DepartmentCode.ToUpper(),
            DepartmentName = request.DepartmentName,
            DepartmentNameLocal = request.DepartmentNameLocal,
            ParentDepartmentId = request.ParentDepartmentId,
            Level = level,
            Description = request.Description,
            CostCenterCode = request.CostCenterCode,
            ManagerName = request.ManagerName,
            SortOrder = request.SortOrder,
            IsActive = true,
            CreatedBy = _currentUserService.Email ?? "system"
        };

        _context.Departments.Add(department);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created department {DepartmentCode} with ID {DepartmentId}",
            department.DepartmentCode, department.Id);

        return MapToDto(department);
    }

    public async Task<DepartmentDto> UpdateDepartmentAsync(Guid id, UpdateDepartmentRequest request)
    {
        var department = await _context.Departments
            .Include(d => d.ParentDepartment)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (department == null)
        {
            throw new InvalidOperationException("Department not found.");
        }

        // Validate parent change doesn't create circular reference
        if (request.ParentDepartmentId.HasValue && request.ParentDepartmentId.Value != department.ParentDepartmentId)
        {
            var descendantIds = await GetDescendantIdsAsync(id);
            if (descendantIds.Contains(request.ParentDepartmentId.Value))
            {
                throw new InvalidOperationException("Cannot set a descendant department as the parent.");
            }
        }

        // Calculate new level based on parent
        var level = 1;
        if (request.ParentDepartmentId.HasValue)
        {
            var parent = await _context.Departments.FindAsync(request.ParentDepartmentId.Value);
            if (parent == null)
            {
                throw new InvalidOperationException("Parent department not found.");
            }
            level = parent.Level + 1;
        }

        var oldLevel = department.Level;
        var levelDifference = level - oldLevel;

        department.DepartmentName = request.DepartmentName;
        department.DepartmentNameLocal = request.DepartmentNameLocal;
        department.ParentDepartmentId = request.ParentDepartmentId;
        department.Level = level;
        department.Description = request.Description;
        department.CostCenterCode = request.CostCenterCode;
        department.ManagerName = request.ManagerName;
        department.SortOrder = request.SortOrder;
        department.IsActive = request.IsActive;
        department.UpdatedBy = _currentUserService.Email;

        // Update descendant levels if level changed
        if (levelDifference != 0)
        {
            await UpdateDescendantLevelsAsync(id, levelDifference);
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated department {DepartmentCode} with ID {DepartmentId}",
            department.DepartmentCode, department.Id);

        return MapToDto(department);
    }

    public async Task DeleteDepartmentAsync(Guid id)
    {
        var department = await _context.Departments
            .FirstOrDefaultAsync(d => d.Id == id);

        if (department == null)
        {
            throw new InvalidOperationException("Department not found.");
        }

        // Check if department has references
        if (await DepartmentHasReferencesAsync(id))
        {
            throw new InvalidOperationException("Cannot delete department with existing child departments or transactions. Deactivate it instead.");
        }

        // Soft delete
        department.IsActive = false;
        department.UpdatedBy = _currentUserService.Email;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted (deactivated) department {DepartmentCode} with ID {DepartmentId}",
            department.DepartmentCode, department.Id);
    }

    public async Task<bool> DepartmentCodeExistsAsync(string departmentCode, Guid? excludeId = null)
    {
        var query = _context.Departments
            .Where(d => d.DepartmentCode == departmentCode.ToUpper());

        if (excludeId.HasValue)
        {
            query = query.Where(d => d.Id != excludeId.Value);
        }

        return await query.AnyAsync();
    }

    public async Task<bool> DepartmentHasReferencesAsync(Guid id)
    {
        // Check for child departments
        var hasChildren = await _context.Departments
            .AnyAsync(d => d.ParentDepartmentId == id);

        if (hasChildren)
        {
            return true;
        }

        // TODO: Check if department is used in transactions (journal vouchers, etc.)
        // For now, return false as transaction tables may not exist yet
        return false;
    }

    private async Task<HashSet<Guid>> GetDescendantIdsAsync(Guid parentId)
    {
        var allDepartments = await _context.Departments
            .Select(d => new { d.Id, d.ParentDepartmentId })
            .ToListAsync();

        var descendants = new HashSet<Guid>();
        var queue = new Queue<Guid>();

        // Find direct children
        foreach (var dept in allDepartments.Where(d => d.ParentDepartmentId == parentId))
        {
            queue.Enqueue(dept.Id);
        }

        while (queue.Count > 0)
        {
            var currentId = queue.Dequeue();
            descendants.Add(currentId);

            foreach (var child in allDepartments.Where(d => d.ParentDepartmentId == currentId))
            {
                queue.Enqueue(child.Id);
            }
        }

        return descendants;
    }

    private async Task UpdateDescendantLevelsAsync(Guid parentId, int levelDifference)
    {
        var descendantIds = await GetDescendantIdsAsync(parentId);
        if (descendantIds.Count == 0) return;

        var descendants = await _context.Departments
            .Where(d => descendantIds.Contains(d.Id))
            .ToListAsync();

        foreach (var descendant in descendants)
        {
            descendant.Level += levelDifference;
        }
    }

    private List<DepartmentTreeDto> BuildTree(List<Department> allDepartments, Guid? parentId)
    {
        return allDepartments
            .Where(d => d.ParentDepartmentId == parentId)
            .Select(d => new DepartmentTreeDto(
                d.Id,
                d.DepartmentCode,
                d.DepartmentName,
                d.Level,
                d.IsActive,
                BuildTree(allDepartments, d.Id)))
            .ToList();
    }

    private static DepartmentDto MapToDto(Department department)
    {
        return new DepartmentDto(
            Id: department.Id,
            DepartmentCode: department.DepartmentCode,
            DepartmentName: department.DepartmentName,
            DepartmentNameLocal: department.DepartmentNameLocal,
            ParentDepartmentId: department.ParentDepartmentId,
            ParentDepartmentName: department.ParentDepartment?.DepartmentName,
            Level: department.Level,
            Description: department.Description,
            CostCenterCode: department.CostCenterCode,
            ManagerName: department.ManagerName,
            SortOrder: department.SortOrder,
            IsActive: department.IsActive,
            CreatedAt: department.CreatedAt,
            UpdatedAt: department.UpdatedAt
        );
    }
}
