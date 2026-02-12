using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.GL;
using Carmen.Application.Interfaces;
using Carmen.Application.Services.GL;
using Carmen.Application.Services.Workflow;
using Carmen.Domain.Entities.GL;
using Carmen.Domain.Entities.Workflow;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Services;

public class JournalVoucherService : IJournalVoucherService
{
    private readonly CarmenDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IWorkflowService _workflowService;
    private readonly ILogger<JournalVoucherService> _logger;

    public JournalVoucherService(
        CarmenDbContext context,
        ICurrentUserService currentUserService,
        IWorkflowService workflowService,
        ILogger<JournalVoucherService> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _workflowService = workflowService;
        _logger = logger;
    }

    public async Task<PaginatedResult<JournalVoucherListDto>> GetVouchersAsync(JournalVoucherQueryParams query)
    {
        var queryable = _context.JournalVouchers
            .Include(v => v.Lines)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.ToLower();
            queryable = queryable.Where(v =>
                v.VoucherNumber.ToLower().Contains(search) ||
                (v.Description != null && v.Description.ToLower().Contains(search)) ||
                (v.Reference != null && v.Reference.ToLower().Contains(search)));
        }

        if (query.Status.HasValue)
        {
            queryable = queryable.Where(v => v.Status == query.Status.Value);
        }

        if (query.VoucherType.HasValue)
        {
            queryable = queryable.Where(v => v.VoucherType == query.VoucherType.Value);
        }

        if (query.DateFrom.HasValue)
        {
            queryable = queryable.Where(v => v.VoucherDate >= query.DateFrom.Value);
        }

        if (query.DateTo.HasValue)
        {
            queryable = queryable.Where(v => v.VoucherDate <= query.DateTo.Value);
        }

        if (query.FiscalPeriodId.HasValue)
        {
            queryable = queryable.Where(v => v.FiscalPeriodId == query.FiscalPeriodId.Value);
        }

        // Get total count
        var totalCount = await queryable.CountAsync();

        // Apply sorting
        queryable = query.SortBy.ToLower() switch
        {
            "vouchernumber" => query.SortDescending
                ? queryable.OrderByDescending(v => v.VoucherNumber)
                : queryable.OrderBy(v => v.VoucherNumber),
            "postingdate" => query.SortDescending
                ? queryable.OrderByDescending(v => v.PostingDate)
                : queryable.OrderBy(v => v.PostingDate),
            "status" => query.SortDescending
                ? queryable.OrderByDescending(v => v.Status)
                : queryable.OrderBy(v => v.Status),
            "totaldebit" => query.SortDescending
                ? queryable.OrderByDescending(v => v.TotalDebit)
                : queryable.OrderBy(v => v.TotalDebit),
            _ => query.SortDescending
                ? queryable.OrderByDescending(v => v.VoucherDate)
                : queryable.OrderBy(v => v.VoucherDate)
        };

