using Carmen.Application.DTOs.AP;
using Carmen.Application.DTOs.Common;
using Carmen.Application.Interfaces;
using Carmen.Application.Services.AP;
using Carmen.Domain.Entities.AP;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Services;

public class VendorService : IVendorService
{
    private readonly CarmenDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<VendorService> _logger;

    public VendorService(
        CarmenDbContext context,
        ICurrentUserService currentUserService,
        ILogger<VendorService> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<PaginatedResult<VendorListDto>> GetVendorsAsync(VendorQueryParams query)
    {
        var queryable = _context.Vendors
            .Include(v => v.Invoices)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.ToLower();
            queryable = queryable.Where(v =>
                v.VendorCode.ToLower().Contains(search) ||
                v.VendorName.ToLower().Contains(search) ||
                (v.VendorNameLocal != null && v.VendorNameLocal.ToLower().Contains(search)) ||
                (v.ContactPerson != null && v.ContactPerson.ToLower().Contains(search)) ||
                (v.Email != null && v.Email.ToLower().Contains(search)));
        }

        if (query.IsActive.HasValue)
        {
            queryable = queryable.Where(v => v.IsActive == query.IsActive.Value);
        }

        // Get total count
        var totalCount = await queryable.CountAsync();

        // Apply sorting
        queryable = query.SortBy.ToLower() switch
        {
            "vendorname" => query.SortDescending
                ? queryable.OrderByDescending(v => v.VendorName)
                : queryable.OrderBy(v => v.VendorName),
            "creditlimit" => query.SortDescending
                ? queryable.OrderByDescending(v => v.CreditLimit)
                : queryable.OrderBy(v => v.CreditLimit),
            "currentbalance" => query.SortDescending
                ? queryable.OrderByDescending(v => v.CurrentBalance)
                : queryable.OrderBy(v => v.CurrentBalance),
            "createdat" => query.SortDescending
                ? queryable.OrderByDescending(v => v.CreatedAt)
                : queryable.OrderBy(v => v.CreatedAt),
            _ => query.SortDescending
                ? queryable.OrderByDescending(v => v.VendorCode)
                : queryable.OrderBy(v => v.VendorCode)
        };

        // Apply pagination
        var items = await queryable
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(v => new VendorListDto(
                v.Id,
                v.VendorCode,
                v.VendorName,
                v.ContactPerson,
                v.Email,
                v.Phone,
                v.IsActive,
                v.CurrencyCode,
                v.CreditLimit,
                v.CurrentBalance,
                v.Invoices.Count,
                v.CreatedAt))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize);

