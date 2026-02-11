using Carmen.Application.DTOs.Asset;
using Carmen.Application.DTOs.Common;
using Carmen.Application.Interfaces;
using Carmen.Application.Services.Asset;
using Carmen.Domain.Entities.Asset;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Services;

public class AssetService : IAssetService
{
    private readonly CarmenDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IAssetCategoryService _categoryService;
    private readonly ILogger<AssetService> _logger;

    public AssetService(
        CarmenDbContext context,
        ICurrentUserService currentUserService,
        IAssetCategoryService categoryService,
        ILogger<AssetService> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _categoryService = categoryService;
        _logger = logger;
    }

    public async Task<PaginatedResult<AssetListDto>> GetAssetsAsync(AssetQueryParams query)
    {
        var queryable = _context.Assets
            .Include(a => a.AssetCategory)
            .Include(a => a.Department)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.ToLower();
            queryable = queryable.Where(a =>
                a.AssetCode.ToLower().Contains(search) ||
                a.AssetName.ToLower().Contains(search) ||
                (a.AssetNameLocal != null && a.AssetNameLocal.ToLower().Contains(search)) ||
                (a.SerialNumber != null && a.SerialNumber.ToLower().Contains(search)) ||
                (a.Barcode != null && a.Barcode.ToLower().Contains(search)));
        }

        if (query.CategoryId.HasValue)
        {
            queryable = queryable.Where(a => a.AssetCategoryId == query.CategoryId.Value);
        }

        if (query.Status.HasValue)
        {
            queryable = queryable.Where(a => a.Status == query.Status.Value);
        }

        if (query.DepartmentId.HasValue)
        {
            queryable = queryable.Where(a => a.DepartmentId == query.DepartmentId.Value);
        }

        if (query.AcquisitionDateFrom.HasValue)
        {
            queryable = queryable.Where(a => a.AcquisitionDate >= query.AcquisitionDateFrom.Value);
        }

        if (query.AcquisitionDateTo.HasValue)
        {
            queryable = queryable.Where(a => a.AcquisitionDate <= query.AcquisitionDateTo.Value);
        }

        if (query.IsFullyDepreciated.HasValue)
        {
            queryable = queryable.Where(a => a.IsFullyDepreciated == query.IsFullyDepreciated.Value);
        }

        // Get total count
        var totalCount = await queryable.CountAsync();

        // Apply sorting
        queryable = query.SortBy.ToLower() switch
        {
            "assetname" => query.SortDescending
                ? queryable.OrderByDescending(a => a.AssetName)
                : queryable.OrderBy(a => a.AssetName),
            "acquisitiondate" => query.SortDescending
                ? queryable.OrderByDescending(a => a.AcquisitionDate)
                : queryable.OrderBy(a => a.AcquisitionDate),
            "acquisitioncost" => query.SortDescending
                ? queryable.OrderByDescending(a => a.AcquisitionCost)
                : queryable.OrderBy(a => a.AcquisitionCost),
            "currentvalue" => query.SortDescending
                ? queryable.OrderByDescending(a => a.CurrentValue)
                : queryable.OrderBy(a => a.CurrentValue),
            "createdat" => query.SortDescending
                ? queryable.OrderByDescending(a => a.CreatedAt)
                : queryable.OrderBy(a => a.CreatedAt),
            _ => query.SortDescending
                ? queryable.OrderByDescending(a => a.AssetCode)
                : queryable.OrderBy(a => a.AssetCode)
        };

