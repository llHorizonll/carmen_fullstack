using Carmen.Application.DTOs.AR;
using Carmen.Application.DTOs.Common;
using Carmen.Application.Interfaces;
using Carmen.Application.Services.AR;
using Carmen.Domain.Entities.AR;
using Carmen.Domain.Entities.GL;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Services;

public class ArReceiptService : IArReceiptService
{
    private readonly CarmenDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IArInvoiceService _invoiceService;
    private readonly ILogger<ArReceiptService> _logger;

    public ArReceiptService(
        CarmenDbContext context,
        ICurrentUserService currentUserService,
        IArInvoiceService invoiceService,
        ILogger<ArReceiptService> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _invoiceService = invoiceService;
        _logger = logger;
    }

    public async Task<PaginatedResult<ArReceiptListDto>> GetReceiptsAsync(ArReceiptQueryParams query)
    {
        var queryable = _context.ArReceipts
            .Include(r => r.Customer)
            .Include(r => r.Lines)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.ToLower();
            queryable = queryable.Where(r =>
                r.ReceiptNumber.ToLower().Contains(search) ||
                (r.CheckNumber != null && r.CheckNumber.ToLower().Contains(search)) ||
                (r.BankReference != null && r.BankReference.ToLower().Contains(search)) ||
                r.Customer.CustomerCode.ToLower().Contains(search) ||
                r.Customer.CustomerName.ToLower().Contains(search));
        }

        if (query.Status.HasValue)
        {
            queryable = queryable.Where(r => r.Status == query.Status.Value);
        }

        if (query.CustomerId.HasValue)
        {
            queryable = queryable.Where(r => r.CustomerId == query.CustomerId.Value);
        }

        if (query.ReceiptMethod.HasValue)
        {
            queryable = queryable.Where(r => r.ReceiptMethod == query.ReceiptMethod.Value);
        }

        if (query.DateFrom.HasValue)
        {
            queryable = queryable.Where(r => r.ReceiptDate >= query.DateFrom.Value);
        }

        if (query.DateTo.HasValue)
        {
            queryable = queryable.Where(r => r.ReceiptDate <= query.DateTo.Value);
        }

        if (query.FiscalPeriodId.HasValue)
        {
            queryable = queryable.Where(r => r.FiscalPeriodId == query.FiscalPeriodId.Value);
        }

        // Get total count
        var totalCount = await queryable.CountAsync();

        // Apply sorting
        queryable = query.SortBy.ToLower() switch
        {
            "receiptnumber" => query.SortDescending
                ? queryable.OrderByDescending(r => r.ReceiptNumber)
                : queryable.OrderBy(r => r.ReceiptNumber),
            "customercode" => query.SortDescending
                ? queryable.OrderByDescending(r => r.Customer.CustomerCode)
                : queryable.OrderBy(r => r.Customer.CustomerCode),
            "totalamount" => query.SortDescending
                ? queryable.OrderByDescending(r => r.TotalAmount)
                : queryable.OrderBy(r => r.TotalAmount),
            "status" => query.SortDescending
                ? queryable.OrderByDescending(r => r.Status)
                : queryable.OrderBy(r => r.Status),
            _ => query.SortDescending
                ? queryable.OrderByDescending(r => r.ReceiptDate)
                : queryable.OrderBy(r => r.ReceiptDate)
        };