        // Apply pagination
        var items = await queryable
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(v => new JournalVoucherListDto(
                v.Id,
                v.VoucherNumber,
                v.VoucherDate,
                v.PostingDate,
                v.VoucherType,
                v.Status,
                v.Description,
                v.CurrencyCode,
                v.TotalDebit,
                v.TotalCredit,
                v.Lines.Count,
                v.CreatedAt,
                v.CreatedBy))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize);

        return new PaginatedResult<JournalVoucherListDto>(items, totalCount, query.Page, query.PageSize, totalPages);
    }

    public async Task<JournalVoucherDto?> GetVoucherByIdAsync(Guid id)
    {
        var voucher = await _context.JournalVouchers
            .Include(v => v.Lines)
                .ThenInclude(l => l.Account)
            .FirstOrDefaultAsync(v => v.Id == id);

        return voucher == null ? null : MapToDto(voucher);
    }

    public async Task<JournalVoucherDto?> GetVoucherByNumberAsync(string voucherNumber)
    {
        var voucher = await _context.JournalVouchers
            .Include(v => v.Lines)
                .ThenInclude(l => l.Account)
            .FirstOrDefaultAsync(v => v.VoucherNumber == voucherNumber);

        return voucher == null ? null : MapToDto(voucher);
    }

    public async Task<JournalVoucherDto> CreateVoucherAsync(CreateJournalVoucherRequest request)
    {
        // Validate (lenient for drafts - skip balance check)
        var errors = await ValidateVoucherAsync(request, isDraft: true);
        if (errors.Count > 0)
        {
            throw new InvalidOperationException(string.Join("; ", errors));
        }

        var tenantId = _currentUserService.TenantId
            ?? throw new InvalidOperationException("Tenant context is required.");

        // Generate voucher number
        var voucherNumber = await GenerateVoucherNumberAsync(request.VoucherType, request.VoucherDate);

        // Resolve fiscal period from posting date if not provided
        var fiscalPeriodId = request.FiscalPeriodId
            ?? (await ResolveFiscalPeriodAsync(request.PostingDate));

        var voucher = new JournalVoucher
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            VoucherNumber = voucherNumber,
            VoucherDate = request.VoucherDate,
            PostingDate = request.PostingDate,
            VoucherType = request.VoucherType,
            Status = DocumentStatus.Draft,
            Description = request.Description,
            Reference = request.Reference,
            CurrencyCode = request.CurrencyCode,
            ExchangeRate = request.ExchangeRate,
            FiscalPeriodId = fiscalPeriodId,
            TotalDebit = request.Lines.Sum(l => l.DebitAmount),
            TotalCredit = request.Lines.Sum(l => l.CreditAmount),
            CreatedBy = _currentUserService.Email ?? "system"
        };

        // Add lines
        var lineNumber = 1;
        foreach (var lineRequest in request.Lines)
        {
            var line = new JournalVoucherLine
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                JournalVoucherId = voucher.Id,
                LineNumber = lineNumber++,
                AccountId = lineRequest.AccountId,
                DebitAmount = lineRequest.DebitAmount,
                CreditAmount = lineRequest.CreditAmount,
                DebitAmountBase = lineRequest.DebitAmount * request.ExchangeRate,
                CreditAmountBase = lineRequest.CreditAmount * request.ExchangeRate,
                Description = lineRequest.Description,
                Reference = lineRequest.Reference,
                DepartmentId = lineRequest.DepartmentId,
                CreatedBy = _currentUserService.Email ?? "system"
            };
            voucher.Lines.Add(line);
        }

        _context.JournalVouchers.Add(voucher);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created journal voucher {VoucherNumber} with ID {VoucherId}",
            voucher.VoucherNumber, voucher.Id);

        // Reload with related data
        return (await GetVoucherByIdAsync(voucher.Id))!;
    }

    public async Task<JournalVoucherDto> UpdateVoucherAsync(Guid id, UpdateJournalVoucherRequest request)
    {
        var voucher = await _context.JournalVouchers
            .Include(v => v.Lines)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (voucher == null)
        {
            throw new InvalidOperationException("Journal voucher not found.");
        }

        if (voucher.Status != DocumentStatus.Draft)
        {
            throw new InvalidOperationException("Only draft vouchers can be updated.");
        }

        // Calculate totals
        var totalDebit = request.Lines.Sum(l => l.DebitAmount);
        var totalCredit = request.Lines.Sum(l => l.CreditAmount);

        // Resolve fiscal period from posting date if not provided
        var fiscalPeriodId = request.FiscalPeriodId
            ?? (await ResolveFiscalPeriodAsync(request.PostingDate));

        // Update voucher
        voucher.VoucherDate = request.VoucherDate;
        voucher.PostingDate = request.PostingDate;
        voucher.Description = request.Description;
        voucher.Reference = request.Reference;
        voucher.CurrencyCode = request.CurrencyCode;
        voucher.ExchangeRate = request.ExchangeRate;
        voucher.FiscalPeriodId = fiscalPeriodId;
        voucher.TotalDebit = totalDebit;
        voucher.TotalCredit = totalCredit;
        voucher.UpdatedBy = _currentUserService.Email;

        // Update lines - remove existing and add new
        _context.JournalVoucherLines.RemoveRange(voucher.Lines);

        var lineNumber = 1;
        var tenantId = _currentUserService.TenantId!.Value;
        foreach (var lineRequest in request.Lines)
        {
            var line = new JournalVoucherLine
            {
                Id = lineRequest.Id ?? Guid.NewGuid(),
                TenantId = tenantId,
                JournalVoucherId = voucher.Id,
                LineNumber = lineNumber++,
                AccountId = lineRequest.AccountId,
                DebitAmount = lineRequest.DebitAmount,
                CreditAmount = lineRequest.CreditAmount,
                DebitAmountBase = lineRequest.DebitAmount * request.ExchangeRate,
                CreditAmountBase = lineRequest.CreditAmount * request.ExchangeRate,
                Description = lineRequest.Description,
                Reference = lineRequest.Reference,
                DepartmentId = lineRequest.DepartmentId,
                CreatedBy = _currentUserService.Email ?? "system"
            };
            _context.JournalVoucherLines.Add(line);
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated journal voucher {VoucherNumber}", voucher.VoucherNumber);

        return (await GetVoucherByIdAsync(voucher.Id))!;
    }

    public async Task DeleteVoucherAsync(Guid id)
    {
        var voucher = await _context.JournalVouchers
            .Include(v => v.Lines)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (voucher == null)
        {
            throw new InvalidOperationException("Journal voucher not found.");
        }

        if (voucher.Status != DocumentStatus.Draft)
        {
            throw new InvalidOperationException("Only draft vouchers can be deleted.");
        }

        _context.JournalVoucherLines.RemoveRange(voucher.Lines);
        _context.JournalVouchers.Remove(voucher);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted journal voucher {VoucherNumber}", voucher.VoucherNumber);
    }

    public async Task<JournalVoucherDto> SubmitForApprovalAsync(Guid id, SubmitForApprovalRequest request)
    {
        var voucher = await _context.JournalVouchers
            .Include(v => v.Lines)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (voucher == null)
        {
            throw new InvalidOperationException("Journal voucher not found.");
        }

        if (voucher.Status != DocumentStatus.Draft)
        {
            throw new InvalidOperationException("Only draft vouchers can be submitted for approval.");
        }

        // Full validation before submission (balance must be correct)
        if (voucher.TotalDebit != voucher.TotalCredit)
        {
            throw new InvalidOperationException(
                $"Total debit ({voucher.TotalDebit:N2}) must equal total credit ({voucher.TotalCredit:N2}) before submitting.");
        }

        if (voucher.Lines.Any(l => l.DebitAmount == 0 && l.CreditAmount == 0))
        {
            throw new InvalidOperationException("Each line must have a debit or credit amount before submitting.");
        }

        voucher.Status = DocumentStatus.Pending;
        voucher.UpdatedBy = _currentUserService.Email;
        await _context.SaveChangesAsync();

        // Submit to workflow engine if a workflow definition is configured
        if (_currentUserService.TenantId.HasValue && _currentUserService.UserId.HasValue)
        {
            var workflowInstance = await _workflowService.SubmitForApprovalAsync(
                _currentUserService.TenantId.Value,
                WorkflowEntityType.JournalVoucher,
                voucher.Id,
                voucher.VoucherNumber,
                voucher.TotalDebit,
                _currentUserService.UserId.Value);

            if (workflowInstance != null)
            {
                _logger.LogInformation("Journal voucher {VoucherNumber} submitted to workflow {WorkflowId}",
                    voucher.VoucherNumber, workflowInstance.Id);
            }
        }

        _logger.LogInformation("Submitted journal voucher {VoucherNumber} for approval", voucher.VoucherNumber);

        return (await GetVoucherByIdAsync(id))!;
    }

    public async Task<JournalVoucherDto> ApproveVoucherAsync(Guid id, ApproveVoucherRequest request)
    {
        var voucher = await _context.JournalVouchers.FindAsync(id);

        if (voucher == null)
        {
            throw new InvalidOperationException("Journal voucher not found.");
        }

        if (voucher.Status != DocumentStatus.Pending)
        {
            throw new InvalidOperationException("Only pending vouchers can be approved.");
        }

        voucher.Status = DocumentStatus.Approved;
        voucher.ApprovedAt = DateTime.UtcNow;
        voucher.ApprovedBy = _currentUserService.Email;
        voucher.UpdatedBy = _currentUserService.Email;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Approved journal voucher {VoucherNumber}", voucher.VoucherNumber);

        return (await GetVoucherByIdAsync(id))!;
    }

    public async Task<JournalVoucherDto> RejectVoucherAsync(Guid id, RejectVoucherRequest request)
    {
        var voucher = await _context.JournalVouchers.FindAsync(id);

        if (voucher == null)
        {
            throw new InvalidOperationException("Journal voucher not found.");
        }

        if (voucher.Status != DocumentStatus.Pending)
        {
            throw new InvalidOperationException("Only pending vouchers can be rejected.");
        }

        voucher.Status = DocumentStatus.Rejected;
        voucher.UpdatedBy = _currentUserService.Email;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Rejected journal voucher {VoucherNumber}: {Reason}",
            voucher.VoucherNumber, request.Reason);

        return (await GetVoucherByIdAsync(id))!;
    }

    public async Task<JournalVoucherDto> PostVoucherAsync(Guid id, PostVoucherRequest request)
    {
        var voucher = await _context.JournalVouchers.FindAsync(id);

        if (voucher == null)
        {
            throw new InvalidOperationException("Journal voucher not found.");
        }

        if (voucher.Status != DocumentStatus.Approved)
        {
            throw new InvalidOperationException("Only approved vouchers can be posted.");
        }

        // Check if fiscal period is open
        var fiscalPeriod = await _context.FiscalPeriods.FindAsync(voucher.FiscalPeriodId);
        if (fiscalPeriod == null || fiscalPeriod.Status != PeriodStatus.Open)
        {
            throw new InvalidOperationException("Fiscal period is closed or not found.");
        }

        voucher.Status = DocumentStatus.Posted;
        voucher.PostedAt = DateTime.UtcNow;
        voucher.PostedBy = _currentUserService.Email;
        if (request.PostingDate.HasValue)
        {
            voucher.PostingDate = request.PostingDate.Value;
        }
        voucher.UpdatedBy = _currentUserService.Email;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Posted journal voucher {VoucherNumber}", voucher.VoucherNumber);

        return (await GetVoucherByIdAsync(id))!;
    }

    public async Task<JournalVoucherDto> ReverseVoucherAsync(Guid id, ReverseVoucherRequest request)
    {
        var voucher = await _context.JournalVouchers
            .Include(v => v.Lines)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (voucher == null)
        {
            throw new InvalidOperationException("Journal voucher not found.");
        }

        if (voucher.Status != DocumentStatus.Posted)
        {
            throw new InvalidOperationException("Only posted vouchers can be reversed.");
        }

        if (voucher.ReversedById.HasValue)
        {
            throw new InvalidOperationException("This voucher has already been reversed.");
        }

        var tenantId = _currentUserService.TenantId!.Value;

        // Create reversal voucher with swapped debit/credit
        var reversalVoucher = new JournalVoucher
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            VoucherNumber = await GenerateVoucherNumberAsync(VoucherType.Reversal, request.ReversalDate),
            VoucherDate = request.ReversalDate,
            PostingDate = request.ReversalDate,
            VoucherType = VoucherType.Reversal,
            Status = DocumentStatus.Posted,
            Description = request.Description ?? $"Reversal of {voucher.VoucherNumber}",
            Reference = voucher.VoucherNumber,
            CurrencyCode = voucher.CurrencyCode,
            ExchangeRate = voucher.ExchangeRate,
            FiscalPeriodId = voucher.FiscalPeriodId,
            TotalDebit = voucher.TotalCredit, // Swapped
            TotalCredit = voucher.TotalDebit, // Swapped
            ReversalOfId = voucher.Id,
            PostedAt = DateTime.UtcNow,
            PostedBy = _currentUserService.Email,
            CreatedBy = _currentUserService.Email ?? "system"
        };

        // Reverse lines (swap debit/credit)
        var lineNumber = 1;
        foreach (var line in voucher.Lines)
        {
            reversalVoucher.Lines.Add(new JournalVoucherLine
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                JournalVoucherId = reversalVoucher.Id,
                LineNumber = lineNumber++,
                AccountId = line.AccountId,
                DebitAmount = line.CreditAmount, // Swapped
                CreditAmount = line.DebitAmount, // Swapped
                DebitAmountBase = line.CreditAmountBase,
                CreditAmountBase = line.DebitAmountBase,
                Description = $"Reversal: {line.Description}",
                Reference = line.Reference,
                DepartmentId = line.DepartmentId,
                CreatedBy = _currentUserService.Email ?? "system"
            });
        }

        // Mark original as reversed
        voucher.ReversedById = reversalVoucher.Id;
        voucher.UpdatedBy = _currentUserService.Email;

        _context.JournalVouchers.Add(reversalVoucher);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Reversed journal voucher {VoucherNumber} with {ReversalNumber}",
            voucher.VoucherNumber, reversalVoucher.VoucherNumber);

        return (await GetVoucherByIdAsync(reversalVoucher.Id))!;
    }

    public async Task<JournalVoucherDto> VoidVoucherAsync(Guid id, string reason)
    {
        var voucher = await _context.JournalVouchers.FindAsync(id);

        if (voucher == null)
        {
            throw new InvalidOperationException("Journal voucher not found.");
        }

        if (voucher.Status == DocumentStatus.Posted)
        {
            throw new InvalidOperationException("Posted vouchers cannot be voided. Use reverse instead.");
        }

        voucher.Status = DocumentStatus.Void;
        voucher.UpdatedBy = _currentUserService.Email;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Voided journal voucher {VoucherNumber}: {Reason}",
            voucher.VoucherNumber, reason);

        return (await GetVoucherByIdAsync(id))!;
    }

    public async Task<string> GenerateVoucherNumberAsync(VoucherType voucherType, DateTime voucherDate)
    {
        var prefix = voucherType switch
        {
            VoucherType.General => "JV",
            VoucherType.Recurring => "RV",
            VoucherType.Template => "TV",
            VoucherType.Amortization => "AM",
            VoucherType.Allocation => "AL",
            VoucherType.Reversal => "RJ",
            _ => "JV"
        };

        var yearMonth = voucherDate.ToString("yyyyMM");

        // Get the max number for this prefix and month
        var lastNumber = await _context.JournalVouchers
            .Where(v => v.VoucherNumber.StartsWith($"{prefix}{yearMonth}"))
            .Select(v => v.VoucherNumber)
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

    public async Task<List<string>> ValidateVoucherAsync(CreateJournalVoucherRequest request, bool isDraft = false)
    {
        var errors = new List<string>();

        // Check lines exist
        if (request.Lines.Count == 0)
        {
            errors.Add("At least one line is required.");
            return errors;
        }

        // Balance and line-level checks only apply for non-draft (submit/post)
        if (!isDraft)
        {
            // Check debit = credit
            var totalDebit = request.Lines.Sum(l => l.DebitAmount);
            var totalCredit = request.Lines.Sum(l => l.CreditAmount);
            if (totalDebit != totalCredit)
            {
                errors.Add($"Total debit ({totalDebit:N2}) must equal total credit ({totalCredit:N2}).");
            }

            // Check each line has either debit or credit (not both, not neither)
            foreach (var line in request.Lines)
            {
                if (line.DebitAmount == 0 && line.CreditAmount == 0)
                {
                    errors.Add("Each line must have a debit or credit amount.");
                }
                if (line.DebitAmount > 0 && line.CreditAmount > 0)
                {
                    errors.Add("A line cannot have both debit and credit amounts.");
                }
            }
        }

        // Negative amounts are never allowed
        foreach (var line in request.Lines)
        {
            if (line.DebitAmount < 0 || line.CreditAmount < 0)
            {
                errors.Add("Amounts cannot be negative.");
            }
        }

        // Check accounts exist and allow posting
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

        // Check fiscal period is open (skip if not provided - will be auto-resolved)
        if (request.FiscalPeriodId.HasValue)
        {
            var fiscalPeriod = await _context.FiscalPeriods.FindAsync(request.FiscalPeriodId.Value);
            if (fiscalPeriod == null)
            {
                errors.Add("Fiscal period not found.");
            }
            else if (fiscalPeriod.Status != PeriodStatus.Open)
            {
                errors.Add("Fiscal period is not open.");
            }
        }

        return errors;
    }

    private async Task<Guid> ResolveFiscalPeriodAsync(DateTime postingDate)
    {
        var fiscalPeriod = await _context.FiscalPeriods
            .Where(fp => fp.StartDate <= postingDate && fp.EndDate >= postingDate && fp.Status == PeriodStatus.Open)
            .FirstOrDefaultAsync();

        if (fiscalPeriod == null)
        {
            throw new InvalidOperationException(
                $"No open fiscal period found for posting date {postingDate:yyyy-MM-dd}.");
        }

        return fiscalPeriod.Id;
    }

    private JournalVoucherDto MapToDto(JournalVoucher voucher)
    {
        return new JournalVoucherDto(
            Id: voucher.Id,
            VoucherNumber: voucher.VoucherNumber,
            VoucherDate: voucher.VoucherDate,
            PostingDate: voucher.PostingDate,
            VoucherType: voucher.VoucherType,
            Status: voucher.Status,
            Description: voucher.Description,
            Reference: voucher.Reference,
            CurrencyCode: voucher.CurrencyCode,
            ExchangeRate: voucher.ExchangeRate,
            TotalDebit: voucher.TotalDebit,
            TotalCredit: voucher.TotalCredit,
            FiscalPeriodId: voucher.FiscalPeriodId,
            FiscalPeriodName: null, // Would need to load fiscal period
            ApprovedAt: voucher.ApprovedAt,
            ApprovedBy: voucher.ApprovedBy,
            PostedAt: voucher.PostedAt,
            PostedBy: voucher.PostedBy,
            ReversalOfId: voucher.ReversalOfId,
            ReversedById: voucher.ReversedById,
            Lines: voucher.Lines.OrderBy(l => l.LineNumber).Select(l => new JournalVoucherLineDto(
                Id: l.Id,
                LineNumber: l.LineNumber,
                AccountId: l.AccountId,
                AccountCode: l.Account?.AccountCode ?? "",
                AccountName: l.Account?.AccountName ?? "",
                DebitAmount: l.DebitAmount,
                CreditAmount: l.CreditAmount,
                DebitAmountBase: l.DebitAmountBase,
                CreditAmountBase: l.CreditAmountBase,
                Description: l.Description,
                Reference: l.Reference,
                DepartmentId: l.DepartmentId,
                DepartmentName: null // Would need to load department
            )).ToList(),
            CreatedAt: voucher.CreatedAt,
            CreatedBy: voucher.CreatedBy,
            UpdatedAt: voucher.UpdatedAt
        );
    }
}
