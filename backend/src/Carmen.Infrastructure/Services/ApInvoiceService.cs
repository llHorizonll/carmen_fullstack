using Carmen.Application.DTOs.AP;
using Carmen.Application.DTOs.Common;
using Carmen.Application.Interfaces;
using Carmen.Application.Services.AP;
using Carmen.Application.Services.Workflow;
using Carmen.Domain.Entities.AP;
using Carmen.Domain.Entities.GL;
using Carmen.Domain.Entities.Workflow;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Services;

public class ApInvoiceService : IApInvoiceService
{
    private readonly CarmenDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IWorkflowService _workflowService;
    private readonly ILogger<ApInvoiceService> _logger;

    public ApInvoiceService(
        CarmenDbContext context,
        ICurrentUserService currentUserService,
        IWorkflowService workflowService,
        ILogger<ApInvoiceService> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _workflowService = workflowService;
        _logger = logger;
    }

    public async Task<PaginatedResult<ApInvoiceListDto>> GetInvoicesAsync(ApInvoiceQueryParams query)
    {
        var queryable = _context.ApInvoices
            .Include(i => i.Vendor)
            .Include(i => i.Lines)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.ToLower();
            queryable = queryable.Where(i =>
                i.InvoiceNumber.ToLower().Contains(search) ||
                (i.VendorInvoiceNumber != null && i.VendorInvoiceNumber.ToLower().Contains(search)) ||
                i.Vendor.VendorCode.ToLower().Contains(search) ||
                i.Vendor.VendorName.ToLower().Contains(search));
        }

        if (query.Status.HasValue)
        {
            queryable = queryable.Where(i => i.Status == query.Status.Value);
        }

        if (query.VendorId.HasValue)
        {
            queryable = queryable.Where(i => i.VendorId == query.VendorId.Value);
        }

        if (query.DateFrom.HasValue)
        {
            queryable = queryable.Where(i => i.InvoiceDate >= query.DateFrom.Value);
        }

        if (query.DateTo.HasValue)
        {
            queryable = queryable.Where(i => i.InvoiceDate <= query.DateTo.Value);
        }

        if (query.DueDateFrom.HasValue)
        {
            queryable = queryable.Where(i => i.DueDate >= query.DueDateFrom.Value);
        }

        if (query.DueDateTo.HasValue)
        {
            queryable = queryable.Where(i => i.DueDate <= query.DueDateTo.Value);
        }

        if (query.HasBalance.HasValue)
        {
            queryable = query.HasBalance.Value
                ? queryable.Where(i => i.BalanceAmount > 0)
                : queryable.Where(i => i.BalanceAmount == 0);
        }

        if (query.FiscalPeriodId.HasValue)
        {
            queryable = queryable.Where(i => i.FiscalPeriodId == query.FiscalPeriodId.Value);
        }

        // Get total count
        var totalCount = await queryable.CountAsync();

        // Apply sorting
        var today = DateTime.Today;
        queryable = query.SortBy.ToLower() switch
        {
            "invoicenumber" => query.SortDescending
                ? queryable.OrderByDescending(i => i.InvoiceNumber)
                : queryable.OrderBy(i => i.InvoiceNumber),
            "duedate" => query.SortDescending
                ? queryable.OrderByDescending(i => i.DueDate)
                : queryable.OrderBy(i => i.DueDate),
            "vendorcode" => query.SortDescending
                ? queryable.OrderByDescending(i => i.Vendor.VendorCode)
                : queryable.OrderBy(i => i.Vendor.VendorCode),
            "totalamount" => query.SortDescending
                ? queryable.OrderByDescending(i => i.TotalAmount)
                : queryable.OrderBy(i => i.TotalAmount),
            "status" => query.SortDescending
                ? queryable.OrderByDescending(i => i.Status)
                : queryable.OrderBy(i => i.Status),
            _ => query.SortDescending
                ? queryable.OrderByDescending(i => i.InvoiceDate)
                : queryable.OrderBy(i => i.InvoiceDate)
        };

