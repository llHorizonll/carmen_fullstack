using Carmen.Application.DTOs.AP;
using Carmen.Application.DTOs.Common;
using Carmen.Application.Interfaces;
using Carmen.Application.Services.AP;
using Carmen.Domain.Entities.AP;
using Carmen.Domain.Entities.GL;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Services;

public class ApPaymentService : IApPaymentService
{
    private readonly CarmenDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IApInvoiceService _invoiceService;
    private readonly ILogger<ApPaymentService> _logger;

    public ApPaymentService(
        CarmenDbContext context,
        ICurrentUserService currentUserService,
        IApInvoiceService invoiceService,
        ILogger<ApPaymentService> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _invoiceService = invoiceService;
        _logger = logger;
    }

    public async Task<PaginatedResult<ApPaymentListDto>> GetPaymentsAsync(ApPaymentQueryParams query)
    {
        var queryable = _context.ApPayments
            .Include(p => p.Vendor)
            .Include(p => p.Lines)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.ToLower();
            queryable = queryable.Where(p =>
                p.PaymentNumber.ToLower().Contains(search) ||
                (p.CheckNumber != null && p.CheckNumber.ToLower().Contains(search)) ||
                (p.BankReference != null && p.BankReference.ToLower().Contains(search)) ||
                p.Vendor.VendorCode.ToLower().Contains(search) ||
                p.Vendor.VendorName.ToLower().Contains(search));
        }

        if (query.Status.HasValue)
        {
            queryable = queryable.Where(p => p.Status == query.Status.Value);
        }

        if (query.VendorId.HasValue)
        {
            queryable = queryable.Where(p => p.VendorId == query.VendorId.Value);
        }

        if (query.PaymentMethod.HasValue)
        {
            queryable = queryable.Where(p => p.PaymentMethod == query.PaymentMethod.Value);
        }

        if (query.DateFrom.HasValue)
        {
            queryable = queryable.Where(p => p.PaymentDate >= query.DateFrom.Value);
        }

        if (query.DateTo.HasValue)
        {
            queryable = queryable.Where(p => p.PaymentDate <= query.DateTo.Value);
        }

        if (query.FiscalPeriodId.HasValue)
        {
            queryable = queryable.Where(p => p.FiscalPeriodId == query.FiscalPeriodId.Value);
        }

        // Get total count
        var totalCount = await queryable.CountAsync();

        // Apply sorting
        queryable = query.SortBy.ToLower() switch
        {
            "paymentnumber" => query.SortDescending
                ? queryable.OrderByDescending(p => p.PaymentNumber)
                : queryable.OrderBy(p => p.PaymentNumber),
            "vendorcode" => query.SortDescending
                ? queryable.OrderByDescending(p => p.Vendor.VendorCode)
                : queryable.OrderBy(p => p.Vendor.VendorCode),
            "totalamount" => query.SortDescending
                ? queryable.OrderByDescending(p => p.TotalAmount)
                : queryable.OrderBy(p => p.TotalAmount),
            "status" => query.SortDescending
                ? queryable.OrderByDescending(p => p.Status)
                : queryable.OrderBy(p => p.Status),
            _ => query.SortDescending
                ? queryable.OrderByDescending(p => p.PaymentDate)
                : queryable.OrderBy(p => p.PaymentDate)
        };