        return new PaginatedResult<VendorListDto>(items, totalCount, query.Page, query.PageSize, totalPages);
    }

    public async Task<VendorDto?> GetVendorByIdAsync(Guid id)
    {
        var vendor = await _context.Vendors
            .Include(v => v.DefaultPaymentTerm)
            .Include(v => v.DefaultTax1Profile)
            .Include(v => v.DefaultTax2Profile)
            .Include(v => v.DefaultWhtProfile)
            .Include(v => v.DefaultApAccount)
            .Include(v => v.DefaultExpenseAccount)
            .FirstOrDefaultAsync(v => v.Id == id);

        return vendor == null ? null : MapToDto(vendor);
    }

    public async Task<VendorDto?> GetVendorByCodeAsync(string vendorCode)
    {
        var vendor = await _context.Vendors
            .Include(v => v.DefaultPaymentTerm)
            .Include(v => v.DefaultTax1Profile)
            .Include(v => v.DefaultTax2Profile)
            .Include(v => v.DefaultWhtProfile)
            .Include(v => v.DefaultApAccount)
            .Include(v => v.DefaultExpenseAccount)
            .FirstOrDefaultAsync(v => v.VendorCode == vendorCode);

        return vendor == null ? null : MapToDto(vendor);
    }

    public async Task<VendorDto> CreateVendorAsync(CreateVendorRequest request)
    {
        var tenantId = _currentUserService.TenantId
            ?? throw new InvalidOperationException("Tenant context is required.");

        // Check vendor code uniqueness
        if (!await IsVendorCodeUniqueAsync(request.VendorCode))
        {
            throw new InvalidOperationException($"Vendor code '{request.VendorCode}' already exists.");
        }

        var vendor = new Vendor
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            VendorCode = request.VendorCode,
            VendorName = request.VendorName,
            VendorNameLocal = request.VendorNameLocal,
            ContactPerson = request.ContactPerson,
            Email = request.Email,
            Phone = request.Phone,
            Fax = request.Fax,
            Address = request.Address,
            City = request.City,
            State = request.State,
            PostalCode = request.PostalCode,
            Country = request.Country,
            TaxId = request.TaxId,
            IsActive = true,
            DefaultPaymentTermId = request.DefaultPaymentTermId,
            CurrencyCode = request.CurrencyCode,
            CreditLimit = request.CreditLimit,
            CurrentBalance = 0,
            DefaultTax1ProfileId = request.DefaultTax1ProfileId,
            DefaultTax2ProfileId = request.DefaultTax2ProfileId,
            DefaultWhtProfileId = request.DefaultWhtProfileId,
            DefaultApAccountId = request.DefaultApAccountId,
            DefaultExpenseAccountId = request.DefaultExpenseAccountId,
            BankName = request.BankName,
            BankAccountNumber = request.BankAccountNumber,
            BankBranch = request.BankBranch,
            BankSwiftCode = request.BankSwiftCode,
            Notes = request.Notes,
            CreatedBy = _currentUserService.Email ?? "system"
        };

        _context.Vendors.Add(vendor);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created vendor {VendorCode} with ID {VendorId}",
            vendor.VendorCode, vendor.Id);

        return (await GetVendorByIdAsync(vendor.Id))!;
    }

    public async Task<VendorDto> UpdateVendorAsync(Guid id, UpdateVendorRequest request)
    {
        var vendor = await _context.Vendors.FindAsync(id);

        if (vendor == null)
        {
            throw new InvalidOperationException("Vendor not found.");
        }

        vendor.VendorName = request.VendorName;
        vendor.VendorNameLocal = request.VendorNameLocal;
        vendor.ContactPerson = request.ContactPerson;
        vendor.Email = request.Email;
        vendor.Phone = request.Phone;
        vendor.Fax = request.Fax;
        vendor.Address = request.Address;
        vendor.City = request.City;
        vendor.State = request.State;
        vendor.PostalCode = request.PostalCode;
        vendor.Country = request.Country;
        vendor.TaxId = request.TaxId;
        vendor.IsActive = request.IsActive;
        vendor.DefaultPaymentTermId = request.DefaultPaymentTermId;
        vendor.CurrencyCode = request.CurrencyCode;
        vendor.CreditLimit = request.CreditLimit;
        vendor.DefaultTax1ProfileId = request.DefaultTax1ProfileId;
        vendor.DefaultTax2ProfileId = request.DefaultTax2ProfileId;
        vendor.DefaultWhtProfileId = request.DefaultWhtProfileId;
        vendor.DefaultApAccountId = request.DefaultApAccountId;
        vendor.DefaultExpenseAccountId = request.DefaultExpenseAccountId;
        vendor.BankName = request.BankName;
        vendor.BankAccountNumber = request.BankAccountNumber;
        vendor.BankBranch = request.BankBranch;
        vendor.BankSwiftCode = request.BankSwiftCode;
        vendor.Notes = request.Notes;
        vendor.UpdatedBy = _currentUserService.Email;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated vendor {VendorCode}", vendor.VendorCode);

        return (await GetVendorByIdAsync(vendor.Id))!;
    }

    public async Task DeleteVendorAsync(Guid id)
    {
        var vendor = await _context.Vendors
            .Include(v => v.Invoices)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (vendor == null)
        {
            throw new InvalidOperationException("Vendor not found.");
        }

        if (vendor.Invoices.Count > 0)
        {
            throw new InvalidOperationException("Cannot delete vendor with existing invoices.");
        }

        _context.Vendors.Remove(vendor);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted vendor {VendorCode}", vendor.VendorCode);
    }

    public async Task<List<VendorLookupDto>> GetVendorLookupAsync(string? search)
    {
        var queryable = _context.Vendors
            .Where(v => v.IsActive)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            queryable = queryable.Where(v =>
                v.VendorCode.ToLower().Contains(searchLower) ||
                v.VendorName.ToLower().Contains(searchLower));
        }

        return await queryable
            .OrderBy(v => v.VendorCode)
            .Take(50)
            .Select(v => new VendorLookupDto(
                v.Id,
                v.VendorCode,
                v.VendorName,
                v.CurrencyCode,
                v.DefaultPaymentTermId,
                v.DefaultTax1ProfileId,
                v.DefaultTax2ProfileId,
                v.DefaultWhtProfileId,
                v.DefaultApAccountId,
                v.DefaultExpenseAccountId))
            .ToListAsync();
    }

    public async Task<VendorAgingDto> GetVendorAgingAsync(Guid vendorId, DateTime asOfDate)
    {
        var vendor = await _context.Vendors.FindAsync(vendorId);

        if (vendor == null)
        {
            throw new InvalidOperationException("Vendor not found.");
        }

        var unpaidInvoices = await _context.ApInvoices
            .Where(i => i.VendorId == vendorId &&
                        i.BalanceAmount > 0 &&
                        i.Status != ApInvoiceStatus.Void &&
                        i.Status != ApInvoiceStatus.Draft)
            .OrderBy(i => i.DueDate)
            .ToListAsync();

        var agingInvoices = new List<VendorAgingInvoiceDto>();
        decimal current = 0, days1To30 = 0, days31To60 = 0, days61To90 = 0, days90Plus = 0;

        foreach (var invoice in unpaidInvoices)
        {
            var daysOverdue = (asOfDate - invoice.DueDate).Days;
            string bucket;

            if (daysOverdue <= 0)
            {
                bucket = "Current";
                current += invoice.BalanceAmount;
            }
            else if (daysOverdue <= 30)
            {
                bucket = "1-30 Days";
                days1To30 += invoice.BalanceAmount;
            }
            else if (daysOverdue <= 60)
            {
                bucket = "31-60 Days";
                days31To60 += invoice.BalanceAmount;
            }
            else if (daysOverdue <= 90)
            {
                bucket = "61-90 Days";
                days61To90 += invoice.BalanceAmount;
            }
            else
            {
                bucket = "90+ Days";
                days90Plus += invoice.BalanceAmount;
            }

            agingInvoices.Add(new VendorAgingInvoiceDto(
                invoice.Id,
                invoice.InvoiceNumber,
                invoice.VendorInvoiceNumber,
                invoice.InvoiceDate,
                invoice.DueDate,
                Math.Max(0, daysOverdue),
                invoice.TotalAmount,
                invoice.BalanceAmount,
                bucket));
        }

        return new VendorAgingDto(
            vendor.Id,
            vendor.VendorCode,
            vendor.VendorName,
            vendor.CurrencyCode,
            asOfDate,
            current,
            days1To30,
            days31To60,
            days61To90,
            days90Plus,
            current + days1To30 + days31To60 + days61To90 + days90Plus,
            agingInvoices);
    }

    public async Task<List<VendorAgingSummaryDto>> GetAgingReportAsync(DateTime asOfDate)
    {
        var vendors = await _context.Vendors
            .Where(v => v.IsActive)
            .OrderBy(v => v.VendorCode)
            .ToListAsync();

        var unpaidInvoices = await _context.ApInvoices
            .Where(i => i.BalanceAmount > 0 &&
                        i.Status != ApInvoiceStatus.Void &&
                        i.Status != ApInvoiceStatus.Draft)
            .ToListAsync();

        var result = new List<VendorAgingSummaryDto>();

        foreach (var vendor in vendors)
        {
            var vendorInvoices = unpaidInvoices.Where(i => i.VendorId == vendor.Id).ToList();

            if (vendorInvoices.Count == 0)
            {
                continue;
            }

            decimal current = 0, days1To30 = 0, days31To60 = 0, days61To90 = 0, days90Plus = 0;

            foreach (var invoice in vendorInvoices)
            {
                var daysOverdue = (asOfDate - invoice.DueDate).Days;

                if (daysOverdue <= 0)
                    current += invoice.BalanceAmount;
                else if (daysOverdue <= 30)
                    days1To30 += invoice.BalanceAmount;
                else if (daysOverdue <= 60)
                    days31To60 += invoice.BalanceAmount;
                else if (daysOverdue <= 90)
                    days61To90 += invoice.BalanceAmount;
                else
                    days90Plus += invoice.BalanceAmount;
            }

            result.Add(new VendorAgingSummaryDto(
                vendor.Id,
                vendor.VendorCode,
                vendor.VendorName,
                vendor.CurrencyCode,
                current,
                days1To30,
                days31To60,
                days61To90,
                days90Plus,
                current + days1To30 + days31To60 + days61To90 + days90Plus));
        }

        return result;
    }

    public async Task UpdateVendorBalanceAsync(Guid vendorId)
    {
        var vendor = await _context.Vendors.FindAsync(vendorId);

        if (vendor == null)
        {
            throw new InvalidOperationException("Vendor not found.");
        }

        // Calculate current balance from unpaid invoices
        var balance = await _context.ApInvoices
            .Where(i => i.VendorId == vendorId &&
                        i.Status != ApInvoiceStatus.Void &&
                        i.Status != ApInvoiceStatus.Draft)
            .SumAsync(i => i.BalanceAmount);

        vendor.CurrentBalance = balance;
        vendor.UpdatedBy = _currentUserService.Email;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated vendor {VendorCode} balance to {Balance}",
            vendor.VendorCode, balance);
    }

    public async Task<bool> IsVendorCodeUniqueAsync(string vendorCode, Guid? excludeId = null)
    {
        var query = _context.Vendors.Where(v => v.VendorCode == vendorCode);

        if (excludeId.HasValue)
        {
            query = query.Where(v => v.Id != excludeId.Value);
        }

        return !await query.AnyAsync();
    }

    private VendorDto MapToDto(Vendor vendor)
    {
        return new VendorDto(
            Id: vendor.Id,
            VendorCode: vendor.VendorCode,
            VendorName: vendor.VendorName,
            VendorNameLocal: vendor.VendorNameLocal,
            ContactPerson: vendor.ContactPerson,
            Email: vendor.Email,
            Phone: vendor.Phone,
            Fax: vendor.Fax,
            Address: vendor.Address,
            City: vendor.City,
            State: vendor.State,
            PostalCode: vendor.PostalCode,
            Country: vendor.Country,
            TaxId: vendor.TaxId,
            IsActive: vendor.IsActive,
            DefaultPaymentTermId: vendor.DefaultPaymentTermId,
            DefaultPaymentTermName: vendor.DefaultPaymentTerm?.TermName,
            CurrencyCode: vendor.CurrencyCode,
            CreditLimit: vendor.CreditLimit,
            CurrentBalance: vendor.CurrentBalance,
            DefaultTax1ProfileId: vendor.DefaultTax1ProfileId,
            DefaultTax1ProfileName: vendor.DefaultTax1Profile?.TaxName,
            DefaultTax2ProfileId: vendor.DefaultTax2ProfileId,
            DefaultTax2ProfileName: vendor.DefaultTax2Profile?.TaxName,
            DefaultWhtProfileId: vendor.DefaultWhtProfileId,
            DefaultWhtProfileName: vendor.DefaultWhtProfile?.TaxName,
            DefaultApAccountId: vendor.DefaultApAccountId,
            DefaultApAccountCode: vendor.DefaultApAccount?.AccountCode,
            DefaultExpenseAccountId: vendor.DefaultExpenseAccountId,
            DefaultExpenseAccountCode: vendor.DefaultExpenseAccount?.AccountCode,
            BankName: vendor.BankName,
            BankAccountNumber: vendor.BankAccountNumber,
            BankBranch: vendor.BankBranch,
            BankSwiftCode: vendor.BankSwiftCode,
            Notes: vendor.Notes,
            CreatedAt: vendor.CreatedAt,
            CreatedBy: vendor.CreatedBy,
            UpdatedAt: vendor.UpdatedAt);
    }
}