        // Apply pagination
        var items = await queryable
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(i => new ApInvoiceListDto(
                i.Id,
                i.InvoiceNumber,
                i.VendorInvoiceNumber,
                i.InvoiceDate,
                i.DueDate,
                i.Status,
                i.Vendor.VendorCode,
                i.Vendor.VendorName,
                i.CurrencyCode,
                i.TotalAmount,
                i.PaidAmount,
                i.BalanceAmount,
                i.DueDate < today ? EF.Functions.DateDiffDay(i.DueDate, today) : 0,
                i.Lines.Count,
                i.CreatedAt))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize);

        return new PaginatedResult<ApInvoiceListDto>(items, totalCount, query.Page, query.PageSize, totalPages);
    }

    public async Task<ApInvoiceDto?> GetInvoiceByIdAsync(Guid id)
    {
        var invoice = await _context.ApInvoices
            .Include(i => i.Vendor)
            .Include(i => i.Tax1Profile)
            .Include(i => i.Tax2Profile)
            .Include(i => i.WhtProfile)
            .Include(i => i.PaymentTerm)
            .Include(i => i.FiscalPeriod)
            .Include(i => i.ApAccount)
            .Include(i => i.Lines)
                .ThenInclude(l => l.Account)
            .Include(i => i.Lines)
                .ThenInclude(l => l.Tax1Profile)
            .Include(i => i.Lines)
                .ThenInclude(l => l.Department)
            .FirstOrDefaultAsync(i => i.Id == id);

        return invoice == null ? null : MapToDto(invoice);
    }

    public async Task<ApInvoiceDto?> GetInvoiceByNumberAsync(string invoiceNumber)
    {
        var invoice = await _context.ApInvoices
            .Include(i => i.Vendor)
            .Include(i => i.Tax1Profile)
            .Include(i => i.Tax2Profile)
            .Include(i => i.WhtProfile)
            .Include(i => i.PaymentTerm)
            .Include(i => i.FiscalPeriod)
            .Include(i => i.ApAccount)
            .Include(i => i.Lines)
                .ThenInclude(l => l.Account)
            .FirstOrDefaultAsync(i => i.InvoiceNumber == invoiceNumber);

        return invoice == null ? null : MapToDto(invoice);
    }

    public async Task<ApInvoiceDto> CreateInvoiceAsync(CreateApInvoiceRequest request)
    {
        // Validate
        var errors = await ValidateInvoiceAsync(request);
        if (errors.Count > 0)
        {
            throw new InvalidOperationException(string.Join("; ", errors));
        }

        var tenantId = _currentUserService.TenantId
            ?? throw new InvalidOperationException("Tenant context is required.");

        // Get vendor for defaults
        var vendor = await _context.Vendors.FindAsync(request.VendorId);
        if (vendor == null)
        {
            throw new InvalidOperationException("Vendor not found.");
        }

        // Generate invoice number
        var invoiceNumber = await GenerateInvoiceNumberAsync(request.InvoiceDate);

        // Calculate line totals and taxes
        var lineNumber = 1;
        var lines = new List<ApInvoiceLine>();
        decimal subTotal = 0;
        decimal lineTax1Total = 0;

        foreach (var lineRequest in request.Lines)
        {
            var amount = lineRequest.Quantity * lineRequest.UnitPrice;
            var discountAmount = amount * (lineRequest.DiscountPercent / 100);
            var netAmount = amount - discountAmount;

            // Calculate line-level tax1
            decimal lineTax1Amount = 0;
            if (lineRequest.Tax1ProfileId.HasValue)
            {
                var lineTaxProfile = await _context.TaxProfiles.FindAsync(lineRequest.Tax1ProfileId.Value);
                if (lineTaxProfile != null)
                {
                    lineTax1Amount = netAmount * (lineTaxProfile.TaxRate / 100);
                }
            }

            var line = new ApInvoiceLine
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                LineNumber = lineNumber++,
                AccountId = lineRequest.AccountId,
                Description = lineRequest.Description,
                Quantity = lineRequest.Quantity,
                Unit = lineRequest.Unit,
                UnitPrice = lineRequest.UnitPrice,
                Amount = amount,
                AmountBase = amount * request.ExchangeRate,
                DiscountPercent = lineRequest.DiscountPercent,
                DiscountAmount = discountAmount,
                NetAmount = netAmount,
                Tax1ProfileId = lineRequest.Tax1ProfileId,
                Tax1Amount = lineTax1Amount,
                DepartmentId = lineRequest.DepartmentId,
                ProjectCode = lineRequest.ProjectCode,
                CreatedBy = _currentUserService.Email ?? "system"
            };

            lines.Add(line);
            subTotal += netAmount;
            lineTax1Total += lineTax1Amount;
        }

        // Calculate header-level taxes (three-tier)
        var taxResult = await CalculateTaxesAsync(new CalculateTaxRequest(
            subTotal,
            request.Tax1ProfileId,
            request.Tax2ProfileId,
            request.WhtProfileId));

        var invoice = new ApInvoice
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            InvoiceNumber = invoiceNumber,
            VendorInvoiceNumber = request.VendorInvoiceNumber,
            InvoiceDate = request.InvoiceDate,
            DueDate = request.DueDate,
            Status = ApInvoiceStatus.Draft,
            VendorId = request.VendorId,
            CurrencyCode = request.CurrencyCode,
            ExchangeRate = request.ExchangeRate,
            SubTotal = subTotal,
            Tax1ProfileId = request.Tax1ProfileId,
            Tax1Amount = taxResult.Tax1Amount,
            Tax2ProfileId = request.Tax2ProfileId,
            Tax2Amount = taxResult.Tax2Amount,
            WhtProfileId = request.WhtProfileId,
            WhtAmount = taxResult.WhtAmount,
            TotalAmount = taxResult.TotalAmount,
            NetAmount = taxResult.NetAmount,
            PaidAmount = 0,
            BalanceAmount = taxResult.NetAmount,
            SubTotalBase = subTotal * request.ExchangeRate,
            TotalAmountBase = taxResult.TotalAmount * request.ExchangeRate,
            NetAmountBase = taxResult.NetAmount * request.ExchangeRate,
            PaymentTermId = request.PaymentTermId,
            Description = request.Description,
            Reference = request.Reference,
            FiscalPeriodId = request.FiscalPeriodId,
            ApAccountId = request.ApAccountId ?? vendor.DefaultApAccountId,
            CreatedBy = _currentUserService.Email ?? "system"
        };

        // Assign lines to invoice
        foreach (var line in lines)
        {
            line.ApInvoiceId = invoice.Id;
            invoice.Lines.Add(line);
        }

        _context.ApInvoices.Add(invoice);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created AP invoice {InvoiceNumber} with ID {InvoiceId}",
            invoice.InvoiceNumber, invoice.Id);

        return (await GetInvoiceByIdAsync(invoice.Id))!;
    }

    public async Task<ApInvoiceDto> UpdateInvoiceAsync(Guid id, UpdateApInvoiceRequest request)
    {
        var invoice = await _context.ApInvoices
            .Include(i => i.Lines)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null)
        {
            throw new InvalidOperationException("Invoice not found.");
        }

        if (invoice.Status != ApInvoiceStatus.Draft)
        {
            throw new InvalidOperationException("Only draft invoices can be updated.");
        }

        var tenantId = _currentUserService.TenantId!.Value;

        // Remove existing lines
        _context.ApInvoiceLines.RemoveRange(invoice.Lines);

        // Calculate new line totals
        var lineNumber = 1;
        decimal subTotal = 0;

        foreach (var lineRequest in request.Lines)
        {
            var amount = lineRequest.Quantity * lineRequest.UnitPrice;
            var discountAmount = amount * (lineRequest.DiscountPercent / 100);
            var netAmount = amount - discountAmount;

            // Calculate line-level tax1
            decimal lineTax1Amount = 0;
            if (lineRequest.Tax1ProfileId.HasValue)
            {
                var lineTaxProfile = await _context.TaxProfiles.FindAsync(lineRequest.Tax1ProfileId.Value);
                if (lineTaxProfile != null)
                {
                    lineTax1Amount = netAmount * (lineTaxProfile.TaxRate / 100);
                }
            }

            var line = new ApInvoiceLine
            {
                Id = lineRequest.Id ?? Guid.NewGuid(),
                TenantId = tenantId,
                ApInvoiceId = invoice.Id,
                LineNumber = lineNumber++,
                AccountId = lineRequest.AccountId,
                Description = lineRequest.Description,
                Quantity = lineRequest.Quantity,
                Unit = lineRequest.Unit,
                UnitPrice = lineRequest.UnitPrice,
                Amount = amount,
                AmountBase = amount * request.ExchangeRate,
                DiscountPercent = lineRequest.DiscountPercent,
                DiscountAmount = discountAmount,
                NetAmount = netAmount,
                Tax1ProfileId = lineRequest.Tax1ProfileId,
                Tax1Amount = lineTax1Amount,
                DepartmentId = lineRequest.DepartmentId,
                ProjectCode = lineRequest.ProjectCode,
                CreatedBy = _currentUserService.Email ?? "system"
            };

            _context.ApInvoiceLines.Add(line);
            subTotal += netAmount;
        }

        // Recalculate header-level taxes
        var taxResult = await CalculateTaxesAsync(new CalculateTaxRequest(
            subTotal,
            request.Tax1ProfileId,
            request.Tax2ProfileId,
            request.WhtProfileId));

        // Update invoice
        invoice.VendorInvoiceNumber = request.VendorInvoiceNumber;
        invoice.InvoiceDate = request.InvoiceDate;
        invoice.DueDate = request.DueDate;
        invoice.CurrencyCode = request.CurrencyCode;
        invoice.ExchangeRate = request.ExchangeRate;
        invoice.SubTotal = subTotal;
        invoice.Tax1ProfileId = request.Tax1ProfileId;
        invoice.Tax1Amount = taxResult.Tax1Amount;
        invoice.Tax2ProfileId = request.Tax2ProfileId;
        invoice.Tax2Amount = taxResult.Tax2Amount;
        invoice.WhtProfileId = request.WhtProfileId;
        invoice.WhtAmount = taxResult.WhtAmount;
        invoice.TotalAmount = taxResult.TotalAmount;
        invoice.NetAmount = taxResult.NetAmount;
        invoice.BalanceAmount = taxResult.NetAmount - invoice.PaidAmount;
        invoice.SubTotalBase = subTotal * request.ExchangeRate;
        invoice.TotalAmountBase = taxResult.TotalAmount * request.ExchangeRate;
        invoice.NetAmountBase = taxResult.NetAmount * request.ExchangeRate;
        invoice.PaymentTermId = request.PaymentTermId;
        invoice.Description = request.Description;
        invoice.Reference = request.Reference;
        invoice.FiscalPeriodId = request.FiscalPeriodId;
        invoice.ApAccountId = request.ApAccountId;
        invoice.UpdatedBy = _currentUserService.Email;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated AP invoice {InvoiceNumber}", invoice.InvoiceNumber);

        return (await GetInvoiceByIdAsync(invoice.Id))!;
    }

    public async Task DeleteInvoiceAsync(Guid id)
    {
        var invoice = await _context.ApInvoices
            .Include(i => i.Lines)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null)
        {
            throw new InvalidOperationException("Invoice not found.");
        }

        if (invoice.Status != ApInvoiceStatus.Draft)
        {
            throw new InvalidOperationException("Only draft invoices can be deleted.");
        }

        _context.ApInvoiceLines.RemoveRange(invoice.Lines);
        _context.ApInvoices.Remove(invoice);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted AP invoice {InvoiceNumber}", invoice.InvoiceNumber);
    }

    public async Task<ApInvoiceDto> SubmitForApprovalAsync(Guid id, SubmitApInvoiceRequest request)
    {
        var invoice = await _context.ApInvoices.FindAsync(id);

        if (invoice == null)
        {
            throw new InvalidOperationException("Invoice not found.");
        }

        if (invoice.Status != ApInvoiceStatus.Draft)
        {
            throw new InvalidOperationException("Only draft invoices can be submitted for approval.");
        }

        invoice.Status = ApInvoiceStatus.Pending;
        invoice.UpdatedBy = _currentUserService.Email;
        await _context.SaveChangesAsync();

        // Submit to workflow engine if a workflow definition is configured
        if (_currentUserService.TenantId.HasValue && _currentUserService.UserId.HasValue)
        {
            var workflowInstance = await _workflowService.SubmitForApprovalAsync(
                _currentUserService.TenantId.Value,
                WorkflowEntityType.ApInvoice,
                invoice.Id,
                invoice.InvoiceNumber,
                invoice.TotalAmount,
                _currentUserService.UserId.Value);

            if (workflowInstance != null)
            {
                _logger.LogInformation("AP invoice {InvoiceNumber} submitted to workflow {WorkflowId}",
                    invoice.InvoiceNumber, workflowInstance.Id);
            }
        }

        _logger.LogInformation("Submitted AP invoice {InvoiceNumber} for approval", invoice.InvoiceNumber);

        return (await GetInvoiceByIdAsync(id))!;
    }

    public async Task<ApInvoiceDto> ApproveInvoiceAsync(Guid id, ApproveApInvoiceRequest request)
    {
        var invoice = await _context.ApInvoices.FindAsync(id);

        if (invoice == null)
        {
            throw new InvalidOperationException("Invoice not found.");
        }

        if (invoice.Status != ApInvoiceStatus.Pending)
        {
            throw new InvalidOperationException("Only pending invoices can be approved.");
        }

        invoice.Status = ApInvoiceStatus.Approved;
        invoice.ApprovedAt = DateTime.UtcNow;
        invoice.ApprovedBy = _currentUserService.Email;
        invoice.UpdatedBy = _currentUserService.Email;
        await _context.SaveChangesAsync();

        // Update vendor balance
        await UpdateVendorBalanceForInvoiceAsync(invoice.VendorId);

        _logger.LogInformation("Approved AP invoice {InvoiceNumber}", invoice.InvoiceNumber);

        return (await GetInvoiceByIdAsync(id))!;
    }

    public async Task<ApInvoiceDto> RejectInvoiceAsync(Guid id, RejectApInvoiceRequest request)
    {
        var invoice = await _context.ApInvoices.FindAsync(id);

        if (invoice == null)
        {
            throw new InvalidOperationException("Invoice not found.");
        }

        if (invoice.Status != ApInvoiceStatus.Pending)
        {
            throw new InvalidOperationException("Only pending invoices can be rejected.");
        }

        invoice.Status = ApInvoiceStatus.Rejected;
        invoice.RejectionReason = request.Reason;
        invoice.UpdatedBy = _currentUserService.Email;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Rejected AP invoice {InvoiceNumber}: {Reason}",
            invoice.InvoiceNumber, request.Reason);

        return (await GetInvoiceByIdAsync(id))!;
    }

    public async Task<ApInvoiceDto> VoidInvoiceAsync(Guid id, VoidApInvoiceRequest request)
    {
        var invoice = await _context.ApInvoices.FindAsync(id);

        if (invoice == null)
        {
            throw new InvalidOperationException("Invoice not found.");
        }

        if (invoice.Status == ApInvoiceStatus.Paid)
        {
            throw new InvalidOperationException("Paid invoices cannot be voided.");
        }

        if (invoice.PaidAmount > 0)
        {
            throw new InvalidOperationException("Invoices with payments cannot be voided. Void the payments first.");
        }

        var previousStatus = invoice.Status;
        invoice.Status = ApInvoiceStatus.Void;
        invoice.VoidReason = request.Reason;
        invoice.BalanceAmount = 0;
        invoice.UpdatedBy = _currentUserService.Email;
        await _context.SaveChangesAsync();

        // Update vendor balance if was approved
        if (previousStatus == ApInvoiceStatus.Approved || previousStatus == ApInvoiceStatus.PartiallyPaid)
        {
            await UpdateVendorBalanceForInvoiceAsync(invoice.VendorId);
        }

        _logger.LogInformation("Voided AP invoice {InvoiceNumber}: {Reason}",
            invoice.InvoiceNumber, request.Reason);

        return (await GetInvoiceByIdAsync(id))!;
    }

    public async Task<string> GenerateInvoiceNumberAsync(DateTime invoiceDate)
    {
        var prefix = "AP";
        var yearMonth = invoiceDate.ToString("yyyyMM");

        var lastNumber = await _context.ApInvoices
            .Where(i => i.InvoiceNumber.StartsWith($"{prefix}{yearMonth}"))
            .Select(i => i.InvoiceNumber)
            .OrderByDescending(n => n)
            .FirstOrDefaultAsync();

        int nextNumber = 1;
        if (lastNumber != null && lastNumber.Length > 8)
        {
            var numPart = lastNumber.Substring(8);
            if (int.TryParse(numPart, out int parsed))
            {
                nextNumber = parsed + 1;
            }
        }

        return $"{prefix}{yearMonth}{nextNumber:D4}";
    }

    public async Task<TaxCalculationResult> CalculateTaxesAsync(CalculateTaxRequest request)
    {
        decimal tax1Rate = 0, tax1Amount = 0;
        decimal tax2Rate = 0, tax2Amount = 0;
        decimal whtRate = 0, whtAmount = 0;
        string? tax1Name = null, tax2Name = null, whtName = null;

        // Tax 1 (e.g., VAT)
        if (request.Tax1ProfileId.HasValue)
        {
            var tax1Profile = await _context.TaxProfiles.FindAsync(request.Tax1ProfileId.Value);
            if (tax1Profile != null)
            {
                tax1Rate = tax1Profile.TaxRate;
                tax1Amount = request.SubTotal * (tax1Rate / 100);
                tax1Name = tax1Profile.TaxName;
            }
        }

        // Tax 2 (e.g., Service Tax)
        if (request.Tax2ProfileId.HasValue)
        {
            var tax2Profile = await _context.TaxProfiles.FindAsync(request.Tax2ProfileId.Value);
            if (tax2Profile != null)
            {
                tax2Rate = tax2Profile.TaxRate;
                tax2Amount = request.SubTotal * (tax2Rate / 100);
                tax2Name = tax2Profile.TaxName;
            }
        }

        // Calculate total before WHT
        var totalAmount = request.SubTotal + tax1Amount + tax2Amount;

        // Withholding Tax (deducted from total)
        if (request.WhtProfileId.HasValue)
        {
            var whtProfile = await _context.TaxProfiles.FindAsync(request.WhtProfileId.Value);
            if (whtProfile != null)
            {
                whtRate = whtProfile.TaxRate;
                // WHT is calculated on subtotal, not total with taxes
                whtAmount = request.SubTotal * (whtRate / 100);
                whtName = whtProfile.TaxName;
            }
        }

        // Net amount = Total - WHT (what we actually pay)
        var netAmount = totalAmount - whtAmount;

        return new TaxCalculationResult(
            SubTotal: request.SubTotal,
            Tax1ProfileId: request.Tax1ProfileId,
            Tax1ProfileName: tax1Name,
            Tax1Rate: tax1Rate,
            Tax1Amount: tax1Amount,
            Tax2ProfileId: request.Tax2ProfileId,
            Tax2ProfileName: tax2Name,
            Tax2Rate: tax2Rate,
            Tax2Amount: tax2Amount,
            WhtProfileId: request.WhtProfileId,
            WhtProfileName: whtName,
            WhtRate: whtRate,
            WhtAmount: whtAmount,
            TotalAmount: totalAmount,
            NetAmount: netAmount);
    }

    public async Task<List<UnpaidInvoiceDto>> GetUnpaidInvoicesAsync(Guid vendorId)
    {
        var today = DateTime.Today;

        return await _context.ApInvoices
            .Where(i => i.VendorId == vendorId &&
                        i.BalanceAmount > 0 &&
                        (i.Status == ApInvoiceStatus.Approved || i.Status == ApInvoiceStatus.PartiallyPaid))
            .OrderBy(i => i.DueDate)
            .Select(i => new UnpaidInvoiceDto(
                i.Id,
                i.InvoiceNumber,
                i.VendorInvoiceNumber,
                i.InvoiceDate,
                i.DueDate,
                i.DueDate < today ? EF.Functions.DateDiffDay(i.DueDate, today) : 0,
                i.CurrencyCode,
                i.TotalAmount,
                i.PaidAmount,
                i.BalanceAmount))
            .ToListAsync();
    }

    public async Task UpdateInvoicePaidAmountAsync(Guid invoiceId, decimal paidAmount)
    {
        var invoice = await _context.ApInvoices.FindAsync(invoiceId);

        if (invoice == null)
        {
            throw new InvalidOperationException("Invoice not found.");
        }

        invoice.PaidAmount = paidAmount;
        invoice.BalanceAmount = invoice.NetAmount - paidAmount;

        // Update status based on balance
        if (invoice.BalanceAmount <= 0)
        {
            invoice.Status = ApInvoiceStatus.Paid;
        }
        else if (paidAmount > 0)
        {
            invoice.Status = ApInvoiceStatus.PartiallyPaid;
        }

        invoice.UpdatedBy = _currentUserService.Email;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated AP invoice {InvoiceNumber} paid amount to {PaidAmount}",
            invoice.InvoiceNumber, paidAmount);
    }

    public async Task<List<string>> ValidateInvoiceAsync(CreateApInvoiceRequest request)
    {
        var errors = new List<string>();

        // Check lines exist
        if (request.Lines.Count == 0)
        {
            errors.Add("At least one line is required.");
            return errors;
        }

        // Check vendor exists
        var vendor = await _context.Vendors.FindAsync(request.VendorId);
        if (vendor == null)
        {
            errors.Add("Vendor not found.");
        }
        else if (!vendor.IsActive)
        {
            errors.Add("Vendor is inactive.");
        }

        // Check accounts exist
        var accountIds = request.Lines.Select(l => l.AccountId).Distinct().ToList();
        var accounts = await _context.ChartOfAccounts
            .Where(a => accountIds.Contains(a.Id))
            .ToListAsync();

        var foundIds = accounts.Select(a => a.Id).ToHashSet();
        foreach (var accountId in accountIds)
        {
            if (!foundIds.Contains(accountId))
            {
                errors.Add($"Account {accountId} not found.");
            }
        }

        foreach (var account in accounts)
        {
            if (!account.AllowPosting)
            {
                errors.Add($"Account {account.AccountCode} does not allow posting.");
            }
            if (!account.IsActive)
            {
                errors.Add($"Account {account.AccountCode} is inactive.");
            }
        }

        // Check fiscal period is open
        var fiscalPeriod = await _context.FiscalPeriods.FindAsync(request.FiscalPeriodId);
        if (fiscalPeriod == null)
        {
            errors.Add("Fiscal period not found.");
        }
        else if (fiscalPeriod.Status != PeriodStatus.Open)
        {
            errors.Add("Fiscal period is not open.");
        }

        // Check line amounts are positive
        foreach (var line in request.Lines)
        {
            if (line.Quantity <= 0)
            {
                errors.Add("Line quantity must be positive.");
            }
            if (line.UnitPrice < 0)
            {
                errors.Add("Line unit price cannot be negative.");
            }
            if (line.DiscountPercent < 0 || line.DiscountPercent > 100)
            {
                errors.Add("Line discount percent must be between 0 and 100.");
            }
        }

        return errors;
    }

    public async Task<(bool IsExceeded, decimal CreditLimit, decimal CurrentBalance, decimal InvoiceAmount)>
        CheckCreditLimitAsync(Guid vendorId, decimal invoiceAmount)
    {
        var vendor = await _context.Vendors.FindAsync(vendorId);

        if (vendor == null)
        {
            throw new InvalidOperationException("Vendor not found.");
        }

        if (vendor.CreditLimit <= 0)
        {
            // No credit limit set
            return (false, 0, vendor.CurrentBalance, invoiceAmount);
        }

        var newBalance = vendor.CurrentBalance + invoiceAmount;
        var isExceeded = newBalance > vendor.CreditLimit;

        return (isExceeded, vendor.CreditLimit, vendor.CurrentBalance, invoiceAmount);
    }

    private async Task UpdateVendorBalanceForInvoiceAsync(Guid vendorId)
    {
        var vendor = await _context.Vendors.FindAsync(vendorId);
        if (vendor == null) return;

        var balance = await _context.ApInvoices
            .Where(i => i.VendorId == vendorId &&
                        i.Status != ApInvoiceStatus.Void &&
                        i.Status != ApInvoiceStatus.Draft &&
                        i.Status != ApInvoiceStatus.Rejected)
            .SumAsync(i => i.BalanceAmount);

        vendor.CurrentBalance = balance;
        vendor.UpdatedBy = _currentUserService.Email;
        await _context.SaveChangesAsync();
    }

    private ApInvoiceDto MapToDto(ApInvoice invoice)
    {
        var today = DateTime.Today;

        return new ApInvoiceDto(
            Id: invoice.Id,
            InvoiceNumber: invoice.InvoiceNumber,
            VendorInvoiceNumber: invoice.VendorInvoiceNumber,
            InvoiceDate: invoice.InvoiceDate,
            DueDate: invoice.DueDate,
            Status: invoice.Status,
            VendorId: invoice.VendorId,
            VendorCode: invoice.Vendor?.VendorCode ?? "",
            VendorName: invoice.Vendor?.VendorName ?? "",
            CurrencyCode: invoice.CurrencyCode,
            ExchangeRate: invoice.ExchangeRate,
            SubTotal: invoice.SubTotal,
            Tax1ProfileId: invoice.Tax1ProfileId,
            Tax1ProfileName: invoice.Tax1Profile?.TaxName,
            Tax1Rate: invoice.Tax1Profile?.TaxRate,
            Tax1Amount: invoice.Tax1Amount,
            Tax2ProfileId: invoice.Tax2ProfileId,
            Tax2ProfileName: invoice.Tax2Profile?.TaxName,
            Tax2Rate: invoice.Tax2Profile?.TaxRate,
            Tax2Amount: invoice.Tax2Amount,
            WhtProfileId: invoice.WhtProfileId,
            WhtProfileName: invoice.WhtProfile?.TaxName,
            WhtRate: invoice.WhtProfile?.TaxRate,
            WhtAmount: invoice.WhtAmount,
            TotalAmount: invoice.TotalAmount,
            NetAmount: invoice.NetAmount,
            PaidAmount: invoice.PaidAmount,
            BalanceAmount: invoice.BalanceAmount,
            SubTotalBase: invoice.SubTotalBase,
            TotalAmountBase: invoice.TotalAmountBase,
            NetAmountBase: invoice.NetAmountBase,
            PaymentTermId: invoice.PaymentTermId,
            PaymentTermName: invoice.PaymentTerm?.TermName,
            Description: invoice.Description,
            Reference: invoice.Reference,
            FiscalPeriodId: invoice.FiscalPeriodId,
            FiscalPeriodName: invoice.FiscalPeriod?.Name,
            ApAccountId: invoice.ApAccountId,
            ApAccountCode: invoice.ApAccount?.AccountCode,
            ApprovedAt: invoice.ApprovedAt,
            ApprovedBy: invoice.ApprovedBy,
            PostedAt: invoice.PostedAt,
            PostedBy: invoice.PostedBy,
            RejectionReason: invoice.RejectionReason,
            VoidReason: invoice.VoidReason,
            JournalVoucherId: invoice.JournalVoucherId,
            Lines: invoice.Lines.OrderBy(l => l.LineNumber).Select(l => new ApInvoiceLineDto(
                Id: l.Id,
                LineNumber: l.LineNumber,
                AccountId: l.AccountId,
                AccountCode: l.Account?.AccountCode ?? "",
                AccountName: l.Account?.AccountName ?? "",
                Description: l.Description,
                Quantity: l.Quantity,
                Unit: l.Unit,
                UnitPrice: l.UnitPrice,
                Amount: l.Amount,
                AmountBase: l.AmountBase,
                DiscountPercent: l.DiscountPercent,
                DiscountAmount: l.DiscountAmount,
                NetAmount: l.NetAmount,
                Tax1ProfileId: l.Tax1ProfileId,
                Tax1ProfileName: l.Tax1Profile?.TaxName,
                Tax1Amount: l.Tax1Amount,
                DepartmentId: l.DepartmentId,
                DepartmentName: l.Department?.DepartmentName,
                ProjectCode: l.ProjectCode)).ToList(),
            CreatedAt: invoice.CreatedAt,
            CreatedBy: invoice.CreatedBy,
            UpdatedAt: invoice.UpdatedAt);
    }
}