        // Apply pagination
        var items = await queryable
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(p => new ApPaymentListDto(
                p.Id,
                p.PaymentNumber,
                p.PaymentDate,
                p.Status,
                p.Vendor.VendorCode,
                p.Vendor.VendorName,
                p.PaymentMethod,
                p.CheckNumber,
                p.CurrencyCode,
                p.TotalAmount,
                p.BankAccount.AccountCode,
                p.Lines.Count,
                p.CreatedAt))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize);

        return new PaginatedResult<ApPaymentListDto>(items, totalCount, query.Page, query.PageSize, totalPages);
    }

    public async Task<ApPaymentDto?> GetPaymentByIdAsync(Guid id)
    {
        var payment = await _context.ApPayments
            .Include(p => p.Vendor)
            .Include(p => p.BankAccount)
            .Include(p => p.FiscalPeriod)
            .Include(p => p.Lines)
                .ThenInclude(l => l.ApInvoice)
            .FirstOrDefaultAsync(p => p.Id == id);

        return payment == null ? null : MapToDto(payment);
    }

    public async Task<ApPaymentDto?> GetPaymentByNumberAsync(string paymentNumber)
    {
        var payment = await _context.ApPayments
            .Include(p => p.Vendor)
            .Include(p => p.BankAccount)
            .Include(p => p.FiscalPeriod)
            .Include(p => p.Lines)
                .ThenInclude(l => l.ApInvoice)
            .FirstOrDefaultAsync(p => p.PaymentNumber == paymentNumber);

        return payment == null ? null : MapToDto(payment);
    }

    public async Task<ApPaymentDto> CreatePaymentAsync(CreateApPaymentRequest request)
    {
        // Validate
        var errors = await ValidatePaymentAsync(request);
        if (errors.Count > 0)
        {
            throw new InvalidOperationException(string.Join("; ", errors));
        }

        var tenantId = _currentUserService.TenantId
            ?? throw new InvalidOperationException("Tenant context is required.");

        // Get vendor
        var vendor = await _context.Vendors.FindAsync(request.VendorId);
        if (vendor == null)
        {
            throw new InvalidOperationException("Vendor not found.");
        }

        // Generate payment number
        var paymentNumber = await GeneratePaymentNumberAsync(request.PaymentDate);

        var payment = new ApPayment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            PaymentNumber = paymentNumber,
            PaymentDate = request.PaymentDate,
            Status = ApPaymentStatus.Draft,
            VendorId = request.VendorId,
            BankAccountId = request.BankAccountId,
            PaymentMethod = request.PaymentMethod,
            CurrencyCode = request.CurrencyCode,
            ExchangeRate = request.ExchangeRate,
            TotalAmount = request.TotalAmount,
            AllocatedAmount = 0,
            TotalAmountBase = request.TotalAmount * request.ExchangeRate,
            CheckNumber = request.CheckNumber,
            BankReference = request.BankReference,
            Description = request.Description,
            FiscalPeriodId = request.FiscalPeriodId,
            CreatedBy = _currentUserService.Email ?? "system"
        };

        // Add allocation lines
        var lineNumber = 1;
        decimal totalAllocated = 0;

        foreach (var lineRequest in request.Lines)
        {
            var invoice = await _context.ApInvoices.FindAsync(lineRequest.ApInvoiceId);
            if (invoice == null)
            {
                throw new InvalidOperationException($"Invoice {lineRequest.ApInvoiceId} not found.");
            }

            if (lineRequest.AmountAllocated > invoice.BalanceAmount)
            {
                throw new InvalidOperationException(
                    $"Allocation amount {lineRequest.AmountAllocated:N2} exceeds invoice balance {invoice.BalanceAmount:N2}.");
            }

            // Calculate exchange gain/loss
            var exchangeGainLoss = await CalculateExchangeGainLossAsync(
                invoice.Id,
                lineRequest.AmountAllocated,
                request.ExchangeRate);

            var line = new ApPaymentLine
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                ApPaymentId = payment.Id,
                ApInvoiceId = lineRequest.ApInvoiceId,
                LineNumber = lineNumber++,
                AmountAllocated = lineRequest.AmountAllocated,
                AmountAllocatedBase = lineRequest.AmountAllocated * request.ExchangeRate,
                DiscountAmount = lineRequest.DiscountAmount,
                WhtAmount = lineRequest.WhtAmount,
                ExchangeGainLoss = exchangeGainLoss,
                CreatedBy = _currentUserService.Email ?? "system"
            };

            payment.Lines.Add(line);
            totalAllocated += lineRequest.AmountAllocated;
        }

        payment.AllocatedAmount = totalAllocated;

        _context.ApPayments.Add(payment);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created AP payment {PaymentNumber} with ID {PaymentId}",
            payment.PaymentNumber, payment.Id);

        return (await GetPaymentByIdAsync(payment.Id))!;
    }

    public async Task<ApPaymentDto> UpdatePaymentAsync(Guid id, UpdateApPaymentRequest request)
    {
        var payment = await _context.ApPayments
            .Include(p => p.Lines)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (payment == null)
        {
            throw new InvalidOperationException("Payment not found.");
        }

        if (payment.Status != ApPaymentStatus.Draft)
        {
            throw new InvalidOperationException("Only draft payments can be updated.");
        }

        var tenantId = _currentUserService.TenantId!.Value;

        // Remove existing lines
        _context.ApPaymentLines.RemoveRange(payment.Lines);

        // Update payment
        payment.PaymentDate = request.PaymentDate;
        payment.BankAccountId = request.BankAccountId;
        payment.PaymentMethod = request.PaymentMethod;
        payment.CurrencyCode = request.CurrencyCode;
        payment.ExchangeRate = request.ExchangeRate;
        payment.TotalAmount = request.TotalAmount;
        payment.TotalAmountBase = request.TotalAmount * request.ExchangeRate;
        payment.CheckNumber = request.CheckNumber;
        payment.BankReference = request.BankReference;
        payment.Description = request.Description;
        payment.FiscalPeriodId = request.FiscalPeriodId;
        payment.UpdatedBy = _currentUserService.Email;

        // Add new allocation lines
        var lineNumber = 1;
        decimal totalAllocated = 0;

        foreach (var lineRequest in request.Lines)
        {
            var invoice = await _context.ApInvoices.FindAsync(lineRequest.ApInvoiceId);
            if (invoice == null)
            {
                throw new InvalidOperationException($"Invoice {lineRequest.ApInvoiceId} not found.");
            }

            var exchangeGainLoss = await CalculateExchangeGainLossAsync(
                invoice.Id,
                lineRequest.AmountAllocated,
                request.ExchangeRate);

            var line = new ApPaymentLine
            {
                Id = lineRequest.Id ?? Guid.NewGuid(),
                TenantId = tenantId,
                ApPaymentId = payment.Id,
                ApInvoiceId = lineRequest.ApInvoiceId,
                LineNumber = lineNumber++,
                AmountAllocated = lineRequest.AmountAllocated,
                AmountAllocatedBase = lineRequest.AmountAllocated * request.ExchangeRate,
                DiscountAmount = lineRequest.DiscountAmount,
                WhtAmount = lineRequest.WhtAmount,
                ExchangeGainLoss = exchangeGainLoss,
                CreatedBy = _currentUserService.Email ?? "system"
            };

            _context.ApPaymentLines.Add(line);
            totalAllocated += lineRequest.AmountAllocated;
        }

        payment.AllocatedAmount = totalAllocated;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated AP payment {PaymentNumber}", payment.PaymentNumber);

        return (await GetPaymentByIdAsync(payment.Id))!;
    }

    public async Task DeletePaymentAsync(Guid id)
    {
        var payment = await _context.ApPayments
            .Include(p => p.Lines)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (payment == null)
        {
            throw new InvalidOperationException("Payment not found.");
        }

        if (payment.Status != ApPaymentStatus.Draft)
        {
            throw new InvalidOperationException("Only draft payments can be deleted.");
        }

        _context.ApPaymentLines.RemoveRange(payment.Lines);
        _context.ApPayments.Remove(payment);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted AP payment {PaymentNumber}", payment.PaymentNumber);
    }

    public async Task<ApPaymentDto> ApprovePaymentAsync(Guid id, ApproveApPaymentRequest request)
    {
        var payment = await _context.ApPayments.FindAsync(id);

        if (payment == null)
        {
            throw new InvalidOperationException("Payment not found.");
        }

        if (payment.Status != ApPaymentStatus.Draft && payment.Status != ApPaymentStatus.Pending)
        {
            throw new InvalidOperationException("Only draft or pending payments can be approved.");
        }

        payment.Status = ApPaymentStatus.Approved;
        payment.ApprovedAt = DateTime.UtcNow;
        payment.ApprovedBy = _currentUserService.Email;
        payment.UpdatedBy = _currentUserService.Email;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Approved AP payment {PaymentNumber}", payment.PaymentNumber);

        return (await GetPaymentByIdAsync(id))!;
    }

    public async Task<ApPaymentDto> PostPaymentAsync(Guid id, PostApPaymentRequest request)
    {
        var payment = await _context.ApPayments
            .Include(p => p.Vendor)
            .Include(p => p.BankAccount)
            .Include(p => p.Lines)
                .ThenInclude(l => l.ApInvoice)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (payment == null)
        {
            throw new InvalidOperationException("Payment not found.");
        }

        if (payment.Status != ApPaymentStatus.Approved)
        {
            throw new InvalidOperationException("Only approved payments can be posted.");
        }

        // Check fiscal period is open
        var fiscalPeriod = await _context.FiscalPeriods.FindAsync(payment.FiscalPeriodId);
        if (fiscalPeriod == null || fiscalPeriod.Status != PeriodStatus.Open)
        {
            throw new InvalidOperationException("Fiscal period is closed or not found.");
        }

        var tenantId = _currentUserService.TenantId!.Value;

        // Create GL journal voucher for the payment
        var journalVoucher = await CreatePaymentJournalVoucherAsync(payment, tenantId);

        // Update invoice paid amounts
        foreach (var line in payment.Lines)
        {
            var invoice = line.ApInvoice;
            var newPaidAmount = invoice.PaidAmount + line.AmountAllocated;
            await _invoiceService.UpdateInvoicePaidAmountAsync(invoice.Id, newPaidAmount);
        }

        // Update payment status
        payment.Status = ApPaymentStatus.Posted;
        payment.PostedAt = DateTime.UtcNow;
        payment.PostedBy = _currentUserService.Email;
        payment.JournalVoucherId = journalVoucher.Id;
        payment.UpdatedBy = _currentUserService.Email;
        await _context.SaveChangesAsync();

        // Update vendor balance
        await UpdateVendorBalanceAsync(payment.VendorId);

        _logger.LogInformation("Posted AP payment {PaymentNumber} with JV {JvNumber}",
            payment.PaymentNumber, journalVoucher.VoucherNumber);

        return (await GetPaymentByIdAsync(id))!;
    }

    public async Task<ApPaymentDto> VoidPaymentAsync(Guid id, VoidApPaymentRequest request)
    {
        var payment = await _context.ApPayments
            .Include(p => p.Lines)
                .ThenInclude(l => l.ApInvoice)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (payment == null)
        {
            throw new InvalidOperationException("Payment not found.");
        }

        if (payment.Status != ApPaymentStatus.Posted)
        {
            throw new InvalidOperationException("Only posted payments can be voided.");
        }

        var tenantId = _currentUserService.TenantId!.Value;

        // Reverse invoice paid amounts
        foreach (var line in payment.Lines)
        {
            var invoice = line.ApInvoice;
            var newPaidAmount = invoice.PaidAmount - line.AmountAllocated;
            await _invoiceService.UpdateInvoicePaidAmountAsync(invoice.Id, Math.Max(0, newPaidAmount));
        }

        // Create reversing journal voucher if original was posted
        if (payment.JournalVoucherId.HasValue)
        {
            await CreateReversalJournalVoucherAsync(payment, tenantId, request.Reason);
        }

        payment.Status = ApPaymentStatus.Void;
        payment.VoidReason = request.Reason;
        payment.UpdatedBy = _currentUserService.Email;
        await _context.SaveChangesAsync();

        // Update vendor balance
        await UpdateVendorBalanceAsync(payment.VendorId);

        _logger.LogInformation("Voided AP payment {PaymentNumber}: {Reason}",
            payment.PaymentNumber, request.Reason);

        return (await GetPaymentByIdAsync(id))!;
    }

    public async Task<string> GeneratePaymentNumberAsync(DateTime paymentDate)
    {
        var prefix = "PV";
        var yearMonth = paymentDate.ToString("yyyyMM");

        var lastNumber = await _context.ApPayments
            .Where(p => p.PaymentNumber.StartsWith($"{prefix}{yearMonth}"))
            .Select(p => p.PaymentNumber)
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

    public async Task<AutoAllocateResult> AutoAllocateAsync(AutoAllocateRequest request)
    {
        // Get unpaid invoices for vendor, sorted by due date (FIFO)
        var unpaidInvoices = await _context.ApInvoices
            .Where(i => i.VendorId == request.VendorId &&
                        i.BalanceAmount > 0 &&
                        (i.Status == ApInvoiceStatus.Approved || i.Status == ApInvoiceStatus.PartiallyPaid))
            .OrderBy(i => i.DueDate)
            .ThenBy(i => i.InvoiceNumber)
            .ToListAsync();

        var suggestions = new List<AllocationSuggestion>();
        var remainingAmount = request.TotalAmount;

        foreach (var invoice in unpaidInvoices)
        {
            if (remainingAmount <= 0)
                break;

            var allocateAmount = Math.Min(remainingAmount, invoice.BalanceAmount);

            suggestions.Add(new AllocationSuggestion(
                InvoiceId: invoice.Id,
                InvoiceNumber: invoice.InvoiceNumber,
                DueDate: invoice.DueDate,
                InvoiceBalance: invoice.BalanceAmount,
                SuggestedAmount: allocateAmount,
                WhtAmount: 0));

            remainingAmount -= allocateAmount;
        }

        return new AutoAllocateResult(
            TotalAllocated: request.TotalAmount - remainingAmount,
            Remaining: remainingAmount,
            Allocations: suggestions);
    }

    public async Task<List<string>> ValidatePaymentAsync(CreateApPaymentRequest request)
    {
        var errors = new List<string>();

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

        // Check bank account exists
        var bankAccount = await _context.ChartOfAccounts.FindAsync(request.BankAccountId);
        if (bankAccount == null)
        {
            errors.Add("Bank account not found.");
        }
        else if (!bankAccount.IsActive)
        {
            errors.Add("Bank account is inactive.");
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

        // Check allocation amounts
        decimal totalAllocated = 0;
        foreach (var line in request.Lines)
        {
            var invoice = await _context.ApInvoices.FindAsync(line.ApInvoiceId);
            if (invoice == null)
            {
                errors.Add($"Invoice {line.ApInvoiceId} not found.");
                continue;
            }

            if (invoice.VendorId != request.VendorId)
            {
                errors.Add($"Invoice {invoice.InvoiceNumber} belongs to a different vendor.");
            }

            if (invoice.Status != ApInvoiceStatus.Approved && invoice.Status != ApInvoiceStatus.PartiallyPaid)
            {
                errors.Add($"Invoice {invoice.InvoiceNumber} is not approved or partially paid.");
            }

            if (line.AmountAllocated <= 0)
            {
                errors.Add("Allocation amount must be positive.");
            }

            if (line.AmountAllocated > invoice.BalanceAmount)
            {
                errors.Add($"Allocation {line.AmountAllocated:N2} exceeds invoice {invoice.InvoiceNumber} balance {invoice.BalanceAmount:N2}.");
            }

            totalAllocated += line.AmountAllocated;
        }

        if (totalAllocated > request.TotalAmount)
        {
            errors.Add($"Total allocated {totalAllocated:N2} exceeds payment amount {request.TotalAmount:N2}.");
        }

        return errors;
    }

    public async Task<decimal> CalculateExchangeGainLossAsync(
        Guid invoiceId,
        decimal allocationAmount,
        decimal paymentExchangeRate)
    {
        var invoice = await _context.ApInvoices.FindAsync(invoiceId);
        if (invoice == null)
        {
            return 0;
        }

        // Calculate the ratio of allocation to total invoice amount
        var allocationRatio = allocationAmount / invoice.NetAmount;

        // Original base amount for this allocation
        var originalBaseAmount = invoice.NetAmountBase * allocationRatio;

        // Current base amount at payment exchange rate
        var currentBaseAmount = allocationAmount * paymentExchangeRate;

        // Exchange gain (positive) or loss (negative)
        // If current rate is higher, we pay more in base currency = loss
        // If current rate is lower, we pay less in base currency = gain
        var exchangeGainLoss = originalBaseAmount - currentBaseAmount;

        return exchangeGainLoss;
    }

    private async Task<JournalVoucher> CreatePaymentJournalVoucherAsync(ApPayment payment, Guid tenantId)
    {
        // Get AP account from vendor or system default
        var vendor = await _context.Vendors
            .Include(v => v.DefaultApAccount)
            .FirstOrDefaultAsync(v => v.Id == payment.VendorId);

        var apAccountId = vendor?.DefaultApAccountId
            ?? throw new InvalidOperationException("No AP account configured for vendor.");

        // Get bank account (BankAccountId references a ChartOfAccount directly)
        var bankAccount = await _context.ChartOfAccounts
            .FirstOrDefaultAsync(b => b.Id == payment.BankAccountId);

        if (bankAccount == null)
        {
            throw new InvalidOperationException("Bank account not found.");
        }

        var bankGlAccountId = bankAccount.Id;

        // Generate JV number
        var yearMonth = payment.PaymentDate.ToString("yyyyMM");
        var lastJv = await _context.JournalVouchers
            .Where(j => j.VoucherNumber.StartsWith($"AP{yearMonth}"))
            .OrderByDescending(j => j.VoucherNumber)
            .FirstOrDefaultAsync();

        int nextNum = 1;
        if (lastJv != null && lastJv.VoucherNumber.Length > 8)
        {
            if (int.TryParse(lastJv.VoucherNumber.Substring(8), out int parsed))
            {
                nextNum = parsed + 1;
            }
        }

        var jvNumber = $"AP{yearMonth}{nextNum:D4}";

        var journalVoucher = new JournalVoucher
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            VoucherNumber = jvNumber,
            VoucherDate = payment.PaymentDate,
            PostingDate = payment.PaymentDate,
            VoucherType = VoucherType.General,
            Status = DocumentStatus.Posted,
            Description = $"AP Payment {payment.PaymentNumber} to {vendor?.VendorName}",
            Reference = payment.PaymentNumber,
            CurrencyCode = payment.CurrencyCode,
            ExchangeRate = payment.ExchangeRate,
            FiscalPeriodId = payment.FiscalPeriodId,
            TotalDebit = payment.AllocatedAmount,
            TotalCredit = payment.AllocatedAmount,
            PostedAt = DateTime.UtcNow,
            PostedBy = _currentUserService.Email,
            CreatedBy = _currentUserService.Email ?? "system"
        };

        // Debit AP (reduce liability)
        journalVoucher.Lines.Add(new JournalVoucherLine
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            JournalVoucherId = journalVoucher.Id,
            LineNumber = 1,
            AccountId = apAccountId,
            DebitAmount = payment.AllocatedAmount,
            CreditAmount = 0,
            DebitAmountBase = payment.AllocatedAmount * payment.ExchangeRate,
            CreditAmountBase = 0,
            Description = $"Payment to {vendor?.VendorName}",
            Reference = payment.PaymentNumber,
            CreatedBy = _currentUserService.Email ?? "system"
        });

        // Credit Bank (reduce asset)
        journalVoucher.Lines.Add(new JournalVoucherLine
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            JournalVoucherId = journalVoucher.Id,
            LineNumber = 2,
            AccountId = bankGlAccountId,
            DebitAmount = 0,
            CreditAmount = payment.AllocatedAmount,
            DebitAmountBase = 0,
            CreditAmountBase = payment.AllocatedAmount * payment.ExchangeRate,
            Description = $"Payment to {vendor?.VendorName}",
            Reference = payment.PaymentNumber,
            CreatedBy = _currentUserService.Email ?? "system"
        });

        // Handle exchange gain/loss if any
        var totalExchangeGainLoss = payment.Lines.Sum(l => l.ExchangeGainLoss);
        if (totalExchangeGainLoss != 0)
        {
            // Get exchange gain/loss account from system settings
            var exchangeAccount = await _context.ChartOfAccounts
                .FirstOrDefaultAsync(a => a.AccountCode == "7100" || a.AccountName.Contains("Exchange"));

            if (exchangeAccount != null)
            {
                if (totalExchangeGainLoss > 0)
                {
                    // Exchange gain - credit
                    journalVoucher.Lines.Add(new JournalVoucherLine
                    {
                        Id = Guid.NewGuid(),
                        TenantId = tenantId,
                        JournalVoucherId = journalVoucher.Id,
                        LineNumber = 3,
                        AccountId = exchangeAccount.Id,
                        DebitAmount = 0,
                        CreditAmount = totalExchangeGainLoss,
                        DebitAmountBase = 0,
                        CreditAmountBase = totalExchangeGainLoss,
                        Description = "Exchange gain",
                        Reference = payment.PaymentNumber,
                        CreatedBy = _currentUserService.Email ?? "system"
                    });

                    journalVoucher.TotalCredit += totalExchangeGainLoss;
                }
                else
                {
                    // Exchange loss - debit
                    journalVoucher.Lines.Add(new JournalVoucherLine
                    {
                        Id = Guid.NewGuid(),
                        TenantId = tenantId,
                        JournalVoucherId = journalVoucher.Id,
                        LineNumber = 3,
                        AccountId = exchangeAccount.Id,
                        DebitAmount = Math.Abs(totalExchangeGainLoss),
                        CreditAmount = 0,
                        DebitAmountBase = Math.Abs(totalExchangeGainLoss),
                        CreditAmountBase = 0,
                        Description = "Exchange loss",
                        Reference = payment.PaymentNumber,
                        CreatedBy = _currentUserService.Email ?? "system"
                    });

                    journalVoucher.TotalDebit += Math.Abs(totalExchangeGainLoss);
                }
            }
        }

        _context.JournalVouchers.Add(journalVoucher);
        await _context.SaveChangesAsync();

        return journalVoucher;
    }

    private async Task CreateReversalJournalVoucherAsync(ApPayment payment, Guid tenantId, string reason)
    {
        var originalJv = await _context.JournalVouchers
            .Include(j => j.Lines)
            .FirstOrDefaultAsync(j => j.Id == payment.JournalVoucherId);

        if (originalJv == null)
        {
            return;
        }

        // Generate reversal JV number
        var yearMonth = DateTime.UtcNow.ToString("yyyyMM");
        var lastJv = await _context.JournalVouchers
            .Where(j => j.VoucherNumber.StartsWith($"RV{yearMonth}"))
            .OrderByDescending(j => j.VoucherNumber)
            .FirstOrDefaultAsync();

        int nextNum = 1;
        if (lastJv != null && lastJv.VoucherNumber.Length > 8)
        {
            if (int.TryParse(lastJv.VoucherNumber.Substring(8), out int parsed))
            {
                nextNum = parsed + 1;
            }
        }

        var reversalJv = new JournalVoucher
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            VoucherNumber = $"RV{yearMonth}{nextNum:D4}",
            VoucherDate = DateTime.UtcNow,
            PostingDate = DateTime.UtcNow,
            VoucherType = VoucherType.Reversal,
            Status = DocumentStatus.Posted,
            Description = $"Reversal of {originalJv.VoucherNumber}: {reason}",
            Reference = originalJv.VoucherNumber,
            CurrencyCode = originalJv.CurrencyCode,
            ExchangeRate = originalJv.ExchangeRate,
            FiscalPeriodId = originalJv.FiscalPeriodId,
            TotalDebit = originalJv.TotalCredit,
            TotalCredit = originalJv.TotalDebit,
            ReversalOfId = originalJv.Id,
            PostedAt = DateTime.UtcNow,
            PostedBy = _currentUserService.Email,
            CreatedBy = _currentUserService.Email ?? "system"
        };

        // Reverse lines (swap debit/credit)
        var lineNumber = 1;
        foreach (var line in originalJv.Lines)
        {
            reversalJv.Lines.Add(new JournalVoucherLine
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                JournalVoucherId = reversalJv.Id,
                LineNumber = lineNumber++,
                AccountId = line.AccountId,
                DebitAmount = line.CreditAmount,
                CreditAmount = line.DebitAmount,
                DebitAmountBase = line.CreditAmountBase,
                CreditAmountBase = line.DebitAmountBase,
                Description = $"Reversal: {line.Description}",
                Reference = line.Reference,
                DepartmentId = line.DepartmentId,
                CreatedBy = _currentUserService.Email ?? "system"
            });
        }

        // Mark original as reversed
        originalJv.ReversedById = reversalJv.Id;

        _context.JournalVouchers.Add(reversalJv);
        await _context.SaveChangesAsync();
    }

    private async Task UpdateVendorBalanceAsync(Guid vendorId)
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

    private ApPaymentDto MapToDto(ApPayment payment)
    {
        return new ApPaymentDto(
            Id: payment.Id,
            PaymentNumber: payment.PaymentNumber,
            PaymentDate: payment.PaymentDate,
            Status: payment.Status,
            VendorId: payment.VendorId,
            VendorCode: payment.Vendor?.VendorCode ?? "",
            VendorName: payment.Vendor?.VendorName ?? "",
            PaymentMethod: payment.PaymentMethod,
            CheckNumber: payment.CheckNumber,
            CheckDate: payment.CheckDate,
            BankReference: payment.BankReference,
            CurrencyCode: payment.CurrencyCode,
            ExchangeRate: payment.ExchangeRate,
            TotalAmount: payment.TotalAmount,
            TotalAmountBase: payment.TotalAmountBase,
            AllocatedAmount: payment.AllocatedAmount,
            UnallocatedAmount: payment.UnallocatedAmount,
            BankAccountId: payment.BankAccountId,
            BankAccountCode: payment.BankAccount?.AccountCode ?? "",
            BankAccountName: payment.BankAccount?.AccountName ?? "",
            Description: payment.Description,
            Reference: payment.Reference,
            PayeeName: payment.PayeeName,
            FiscalPeriodId: payment.FiscalPeriodId,
            FiscalPeriodName: payment.FiscalPeriod?.Name,
            ApprovedAt: payment.ApprovedAt,
            ApprovedBy: payment.ApprovedBy,
            PostedAt: payment.PostedAt,
            PostedBy: payment.PostedBy,
            VoidReason: payment.VoidReason,
            JournalVoucherId: payment.JournalVoucherId,
            Lines: payment.Lines.OrderBy(l => l.LineNumber).Select(l => new ApPaymentLineDto(
                Id: l.Id,
                LineNumber: l.LineNumber,
                ApInvoiceId: l.ApInvoiceId,
                InvoiceNumber: l.ApInvoice?.InvoiceNumber ?? "",
                VendorInvoiceNumber: l.ApInvoice?.VendorInvoiceNumber,
                InvoiceDate: l.ApInvoice?.InvoiceDate ?? DateTime.MinValue,
                DueDate: l.ApInvoice?.DueDate ?? DateTime.MinValue,
                InvoiceTotalAmount: l.ApInvoice?.TotalAmount ?? 0,
                InvoiceBalanceBefore: l.ApInvoice?.BalanceAmount ?? 0,
                AmountAllocated: l.AmountAllocated,
                AmountAllocatedBase: l.AmountAllocatedBase,
                DiscountAmount: l.DiscountAmount,
                WhtAmount: l.WhtAmount,
                ExchangeGainLoss: l.ExchangeGainLoss,
                Notes: null)).ToList(),
            CreatedAt: payment.CreatedAt,
            CreatedBy: payment.CreatedBy,
            UpdatedAt: payment.UpdatedAt);
    }
}