        // Apply pagination
        var items = await queryable
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(r => new ArReceiptListDto(
                r.Id,
                r.ReceiptNumber,
                r.ReceiptDate,
                r.Status,
                r.Customer.CustomerCode,
                r.Customer.CustomerName,
                r.ReceiptMethod,
                r.CheckNumber,
                r.CurrencyCode,
                r.TotalAmount,
                r.BankAccount.AccountCode,
                r.Lines.Count,
                r.CreatedAt))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize);

        return new PaginatedResult<ArReceiptListDto>(items, totalCount, query.Page, query.PageSize, totalPages);
    }

    public async Task<ArReceiptDto?> GetReceiptByIdAsync(Guid id)
    {
        var receipt = await _context.ArReceipts
            .Include(r => r.Customer)
            .Include(r => r.BankAccount)
            .Include(r => r.FiscalPeriod)
            .Include(r => r.Lines)
                .ThenInclude(l => l.ArInvoice)
            .FirstOrDefaultAsync(r => r.Id == id);

        return receipt == null ? null : MapToDto(receipt);
    }

    public async Task<ArReceiptDto?> GetReceiptByNumberAsync(string receiptNumber)
    {
        var receipt = await _context.ArReceipts
            .Include(r => r.Customer)
            .Include(r => r.BankAccount)
            .Include(r => r.FiscalPeriod)
            .Include(r => r.Lines)
                .ThenInclude(l => l.ArInvoice)
            .FirstOrDefaultAsync(r => r.ReceiptNumber == receiptNumber);

        return receipt == null ? null : MapToDto(receipt);
    }

    public async Task<ArReceiptDto> CreateReceiptAsync(CreateArReceiptRequest request)
    {
        // Validate
        var errors = await ValidateReceiptAsync(request);
        if (errors.Count > 0)
        {
            throw new InvalidOperationException(string.Join("; ", errors));
        }

        var tenantId = _currentUserService.TenantId
            ?? throw new InvalidOperationException("Tenant context is required.");

        // Get customer
        var customer = await _context.Customers.FindAsync(request.CustomerId);
        if (customer == null)
        {
            throw new InvalidOperationException("Customer not found.");
        }

        // Generate receipt number
        var receiptNumber = await GenerateReceiptNumberAsync(request.ReceiptDate);

        var receipt = new ArReceipt
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            ReceiptNumber = receiptNumber,
            ReceiptDate = request.ReceiptDate,
            Status = ArReceiptStatus.Draft,
            CustomerId = request.CustomerId,
            BankAccountId = request.BankAccountId,
            ReceiptMethod = request.ReceiptMethod,
            CurrencyCode = request.CurrencyCode,
            ExchangeRate = request.ExchangeRate,
            TotalAmount = request.TotalAmount,
            AllocatedAmount = 0,
            TotalAmountBase = request.TotalAmount * request.ExchangeRate,
            CheckNumber = request.CheckNumber,
            CheckDate = request.CheckDate,
            BankReference = request.BankReference,
            Description = request.Description,
            Reference = request.Reference,
            PayerName = request.PayerName,
            FiscalPeriodId = request.FiscalPeriodId,
            CreatedBy = _currentUserService.Email ?? "system"
        };

        // Add allocation lines
        var lineNumber = 1;
        decimal totalAllocated = 0;

        foreach (var lineRequest in request.Lines)
        {
            var invoice = await _context.ArInvoices.FindAsync(lineRequest.ArInvoiceId);
            if (invoice == null)
            {
                throw new InvalidOperationException($"Invoice {lineRequest.ArInvoiceId} not found.");
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

            var line = new ArReceiptLine
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                ArReceiptId = receipt.Id,
                ArInvoiceId = lineRequest.ArInvoiceId,
                LineNumber = lineNumber++,
                AmountAllocated = lineRequest.AmountAllocated,
                AmountAllocatedBase = lineRequest.AmountAllocated * request.ExchangeRate,
                DiscountAmount = lineRequest.DiscountAmount,
                WhtAmount = lineRequest.WhtAmount,
                ExchangeGainLoss = exchangeGainLoss,
                Notes = lineRequest.Notes,
                CreatedBy = _currentUserService.Email ?? "system"
            };

            receipt.Lines.Add(line);
            totalAllocated += lineRequest.AmountAllocated;
        }

        receipt.AllocatedAmount = totalAllocated;
        receipt.UnallocatedAmount = request.TotalAmount - totalAllocated;

        _context.ArReceipts.Add(receipt);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created AR receipt {ReceiptNumber} with ID {ReceiptId}",
            receipt.ReceiptNumber, receipt.Id);

        return (await GetReceiptByIdAsync(receipt.Id))!;
    }

    public async Task<ArReceiptDto> UpdateReceiptAsync(Guid id, UpdateArReceiptRequest request)
    {
        var receipt = await _context.ArReceipts
            .Include(r => r.Lines)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (receipt == null)
        {
            throw new InvalidOperationException("Receipt not found.");
        }

        if (receipt.Status != ArReceiptStatus.Draft)
        {
            throw new InvalidOperationException("Only draft receipts can be updated.");
        }

        var tenantId = _currentUserService.TenantId!.Value;

        // Remove existing lines
        _context.ArReceiptLines.RemoveRange(receipt.Lines);

        // Update receipt
        receipt.ReceiptDate = request.ReceiptDate;
        receipt.BankAccountId = request.BankAccountId;
        receipt.ReceiptMethod = request.ReceiptMethod;
        receipt.CurrencyCode = request.CurrencyCode;
        receipt.ExchangeRate = request.ExchangeRate;
        receipt.TotalAmount = request.TotalAmount;
        receipt.TotalAmountBase = request.TotalAmount * request.ExchangeRate;
        receipt.CheckNumber = request.CheckNumber;
        receipt.CheckDate = request.CheckDate;
        receipt.BankReference = request.BankReference;
        receipt.Description = request.Description;
        receipt.Reference = request.Reference;
        receipt.PayerName = request.PayerName;
        receipt.FiscalPeriodId = request.FiscalPeriodId;
        receipt.UpdatedBy = _currentUserService.Email;

        // Add new allocation lines
        var lineNumber = 1;
        decimal totalAllocated = 0;

        foreach (var lineRequest in request.Lines)
        {
            var invoice = await _context.ArInvoices.FindAsync(lineRequest.ArInvoiceId);
            if (invoice == null)
            {
                throw new InvalidOperationException($"Invoice {lineRequest.ArInvoiceId} not found.");
            }

            var exchangeGainLoss = await CalculateExchangeGainLossAsync(
                invoice.Id,
                lineRequest.AmountAllocated,
                request.ExchangeRate);

            var line = new ArReceiptLine
            {
                Id = lineRequest.Id ?? Guid.NewGuid(),
                TenantId = tenantId,
                ArReceiptId = receipt.Id,
                ArInvoiceId = lineRequest.ArInvoiceId,
                LineNumber = lineNumber++,
                AmountAllocated = lineRequest.AmountAllocated,
                AmountAllocatedBase = lineRequest.AmountAllocated * request.ExchangeRate,
                DiscountAmount = lineRequest.DiscountAmount,
                WhtAmount = lineRequest.WhtAmount,
                ExchangeGainLoss = exchangeGainLoss,
                Notes = lineRequest.Notes,
                CreatedBy = _currentUserService.Email ?? "system"
            };

            _context.ArReceiptLines.Add(line);
            totalAllocated += lineRequest.AmountAllocated;
        }

        receipt.AllocatedAmount = totalAllocated;
        receipt.UnallocatedAmount = request.TotalAmount - totalAllocated;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated AR receipt {ReceiptNumber}", receipt.ReceiptNumber);

        return (await GetReceiptByIdAsync(receipt.Id))!;
    }

    public async Task DeleteReceiptAsync(Guid id)
    {
        var receipt = await _context.ArReceipts
            .Include(r => r.Lines)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (receipt == null)
        {
            throw new InvalidOperationException("Receipt not found.");
        }

        if (receipt.Status != ArReceiptStatus.Draft)
        {
            throw new InvalidOperationException("Only draft receipts can be deleted.");
        }

        _context.ArReceiptLines.RemoveRange(receipt.Lines);
        _context.ArReceipts.Remove(receipt);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted AR receipt {ReceiptNumber}", receipt.ReceiptNumber);
    }

    public async Task<ArReceiptDto> ApproveReceiptAsync(Guid id, ApproveArReceiptRequest request)
    {
        var receipt = await _context.ArReceipts.FindAsync(id);

        if (receipt == null)
        {
            throw new InvalidOperationException("Receipt not found.");
        }

        if (receipt.Status != ArReceiptStatus.Draft && receipt.Status != ArReceiptStatus.Pending)
        {
            throw new InvalidOperationException("Only draft or pending receipts can be approved.");
        }

        receipt.Status = ArReceiptStatus.Approved;
        receipt.ApprovedAt = DateTime.UtcNow;
        receipt.ApprovedBy = _currentUserService.Email;
        receipt.UpdatedBy = _currentUserService.Email;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Approved AR receipt {ReceiptNumber}", receipt.ReceiptNumber);

        return (await GetReceiptByIdAsync(id))!;
    }

    public async Task<ArReceiptDto> PostReceiptAsync(Guid id, PostArReceiptRequest request)
    {
        var receipt = await _context.ArReceipts
            .Include(r => r.Customer)
            .Include(r => r.BankAccount)
            .Include(r => r.Lines)
                .ThenInclude(l => l.ArInvoice)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (receipt == null)
        {
            throw new InvalidOperationException("Receipt not found.");
        }

        if (receipt.Status != ArReceiptStatus.Approved)
        {
            throw new InvalidOperationException("Only approved receipts can be posted.");
        }

        // Check fiscal period is open
        var fiscalPeriod = await _context.FiscalPeriods.FindAsync(receipt.FiscalPeriodId);
        if (fiscalPeriod == null || fiscalPeriod.Status != PeriodStatus.Open)
        {
            throw new InvalidOperationException("Fiscal period is closed or not found.");
        }

        var tenantId = _currentUserService.TenantId!.Value;

        // Create GL journal voucher for the receipt
        var journalVoucher = await CreateReceiptJournalVoucherAsync(receipt, tenantId);

        // Update invoice paid amounts
        foreach (var line in receipt.Lines)
        {
            var invoice = line.ArInvoice;
            var newPaidAmount = invoice.PaidAmount + line.AmountAllocated;
            await _invoiceService.UpdateInvoicePaidAmountAsync(invoice.Id, newPaidAmount);
        }

        // Update receipt status
        receipt.Status = ArReceiptStatus.Posted;
        receipt.PostedAt = DateTime.UtcNow;
        receipt.PostedBy = _currentUserService.Email;
        receipt.JournalVoucherId = journalVoucher.Id;
        receipt.UpdatedBy = _currentUserService.Email;
        await _context.SaveChangesAsync();

        // Update customer balance
        await UpdateCustomerBalanceAsync(receipt.CustomerId);

        _logger.LogInformation("Posted AR receipt {ReceiptNumber} with JV {JvNumber}",
            receipt.ReceiptNumber, journalVoucher.VoucherNumber);

        return (await GetReceiptByIdAsync(id))!;
    }

    public async Task<ArReceiptDto> VoidReceiptAsync(Guid id, VoidArReceiptRequest request)
    {
        var receipt = await _context.ArReceipts
            .Include(r => r.Lines)
                .ThenInclude(l => l.ArInvoice)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (receipt == null)
        {
            throw new InvalidOperationException("Receipt not found.");
        }

        if (receipt.Status != ArReceiptStatus.Posted)
        {
            throw new InvalidOperationException("Only posted receipts can be voided.");
        }

        var tenantId = _currentUserService.TenantId!.Value;

        // Reverse invoice paid amounts
        foreach (var line in receipt.Lines)
        {
            var invoice = line.ArInvoice;
            var newPaidAmount = invoice.PaidAmount - line.AmountAllocated;
            await _invoiceService.UpdateInvoicePaidAmountAsync(invoice.Id, Math.Max(0, newPaidAmount));
        }

        // Create reversing journal voucher if original was posted
        if (receipt.JournalVoucherId.HasValue)
        {
            await CreateReversalJournalVoucherAsync(receipt, tenantId, request.Reason);
        }

        receipt.Status = ArReceiptStatus.Void;
        receipt.VoidReason = request.Reason;
        receipt.UpdatedBy = _currentUserService.Email;
        await _context.SaveChangesAsync();

        // Update customer balance
        await UpdateCustomerBalanceAsync(receipt.CustomerId);

        _logger.LogInformation("Voided AR receipt {ReceiptNumber}: {Reason}",
            receipt.ReceiptNumber, request.Reason);

        return (await GetReceiptByIdAsync(id))!;
    }

    public async Task<string> GenerateReceiptNumberAsync(DateTime receiptDate)
    {
        var prefix = "RC";
        var yearMonth = receiptDate.ToString("yyyyMM");

        var lastNumber = await _context.ArReceipts
            .Where(r => r.ReceiptNumber.StartsWith($"{prefix}{yearMonth}"))
            .Select(r => r.ReceiptNumber)
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

    public async Task<ArAutoAllocateResult> AutoAllocateAsync(ArAutoAllocateRequest request)
    {
        // Get unpaid invoices for customer, sorted by due date (FIFO)
        var unpaidInvoices = await _context.ArInvoices
            .Where(i => i.CustomerId == request.CustomerId &&
                        i.BalanceAmount > 0 &&
                        (i.Status == ArInvoiceStatus.Approved || i.Status == ArInvoiceStatus.PartiallyPaid))
            .OrderBy(i => i.DueDate)
            .ThenBy(i => i.InvoiceNumber)
            .ToListAsync();

        var suggestions = new List<ArAllocationSuggestion>();
        var remainingAmount = request.TotalAmount;

        foreach (var invoice in unpaidInvoices)
        {
            if (remainingAmount <= 0)
                break;

            var allocateAmount = Math.Min(remainingAmount, invoice.BalanceAmount);

            suggestions.Add(new ArAllocationSuggestion(
                InvoiceId: invoice.Id,
                InvoiceNumber: invoice.InvoiceNumber,
                DueDate: invoice.DueDate,
                InvoiceBalance: invoice.BalanceAmount,
                SuggestedAmount: allocateAmount,
                WhtAmount: 0));

            remainingAmount -= allocateAmount;
        }

        return new ArAutoAllocateResult(
            TotalAllocated: request.TotalAmount - remainingAmount,
            Remaining: remainingAmount,
            Allocations: suggestions);
    }

    public async Task<List<string>> ValidateReceiptAsync(CreateArReceiptRequest request)
    {
        var errors = new List<string>();

        // Check customer exists
        var customer = await _context.Customers.FindAsync(request.CustomerId);
        if (customer == null)
        {
            errors.Add("Customer not found.");
        }
        else if (!customer.IsActive)
        {
            errors.Add("Customer is inactive.");
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
            var invoice = await _context.ArInvoices.FindAsync(line.ArInvoiceId);
            if (invoice == null)
            {
                errors.Add($"Invoice {line.ArInvoiceId} not found.");
                continue;
            }

            if (invoice.CustomerId != request.CustomerId)
            {
                errors.Add($"Invoice {invoice.InvoiceNumber} belongs to a different customer.");
            }

            if (invoice.Status != ArInvoiceStatus.Approved && invoice.Status != ArInvoiceStatus.PartiallyPaid)
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
            errors.Add($"Total allocated {totalAllocated:N2} exceeds receipt amount {request.TotalAmount:N2}.");
        }

        return errors;
    }

    public async Task<decimal> CalculateExchangeGainLossAsync(
        Guid invoiceId,
        decimal allocationAmount,
        decimal receiptExchangeRate)
    {
        var invoice = await _context.ArInvoices.FindAsync(invoiceId);
        if (invoice == null)
        {
            return 0;
        }

        // Calculate the ratio of allocation to total invoice amount
        var allocationRatio = allocationAmount / invoice.NetAmount;

        // Original base amount for this allocation
        var originalBaseAmount = invoice.NetAmountBase * allocationRatio;

        // Current base amount at receipt exchange rate
        var currentBaseAmount = allocationAmount * receiptExchangeRate;

        // Exchange gain (positive) or loss (negative)
        // If current rate is higher, we receive more in base currency = gain
        // If current rate is lower, we receive less in base currency = loss
        var exchangeGainLoss = currentBaseAmount - originalBaseAmount;

        return exchangeGainLoss;
    }

    private async Task<JournalVoucher> CreateReceiptJournalVoucherAsync(ArReceipt receipt, Guid tenantId)
    {
        // Get AR account from customer or system default
        var customer = await _context.Customers
            .Include(c => c.DefaultArAccount)
            .FirstOrDefaultAsync(c => c.Id == receipt.CustomerId);

        var arAccountId = customer?.DefaultArAccountId
            ?? throw new InvalidOperationException("No AR account configured for customer.");

        // Get bank account (BankAccountId references a ChartOfAccount directly)
        var bankAccount = await _context.ChartOfAccounts
            .FirstOrDefaultAsync(b => b.Id == receipt.BankAccountId);

        if (bankAccount == null)
        {
            throw new InvalidOperationException("Bank account not found.");
        }

        var bankGlAccountId = bankAccount.Id;

        // Generate JV number
        var yearMonth = receipt.ReceiptDate.ToString("yyyyMM");
        var lastJv = await _context.JournalVouchers
            .Where(j => j.VoucherNumber.StartsWith($"AR{yearMonth}"))
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

        var jvNumber = $"AR{yearMonth}{nextNum:D4}";

        var journalVoucher = new JournalVoucher
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            VoucherNumber = jvNumber,
            VoucherDate = receipt.ReceiptDate,
            PostingDate = receipt.ReceiptDate,
            VoucherType = VoucherType.General,
            Status = DocumentStatus.Posted,
            Description = $"AR Receipt {receipt.ReceiptNumber} from {customer?.CustomerName}",
            Reference = receipt.ReceiptNumber,
            CurrencyCode = receipt.CurrencyCode,
            ExchangeRate = receipt.ExchangeRate,
            FiscalPeriodId = receipt.FiscalPeriodId,
            TotalDebit = receipt.AllocatedAmount,
            TotalCredit = receipt.AllocatedAmount,
            PostedAt = DateTime.UtcNow,
            PostedBy = _currentUserService.Email,
            CreatedBy = _currentUserService.Email ?? "system"
        };

        // Debit Bank (increase asset)
        journalVoucher.Lines.Add(new JournalVoucherLine
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            JournalVoucherId = journalVoucher.Id,
            LineNumber = 1,
            AccountId = bankGlAccountId,
            DebitAmount = receipt.AllocatedAmount,
            CreditAmount = 0,
            DebitAmountBase = receipt.AllocatedAmount * receipt.ExchangeRate,
            CreditAmountBase = 0,
            Description = $"Receipt from {customer?.CustomerName}",
            Reference = receipt.ReceiptNumber,
            CreatedBy = _currentUserService.Email ?? "system"
        });

        // Credit AR (reduce receivable)
        journalVoucher.Lines.Add(new JournalVoucherLine
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            JournalVoucherId = journalVoucher.Id,
            LineNumber = 2,
            AccountId = arAccountId,
            DebitAmount = 0,
            CreditAmount = receipt.AllocatedAmount,
            DebitAmountBase = 0,
            CreditAmountBase = receipt.AllocatedAmount * receipt.ExchangeRate,
            Description = $"Receipt from {customer?.CustomerName}",
            Reference = receipt.ReceiptNumber,
            CreatedBy = _currentUserService.Email ?? "system"
        });

        // Handle exchange gain/loss if any
        var totalExchangeGainLoss = receipt.Lines.Sum(l => l.ExchangeGainLoss);
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
                        Reference = receipt.ReceiptNumber,
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
                        Reference = receipt.ReceiptNumber,
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

    private async Task CreateReversalJournalVoucherAsync(ArReceipt receipt, Guid tenantId, string reason)
    {
        var originalJv = await _context.JournalVouchers
            .Include(j => j.Lines)
            .FirstOrDefaultAsync(j => j.Id == receipt.JournalVoucherId);

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

    private async Task UpdateCustomerBalanceAsync(Guid customerId)
    {
        var customer = await _context.Customers.FindAsync(customerId);
        if (customer == null) return;

        var balance = await _context.ArInvoices
            .Where(i => i.CustomerId == customerId &&
                        i.Status != ArInvoiceStatus.Void &&
                        i.Status != ArInvoiceStatus.Draft &&
                        i.Status != ArInvoiceStatus.Rejected)
            .SumAsync(i => i.BalanceAmount);

        customer.CurrentBalance = balance;
        customer.UpdatedBy = _currentUserService.Email;
        await _context.SaveChangesAsync();
    }

    private ArReceiptDto MapToDto(ArReceipt receipt)
    {
        return new ArReceiptDto(
            Id: receipt.Id,
            ReceiptNumber: receipt.ReceiptNumber,
            ReceiptDate: receipt.ReceiptDate,
            Status: receipt.Status,
            CustomerId: receipt.CustomerId,
            CustomerCode: receipt.Customer?.CustomerCode ?? "",
            CustomerName: receipt.Customer?.CustomerName ?? "",
            ReceiptMethod: receipt.ReceiptMethod,
            CheckNumber: receipt.CheckNumber,
            CheckDate: receipt.CheckDate,
            BankReference: receipt.BankReference,
            CurrencyCode: receipt.CurrencyCode,
            ExchangeRate: receipt.ExchangeRate,
            TotalAmount: receipt.TotalAmount,
            TotalAmountBase: receipt.TotalAmountBase,
            AllocatedAmount: receipt.AllocatedAmount,
            UnallocatedAmount: receipt.UnallocatedAmount,
            BankAccountId: receipt.BankAccountId,
            BankAccountCode: receipt.BankAccount?.AccountCode ?? "",
            BankAccountName: receipt.BankAccount?.AccountName ?? "",
            Description: receipt.Description,
            Reference: receipt.Reference,
            PayerName: receipt.PayerName,
            FiscalPeriodId: receipt.FiscalPeriodId,
            FiscalPeriodName: receipt.FiscalPeriod?.Name,
            ApprovedAt: receipt.ApprovedAt,
            ApprovedBy: receipt.ApprovedBy,
            PostedAt: receipt.PostedAt,
            PostedBy: receipt.PostedBy,
            VoidReason: receipt.VoidReason,
            JournalVoucherId: receipt.JournalVoucherId,
            Lines: receipt.Lines.OrderBy(l => l.LineNumber).Select(l => new ArReceiptLineDto(
                Id: l.Id,
                LineNumber: l.LineNumber,
                ArInvoiceId: l.ArInvoiceId,
                InvoiceNumber: l.ArInvoice?.InvoiceNumber ?? "",
                CustomerReference: l.ArInvoice?.CustomerReference,
                InvoiceDate: l.ArInvoice?.InvoiceDate ?? DateTime.MinValue,
                DueDate: l.ArInvoice?.DueDate ?? DateTime.MinValue,
                InvoiceTotalAmount: l.ArInvoice?.TotalAmount ?? 0,
                InvoiceBalanceBefore: l.ArInvoice?.BalanceAmount ?? 0,
                AmountAllocated: l.AmountAllocated,
                AmountAllocatedBase: l.AmountAllocatedBase,
                DiscountAmount: l.DiscountAmount,
                WhtAmount: l.WhtAmount,
                ExchangeGainLoss: l.ExchangeGainLoss,
                Notes: l.Notes)).ToList(),
            CreatedAt: receipt.CreatedAt,
            CreatedBy: receipt.CreatedBy,
            UpdatedAt: receipt.UpdatedAt);
    }
}
