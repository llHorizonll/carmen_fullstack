using Carmen.Application.DTOs.AR;
using Carmen.Application.DTOs.Common;
using Carmen.Application.Interfaces;
using Carmen.Application.Services.AR;
using Carmen.Domain.Entities.AR;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Services;

public class CustomerService : ICustomerService
{
    private readonly CarmenDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<CustomerService> _logger;

    public CustomerService(
        CarmenDbContext context,
        ICurrentUserService currentUserService,
        ILogger<CustomerService> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<PaginatedResult<CustomerListDto>> GetCustomersAsync(CustomerQueryParams query)
    {
        var queryable = _context.Customers
            .Include(c => c.Invoices)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.ToLower();
            queryable = queryable.Where(c =>
                c.CustomerCode.ToLower().Contains(search) ||
                c.CustomerName.ToLower().Contains(search) ||
                (c.CustomerNameLocal != null && c.CustomerNameLocal.ToLower().Contains(search)) ||
                (c.ContactPerson != null && c.ContactPerson.ToLower().Contains(search)) ||
                (c.Email != null && c.Email.ToLower().Contains(search)));
        }

        if (query.IsActive.HasValue)
        {
            queryable = queryable.Where(c => c.IsActive == query.IsActive.Value);
        }

        // Get total count
        var totalCount = await queryable.CountAsync();

        // Apply sorting
        queryable = query.SortBy.ToLower() switch
        {
            "customername" => query.SortDescending
                ? queryable.OrderByDescending(c => c.CustomerName)
                : queryable.OrderBy(c => c.CustomerName),
            "creditlimit" => query.SortDescending
                ? queryable.OrderByDescending(c => c.CreditLimit)
                : queryable.OrderBy(c => c.CreditLimit),
            "currentbalance" => query.SortDescending
                ? queryable.OrderByDescending(c => c.CurrentBalance)
                : queryable.OrderBy(c => c.CurrentBalance),
            "createdat" => query.SortDescending
                ? queryable.OrderByDescending(c => c.CreatedAt)
                : queryable.OrderBy(c => c.CreatedAt),
            _ => query.SortDescending
                ? queryable.OrderByDescending(c => c.CustomerCode)
                : queryable.OrderBy(c => c.CustomerCode)
        };

        // Apply pagination
        var items = await queryable
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(c => new CustomerListDto(
                c.Id,
                c.CustomerCode,
                c.CustomerName,
                c.ContactPerson,
                c.Email,
                c.Phone,
                c.IsActive,
                c.CurrencyCode,
                c.CreditLimit,
                c.CurrentBalance,
                c.Invoices.Count,
                c.CreatedAt))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize);