        // Apply pagination
        var items = await queryable
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(a => new AssetListDto(
                a.Id,
                a.AssetCode,
                a.AssetName,
                a.AssetCategory.CategoryCode,
                a.AssetCategory.CategoryName,
                a.LocationDescription,
                a.Department != null ? a.Department.DepartmentName : null,
                a.Condition,
                a.AcquisitionDate,
                a.AcquisitionCost,
                a.CurrencyCode,
                a.DepreciationMethod,
                a.Status,
                a.AccumulatedDepreciation,
                a.CurrentValue,
                a.IsFullyDepreciated,
                a.CreatedAt))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize);

        return new PaginatedResult<AssetListDto>(items, totalCount, query.Page, query.PageSize, totalPages);
    }

    public async Task<AssetDto?> GetAssetByIdAsync(Guid id)
    {
        var asset = await _context.Assets
            .Include(a => a.AssetCategory)
            .Include(a => a.Department)
            .Include(a => a.Vendor)
            .Include(a => a.ApInvoice)
            .Include(a => a.AssetAccount)
            .Include(a => a.AccumDepreciationAccount)
            .Include(a => a.DepreciationExpenseAccount)
            .Include(a => a.DepreciationSchedules)
                .ThenInclude(s => s.FiscalPeriod)
            .FirstOrDefaultAsync(a => a.Id == id);

        return asset == null ? null : MapToDto(asset);
    }

    public async Task<AssetDto?> GetAssetByCodeAsync(string assetCode)
    {
        var asset = await _context.Assets
            .Include(a => a.AssetCategory)
            .Include(a => a.Department)
            .Include(a => a.Vendor)
            .Include(a => a.ApInvoice)
            .Include(a => a.AssetAccount)
            .Include(a => a.AccumDepreciationAccount)
            .Include(a => a.DepreciationExpenseAccount)
            .Include(a => a.DepreciationSchedules)
                .ThenInclude(s => s.FiscalPeriod)
            .FirstOrDefaultAsync(a => a.AssetCode == assetCode);

        return asset == null ? null : MapToDto(asset);
    }

    public async Task<AssetDto> CreateAssetAsync(CreateAssetRequest request)
    {
        var tenantId = _currentUserService.TenantId
            ?? throw new InvalidOperationException("Tenant context is required.");

        // Check asset code uniqueness
        if (!await IsAssetCodeUniqueAsync(request.AssetCode))
        {
            throw new InvalidOperationException($"Asset code '{request.AssetCode}' already exists.");
        }

        // Validate category exists
        var category = await _context.AssetCategories.FindAsync(request.AssetCategoryId)
            ?? throw new InvalidOperationException("Asset category not found.");

        // Calculate depreciation values
        var depreciableAmount = request.AcquisitionCost - request.SalvageValue;
        var monthlyDepreciation = request.DepreciationMethod == DepreciationMethod.StraightLine
            ? depreciableAmount / request.UsefulLifeMonths
            : 0; // Other methods calculated differently during depreciation run

        var asset = new Asset
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            AssetCode = request.AssetCode,
            AssetName = request.AssetName,
            AssetNameLocal = request.AssetNameLocal,
            Description = request.Description,
            SerialNumber = request.SerialNumber,
            Barcode = request.Barcode,
            AssetCategoryId = request.AssetCategoryId,
            LocationDescription = request.LocationDescription,
            DepartmentId = request.DepartmentId,
            Condition = request.Condition,
            AcquisitionDate = request.AcquisitionDate,
            AcquisitionCost = request.AcquisitionCost,
            CurrencyCode = request.CurrencyCode,
            ExchangeRate = request.ExchangeRate,
            AcquisitionCostBase = request.AcquisitionCost * request.ExchangeRate,
            VendorId = request.VendorId,
            ApInvoiceId = request.ApInvoiceId,
            PurchaseReference = request.PurchaseReference,
            DepreciationMethod = request.DepreciationMethod,
            UsefulLifeMonths = request.UsefulLifeMonths,
            SalvageValue = request.SalvageValue,
            DepreciationStartDate = request.DepreciationStartDate,
            MonthlyDepreciation = monthlyDepreciation,
            Status = AssetStatus.Active,
            AccumulatedDepreciation = 0,
            CurrentValue = request.AcquisitionCost,
            DepreciatedMonths = 0,
            IsFullyDepreciated = false,
            AssetAccountId = request.AssetAccountId ?? category.DefaultAssetAccountId,
            AccumDepreciationAccountId = request.AccumDepreciationAccountId ?? category.DefaultAccumDepreciationAccountId,
            DepreciationExpenseAccountId = request.DepreciationExpenseAccountId ?? category.DefaultDepreciationExpenseAccountId,
            Notes = request.Notes,
            CreatedBy = _currentUserService.Email ?? "system"
        };

        _context.Assets.Add(asset);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created asset {AssetCode} with ID {Id}", asset.AssetCode, asset.Id);

        return await GetAssetByIdAsync(asset.Id)
            ?? throw new InvalidOperationException("Failed to retrieve created asset.");
    }

    public async Task<AssetDto> UpdateAssetAsync(Guid id, UpdateAssetRequest request)
    {
        var asset = await _context.Assets.FindAsync(id)
            ?? throw new InvalidOperationException("Asset not found.");

        if (asset.Status != AssetStatus.Active)
        {
            throw new InvalidOperationException("Only active assets can be updated.");
        }

        // Validate category exists
        var category = await _context.AssetCategories.FindAsync(request.AssetCategoryId)
            ?? throw new InvalidOperationException("Asset category not found.");

        // Recalculate depreciation if parameters changed
        var depreciableAmount = asset.AcquisitionCost - request.SalvageValue;
        var monthlyDepreciation = request.DepreciationMethod == DepreciationMethod.StraightLine
            ? depreciableAmount / request.UsefulLifeMonths
            : 0;

        asset.AssetName = request.AssetName;
        asset.AssetNameLocal = request.AssetNameLocal;
        asset.Description = request.Description;
        asset.SerialNumber = request.SerialNumber;
        asset.Barcode = request.Barcode;
        asset.AssetCategoryId = request.AssetCategoryId;
        asset.LocationDescription = request.LocationDescription;
        asset.DepartmentId = request.DepartmentId;
        asset.Condition = request.Condition;
        asset.DepreciationMethod = request.DepreciationMethod;
        asset.UsefulLifeMonths = request.UsefulLifeMonths;
        asset.SalvageValue = request.SalvageValue;
        asset.MonthlyDepreciation = monthlyDepreciation;
        asset.AssetAccountId = request.AssetAccountId;
        asset.AccumDepreciationAccountId = request.AccumDepreciationAccountId;
        asset.DepreciationExpenseAccountId = request.DepreciationExpenseAccountId;
        asset.Notes = request.Notes;
        asset.UpdatedBy = _currentUserService.Email;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated asset {AssetCode} with ID {Id}", asset.AssetCode, asset.Id);

        return await GetAssetByIdAsync(asset.Id)
            ?? throw new InvalidOperationException("Failed to retrieve updated asset.");
    }

    public async Task DeleteAssetAsync(Guid id)
    {
        var asset = await _context.Assets
            .Include(a => a.DepreciationSchedules)
            .FirstOrDefaultAsync(a => a.Id == id)
            ?? throw new InvalidOperationException("Asset not found.");

        if (asset.DepreciationSchedules.Any(s => s.IsPosted))
        {
            throw new InvalidOperationException("Cannot delete asset with posted depreciation. Please void depreciation entries first.");
        }

        _context.Assets.Remove(asset);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted asset {AssetCode} with ID {Id}", asset.AssetCode, asset.Id);
    }

    public async Task<List<AssetLookupDto>> GetAssetLookupAsync(string? search, AssetStatus? status = null)
    {
        var queryable = _context.Assets
            .Include(a => a.AssetCategory)
            .AsQueryable();

        // Filter by status if provided, otherwise default to Active
        if (status.HasValue)
        {
            queryable = queryable.Where(a => a.Status == status.Value);
        }
        else
        {
            queryable = queryable.Where(a => a.Status == AssetStatus.Active);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            queryable = queryable.Where(a =>
                a.AssetCode.ToLower().Contains(searchLower) ||
                a.AssetName.ToLower().Contains(searchLower));
        }

        return await queryable
            .OrderBy(a => a.AssetCode)
            .Take(50)
            .Select(a => new AssetLookupDto(
                a.Id,
                a.AssetCode,
                a.AssetName,
                a.AssetCategory.CategoryName,
                a.Status,
                a.CurrentValue))
            .ToListAsync();
    }

    public async Task<AssetDto> DisposeAssetAsync(Guid id, DisposeAssetRequest request)
    {
        var asset = await _context.Assets
            .Include(a => a.Disposal)
            .FirstOrDefaultAsync(a => a.Id == id)
            ?? throw new InvalidOperationException("Asset not found.");

        if (asset.Status != AssetStatus.Active)
        {
            throw new InvalidOperationException("Only active assets can be disposed.");
        }

        if (asset.Disposal != null)
        {
            throw new InvalidOperationException("Asset already has a disposal record.");
        }

        var tenantId = _currentUserService.TenantId
            ?? throw new InvalidOperationException("Tenant context is required.");

        var netProceeds = request.DisposalValue - request.DisposalCost;
        var gainLoss = netProceeds - asset.CurrentValue;

        // Create disposal record
        var disposal = new AssetDisposal
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            AssetId = asset.Id,
            DisposalDate = request.DisposalDate,
            DisposalMethod = request.DisposalMethod,
            DisposalValue = request.DisposalValue,
            DisposalCost = request.DisposalCost,
            NetProceeds = netProceeds,
            BookValueAtDisposal = asset.CurrentValue,
            AccumulatedDepreciationAtDisposal = asset.AccumulatedDepreciation,
            GainLossAmount = gainLoss,
            BuyerName = request.BuyerName,
            Reference = request.Reference,
            Reason = request.Reason,
            Notes = request.Notes,
            IsPosted = false,
            CreatedBy = _currentUserService.Email ?? "system"
        };

        // Update asset status
        asset.Status = request.DisposalMethod switch
        {
            DisposalMethod.Sale => AssetStatus.Sold,
            DisposalMethod.WriteOff => AssetStatus.WrittenOff,
            DisposalMethod.Transfer => AssetStatus.Transferred,
            _ => AssetStatus.Disposed
        };
        asset.DisposedAt = request.DisposalDate;
        asset.DisposalValue = request.DisposalValue;
        asset.GainLossAmount = gainLoss;
        asset.UpdatedBy = _currentUserService.Email;

        _context.AssetDisposals.Add(disposal);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Disposed asset {AssetCode} with ID {Id}, gain/loss: {GainLoss}",
            asset.AssetCode, asset.Id, gainLoss);

        return await GetAssetByIdAsync(asset.Id)
            ?? throw new InvalidOperationException("Failed to retrieve updated asset.");
    }

    public async Task<AssetDto> TransferAssetAsync(Guid id, TransferAssetRequest request)
    {
        var asset = await _context.Assets.FindAsync(id)
            ?? throw new InvalidOperationException("Asset not found.");

        if (asset.Status != AssetStatus.Active)
        {
            throw new InvalidOperationException("Only active assets can be transferred.");
        }

        asset.DepartmentId = request.NewDepartmentId;
        asset.LocationDescription = request.NewLocationDescription;
        asset.UpdatedBy = _currentUserService.Email;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Transferred asset {AssetCode} to department {DepartmentId}",
            asset.AssetCode, request.NewDepartmentId);

        return await GetAssetByIdAsync(asset.Id)
            ?? throw new InvalidOperationException("Failed to retrieve updated asset.");
    }

    public async Task<bool> IsAssetCodeUniqueAsync(string assetCode, Guid? excludeId = null)
    {
        var query = _context.Assets.Where(a => a.AssetCode == assetCode);

        if (excludeId.HasValue)
        {
            query = query.Where(a => a.Id != excludeId.Value);
        }

        return !await query.AnyAsync();
    }

    public async Task RecalculateAssetValueAsync(Guid assetId)
    {
        var asset = await _context.Assets
            .Include(a => a.DepreciationSchedules)
            .FirstOrDefaultAsync(a => a.Id == assetId)
            ?? throw new InvalidOperationException("Asset not found.");

        var totalDepreciation = asset.DepreciationSchedules
            .Where(s => s.IsPosted)
            .Sum(s => s.DepreciationAmount);

        asset.AccumulatedDepreciation = totalDepreciation;
        asset.CurrentValue = asset.AcquisitionCost - totalDepreciation;
        asset.DepreciatedMonths = asset.DepreciationSchedules.Count(s => s.IsPosted);
        asset.IsFullyDepreciated = asset.CurrentValue <= asset.SalvageValue;

        await _context.SaveChangesAsync();
    }

    public async Task<List<AssetRegisterDto>> GetAssetRegisterAsync(Guid? categoryId, Guid? departmentId, AssetStatus? status, DateTime asOfDate)
    {
        var queryable = _context.Assets
            .Include(a => a.AssetCategory)
            .Include(a => a.Department)
            .Where(a => a.AcquisitionDate <= asOfDate)
            .AsQueryable();

        if (categoryId.HasValue)
        {
            queryable = queryable.Where(a => a.AssetCategoryId == categoryId.Value);
        }

        if (status.HasValue)
        {
            queryable = queryable.Where(a => a.Status == status.Value);
        }

        if (departmentId.HasValue)
        {
            queryable = queryable.Where(a => a.DepartmentId == departmentId.Value);
        }

        return await queryable
            .OrderBy(a => a.AssetCode)
            .Select(a => new AssetRegisterDto(
                a.Id,
                a.AssetCode,
                a.AssetName,
                a.AssetCategory.CategoryCode,
                a.AssetCategory.CategoryName,
                a.Department != null ? a.Department.DepartmentName : null,
                a.AcquisitionDate,
                a.AcquisitionCost,
                a.CurrencyCode,
                a.DepreciationMethod,
                a.UsefulLifeMonths,
                a.SalvageValue,
                a.MonthlyDepreciation,
                a.AccumulatedDepreciation,
                a.CurrentValue,
                a.Status))
            .ToListAsync();
    }

    public async Task<AssetDisposalDto?> GetAssetDisposalAsync(Guid assetId)
    {
        var disposal = await _context.AssetDisposals
            .Include(d => d.Asset)
            .Include(d => d.JournalVoucher)
            .FirstOrDefaultAsync(d => d.AssetId == assetId);

        if (disposal == null) return null;

        return new AssetDisposalDto(
            disposal.Id,
            disposal.AssetId,
            disposal.Asset.AssetCode,
            disposal.Asset.AssetName,
            disposal.DisposalDate,
            disposal.DisposalMethod,
            disposal.DisposalValue,
            disposal.DisposalCost,
            disposal.NetProceeds,
            disposal.BookValueAtDisposal,
            disposal.AccumulatedDepreciationAtDisposal,
            disposal.GainLossAmount,
            disposal.BuyerName,
            disposal.Reference,
            disposal.Reason,
            disposal.Notes,
            disposal.IsPosted,
            disposal.JournalVoucherId,
            disposal.JournalVoucher?.VoucherNumber,
            disposal.PostedAt,
            disposal.PostedBy,
            disposal.ApprovedBy,
            disposal.ApprovedAt,
            disposal.CreatedAt,
            disposal.CreatedBy
        );
    }

    public async Task<AssetDto> PostDisposalAsync(Guid assetId)
    {
        var disposal = await _context.AssetDisposals
            .Include(d => d.Asset)
            .FirstOrDefaultAsync(d => d.AssetId == assetId)
            ?? throw new InvalidOperationException("Disposal record not found.");

        if (disposal.IsPosted)
        {
            throw new InvalidOperationException("Disposal is already posted.");
        }

        // TODO: Create journal voucher for disposal
        // Debit: Cash/AR (disposal value)
        // Debit: Accumulated Depreciation
        // Debit/Credit: Gain/Loss on Disposal
        // Credit: Asset Account (acquisition cost)

        disposal.IsPosted = true;
        disposal.PostedAt = DateTime.UtcNow;
        disposal.PostedBy = _currentUserService.Email;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Posted disposal for asset {AssetCode}", disposal.Asset.AssetCode);

        return await GetAssetByIdAsync(assetId)
            ?? throw new InvalidOperationException("Failed to retrieve updated asset.");
    }

    private static AssetDto MapToDto(Asset asset)
    {
        var schedules = asset.DepreciationSchedules?
            .OrderBy(s => s.ScheduleNumber)
            .Select(s => new DepreciationScheduleDto(
                s.Id,
                s.AssetId,
                asset.AssetCode,
                asset.AssetName,
                s.FiscalPeriodId,
                s.FiscalPeriod?.Name ?? "",
                s.ScheduleNumber,
                s.ScheduleDate,
                s.OpeningValue,
                s.DepreciationAmount,
                s.DepreciationAmountBase,
                s.ClosingValue,
                s.AccumulatedDepreciation,
                s.IsPosted,
                s.JournalVoucherId,
                null, // JournalVoucher number - not loaded
                s.PostedAt,
                s.PostedBy,
                s.Notes,
                s.CreatedAt))
            .ToList() ?? new List<DepreciationScheduleDto>();

        return new AssetDto(
            asset.Id,
            asset.AssetCode,
            asset.AssetName,
            asset.AssetNameLocal,
            asset.Description,
            asset.SerialNumber,
            asset.Barcode,
            asset.AssetCategoryId,
            asset.AssetCategory.CategoryCode,
            asset.AssetCategory.CategoryName,
            asset.LocationDescription,
            asset.DepartmentId,
            asset.Department?.DepartmentName,
            asset.Condition,
            asset.AcquisitionDate,
            asset.AcquisitionCost,
            asset.CurrencyCode,
            asset.ExchangeRate,
            asset.AcquisitionCostBase,
            asset.VendorId,
            asset.Vendor?.VendorCode,
            asset.Vendor?.VendorName,
            asset.ApInvoiceId,
            asset.ApInvoice?.InvoiceNumber,
            asset.PurchaseReference,
            asset.DepreciationMethod,
            asset.UsefulLifeMonths,
            asset.SalvageValue,
            asset.DepreciationStartDate,
            asset.MonthlyDepreciation,
            asset.Status,
            asset.AccumulatedDepreciation,
            asset.CurrentValue,
            asset.DepreciatedMonths,
            asset.IsFullyDepreciated,
            asset.AssetAccountId,
            asset.AssetAccount?.AccountCode,
            asset.AssetAccount?.AccountName,
            asset.AccumDepreciationAccountId,
            asset.AccumDepreciationAccount?.AccountCode,
            asset.AccumDepreciationAccount?.AccountName,
            asset.DepreciationExpenseAccountId,
            asset.DepreciationExpenseAccount?.AccountCode,
            asset.DepreciationExpenseAccount?.AccountName,
            asset.DisposedAt,
            asset.DisposalValue,
            asset.GainLossAmount,
            asset.Notes,
            schedules,
            asset.CreatedAt,
            asset.CreatedBy,
            asset.UpdatedAt
        );
    }
}