        return new PaginatedResult<CustomerListDto>(items, totalCount, query.Page, query.PageSize, totalPages);
    }

    public async Task<CustomerDto?> GetCustomerByIdAsync(Guid id)
    {
        var customer = await _context.Customers
            .Include(c => c.DefaultPaymentTerm)
            .Include(c => c.DefaultTax1Profile)
            .Include(c => c.DefaultTax2Profile)
            .Include(c => c.DefaultWhtProfile)
            .Include(c => c.DefaultArAccount)
            .Include(c => c.DefaultRevenueAccount)
            .FirstOrDefaultAsync(c => c.Id == id);

        return customer == null ? null : MapToDto(customer);
    }

    public async Task<CustomerDto?> GetCustomerByCodeAsync(string customerCode)
    {
        var customer = await _context.Customers
            .Include(c => c.DefaultPaymentTerm)
            .Include(c => c.DefaultTax1Profile)
            .Include(c => c.DefaultTax2Profile)
            .Include(c => c.DefaultWhtProfile)
            .Include(c => c.DefaultArAccount)
            .Include(c => c.DefaultRevenueAccount)
            .FirstOrDefaultAsync(c => c.CustomerCode == customerCode);

        return customer == null ? null : MapToDto(customer);
    }

    public async Task<CustomerDto> CreateCustomerAsync(CreateCustomerRequest request)
    {
        var tenantId = _currentUserService.TenantId
            ?? throw new InvalidOperationException("Tenant context is required.");

        // Check customer code uniqueness
        if (!await IsCustomerCodeUniqueAsync(request.CustomerCode))
        {
            throw new InvalidOperationException($"Customer code '{request.CustomerCode}' already exists.");
        }

        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            CustomerCode = request.CustomerCode,
            CustomerName = request.CustomerName,
            CustomerNameLocal = request.CustomerNameLocal,
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
            DefaultArAccountId = request.DefaultArAccountId,
            DefaultRevenueAccountId = request.DefaultRevenueAccountId,
            BankName = request.BankName,
            BankAccountNumber = request.BankAccountNumber,
            BankBranch = request.BankBranch,
            BankSwiftCode = request.BankSwiftCode,
            Notes = request.Notes,
            CreatedBy = _currentUserService.Email ?? "system"
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created customer {CustomerCode} with ID {CustomerId}",
            customer.CustomerCode, customer.Id);

        return (await GetCustomerByIdAsync(customer.Id))!;
    }

    public async Task<CustomerDto> UpdateCustomerAsync(Guid id, UpdateCustomerRequest request)
    {
        var customer = await _context.Customers.FindAsync(id);

        if (customer == null)
        {
            throw new InvalidOperationException("Customer not found.");
        }

        customer.CustomerName = request.CustomerName;
        customer.CustomerNameLocal = request.CustomerNameLocal;
        customer.ContactPerson = request.ContactPerson;
        customer.Email = request.Email;
        customer.Phone = request.Phone;
        customer.Fax = request.Fax;
        customer.Address = request.Address;
        customer.City = request.City;
        customer.State = request.State;
        customer.PostalCode = request.PostalCode;
        customer.Country = request.Country;
        customer.TaxId = request.TaxId;
        customer.IsActive = request.IsActive;
        customer.DefaultPaymentTermId = request.DefaultPaymentTermId;
        customer.CurrencyCode = request.CurrencyCode;
        customer.CreditLimit = request.CreditLimit;
        customer.DefaultTax1ProfileId = request.DefaultTax1ProfileId;
        customer.DefaultTax2ProfileId = request.DefaultTax2ProfileId;
        customer.DefaultWhtProfileId = request.DefaultWhtProfileId;
        customer.DefaultArAccountId = request.DefaultArAccountId;
        customer.DefaultRevenueAccountId = request.DefaultRevenueAccountId;
        customer.BankName = request.BankName;
        customer.BankAccountNumber = request.BankAccountNumber;
        customer.BankBranch = request.BankBranch;
        customer.BankSwiftCode = request.BankSwiftCode;
        customer.Notes = request.Notes;
        customer.UpdatedBy = _currentUserService.Email;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated customer {CustomerCode}", customer.CustomerCode);

        return (await GetCustomerByIdAsync(customer.Id))!;
    }

    public async Task DeleteCustomerAsync(Guid id)
    {
        var customer = await _context.Customers
            .Include(c => c.Invoices)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (customer == null)
        {
            throw new InvalidOperationException("Customer not found.");
        }

        if (customer.Invoices.Count > 0)
        {
            throw new InvalidOperationException("Cannot delete customer with existing invoices.");
        }

        _context.Customers.Remove(customer);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted customer {CustomerCode}", customer.CustomerCode);
    }

    public async Task<List<CustomerLookupDto>> GetCustomerLookupAsync(string? search)
    {
        var queryable = _context.Customers
            .Where(c => c.IsActive)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            queryable = queryable.Where(c =>
                c.CustomerCode.ToLower().Contains(searchLower) ||
                c.CustomerName.ToLower().Contains(searchLower));
        }

        return await queryable
            .OrderBy(c => c.CustomerCode)
            .Take(50)
            .Select(c => new CustomerLookupDto(
                c.Id,
                c.CustomerCode,
                c.CustomerName,
                c.CurrencyCode,
                c.DefaultPaymentTermId,
                c.DefaultTax1ProfileId,
                c.DefaultTax2ProfileId,
                c.DefaultWhtProfileId,
                c.DefaultArAccountId,
                c.DefaultRevenueAccountId))
            .ToListAsync();
    }

    public async Task<CustomerAgingDto> GetCustomerAgingAsync(Guid customerId, DateTime asOfDate)
    {
        var customer = await _context.Customers.FindAsync(customerId);

        if (customer == null)
        {
            throw new InvalidOperationException("Customer not found.");
        }

        var unpaidInvoices = await _context.ArInvoices
            .Where(i => i.CustomerId == customerId &&
                        i.BalanceAmount > 0 &&
                        i.Status != ArInvoiceStatus.Void &&
                        i.Status != ArInvoiceStatus.Draft)
            .OrderBy(i => i.DueDate)
            .ToListAsync();

        var agingInvoices = new List<CustomerAgingInvoiceDto>();
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

            agingInvoices.Add(new CustomerAgingInvoiceDto(
                invoice.Id,
                invoice.InvoiceNumber,
                invoice.CustomerReference,
                invoice.InvoiceDate,
                invoice.DueDate,
                Math.Max(0, daysOverdue),
                invoice.TotalAmount,
                invoice.BalanceAmount,
                bucket));
        }

        return new CustomerAgingDto(
            customer.Id,
            customer.CustomerCode,
            customer.CustomerName,
            customer.CurrencyCode,
            asOfDate,
            current,
            days1To30,
            days31To60,
            days61To90,
            days90Plus,
            current + days1To30 + days31To60 + days61To90 + days90Plus,
            agingInvoices);
    }

    public async Task<List<CustomerAgingSummaryDto>> GetAgingReportAsync(DateTime asOfDate)
    {
        var customers = await _context.Customers
            .Where(c => c.IsActive)
            .OrderBy(c => c.CustomerCode)
            .ToListAsync();

        var unpaidInvoices = await _context.ArInvoices
            .Where(i => i.BalanceAmount > 0 &&
                        i.Status != ArInvoiceStatus.Void &&
                        i.Status != ArInvoiceStatus.Draft)
            .ToListAsync();

        var result = new List<CustomerAgingSummaryDto>();

        foreach (var customer in customers)
        {
            var customerInvoices = unpaidInvoices.Where(i => i.CustomerId == customer.Id).ToList();

            if (customerInvoices.Count == 0)
            {
                continue;
            }

            decimal current = 0, days1To30 = 0, days31To60 = 0, days61To90 = 0, days90Plus = 0;

            foreach (var invoice in customerInvoices)
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

            result.Add(new CustomerAgingSummaryDto(
                customer.Id,
                customer.CustomerCode,
                customer.CustomerName,
                customer.CurrencyCode,
                current,
                days1To30,
                days31To60,
                days61To90,
                days90Plus,
                current + days1To30 + days31To60 + days61To90 + days90Plus));
        }

        return result;
    }

    public async Task UpdateCustomerBalanceAsync(Guid customerId)
    {
        var customer = await _context.Customers.FindAsync(customerId);

        if (customer == null)
        {
            throw new InvalidOperationException("Customer not found.");
        }

        // Calculate current balance from unpaid invoices
        var balance = await _context.ArInvoices
            .Where(i => i.CustomerId == customerId &&
                        i.Status != ArInvoiceStatus.Void &&
                        i.Status != ArInvoiceStatus.Draft)
            .SumAsync(i => i.BalanceAmount);

        customer.CurrentBalance = balance;
        customer.UpdatedBy = _currentUserService.Email;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated customer {CustomerCode} balance to {Balance}",
            customer.CustomerCode, balance);
    }

    public async Task<bool> IsCustomerCodeUniqueAsync(string customerCode, Guid? excludeId = null)
    {
        var query = _context.Customers.Where(c => c.CustomerCode == customerCode);

        if (excludeId.HasValue)
        {
            query = query.Where(c => c.Id != excludeId.Value);
        }

        return !await query.AnyAsync();
    }

    private CustomerDto MapToDto(Customer customer)
    {
        return new CustomerDto(
            Id: customer.Id,
            CustomerCode: customer.CustomerCode,
            CustomerName: customer.CustomerName,
            CustomerNameLocal: customer.CustomerNameLocal,
            ContactPerson: customer.ContactPerson,
            Email: customer.Email,
            Phone: customer.Phone,
            Fax: customer.Fax,
            Address: customer.Address,
            City: customer.City,
            State: customer.State,
            PostalCode: customer.PostalCode,
            Country: customer.Country,
            TaxId: customer.TaxId,
            IsActive: customer.IsActive,
            DefaultPaymentTermId: customer.DefaultPaymentTermId,
            DefaultPaymentTermName: customer.DefaultPaymentTerm?.TermName,
            CurrencyCode: customer.CurrencyCode,
            CreditLimit: customer.CreditLimit,
            CurrentBalance: customer.CurrentBalance,
            DefaultTax1ProfileId: customer.DefaultTax1ProfileId,
            DefaultTax1ProfileName: customer.DefaultTax1Profile?.TaxName,
            DefaultTax2ProfileId: customer.DefaultTax2ProfileId,
            DefaultTax2ProfileName: customer.DefaultTax2Profile?.TaxName,
            DefaultWhtProfileId: customer.DefaultWhtProfileId,
            DefaultWhtProfileName: customer.DefaultWhtProfile?.TaxName,
            DefaultArAccountId: customer.DefaultArAccountId,
            DefaultArAccountCode: customer.DefaultArAccount?.AccountCode,
            DefaultRevenueAccountId: customer.DefaultRevenueAccountId,
            DefaultRevenueAccountCode: customer.DefaultRevenueAccount?.AccountCode,
            BankName: customer.BankName,
            BankAccountNumber: customer.BankAccountNumber,
            BankBranch: customer.BankBranch,
            BankSwiftCode: customer.BankSwiftCode,
            Notes: customer.Notes,
            CreatedAt: customer.CreatedAt,
            CreatedBy: customer.CreatedBy,
            UpdatedAt: customer.UpdatedAt);
    }
}
