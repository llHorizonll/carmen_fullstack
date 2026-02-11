using Carmen.Domain.Entities.GL;
using Carmen.TestCommon.Constants;

namespace Carmen.TestCommon.Factories;

/// <summary>
/// Builder for creating JournalVoucher test entities with balanced lines
/// </summary>
public class JournalVoucherFactory
{
    private readonly JournalVoucher _voucher = new()
    {
        Id = Guid.NewGuid(),
        TenantId = TestConstants.DefaultTenantId,
        VoucherNumber = "JV20250100001",
        VoucherDate = new DateTime(2025, 1, 15),
        PostingDate = new DateTime(2025, 1, 15),
        VoucherType = VoucherType.General,
        Status = DocumentStatus.Draft,
        Description = "Test Voucher",
        CurrencyCode = "USD",
        ExchangeRate = 1m,
        FiscalPeriodId = TestConstants.DefaultFiscalPeriodId,
        CreatedAt = DateTime.UtcNow,
        CreatedBy = "test",
    };

    private readonly List<JournalVoucherLine> _lines = new();

    public JournalVoucherFactory WithId(Guid id) { _voucher.Id = id; return this; }
    public JournalVoucherFactory WithTenant(Guid tenantId) { _voucher.TenantId = tenantId; return this; }
    public JournalVoucherFactory WithNumber(string number) { _voucher.VoucherNumber = number; return this; }
    public JournalVoucherFactory WithDate(DateTime date) { _voucher.VoucherDate = date; _voucher.PostingDate = date; return this; }
    public JournalVoucherFactory WithType(VoucherType type) { _voucher.VoucherType = type; return this; }
    public JournalVoucherFactory WithStatus(DocumentStatus status) { _voucher.Status = status; return this; }
    public JournalVoucherFactory WithCurrency(string code, decimal rate) { _voucher.CurrencyCode = code; _voucher.ExchangeRate = rate; return this; }
    public JournalVoucherFactory WithFiscalPeriod(Guid periodId) { _voucher.FiscalPeriodId = periodId; return this; }
    public JournalVoucherFactory WithDescription(string desc) { _voucher.Description = desc; return this; }

    public JournalVoucherFactory AsPosted()
    {
        _voucher.Status = DocumentStatus.Posted;
        _voucher.PostedAt = DateTime.UtcNow;
        _voucher.PostedBy = "test";
        _voucher.ApprovedAt = DateTime.UtcNow;
        _voucher.ApprovedBy = "test";
        return this;
    }

    public JournalVoucherFactory AsPending()
    {
        _voucher.Status = DocumentStatus.Pending;
        return this;
    }

    public JournalVoucherFactory AsApproved()
    {
        _voucher.Status = DocumentStatus.Approved;
        _voucher.ApprovedAt = DateTime.UtcNow;
        _voucher.ApprovedBy = "test";
        return this;
    }

    public JournalVoucherFactory WithReversalOf(Guid originalId)
    {
        _voucher.ReversalOfId = originalId;
        _voucher.VoucherType = VoucherType.Reversal;
        return this;
    }

    /// <summary>
    /// Adds a balanced debit/credit line pair
    /// </summary>
    public JournalVoucherFactory WithBalancedLines(
        Guid debitAccountId,
        Guid creditAccountId,
        decimal amount,
        string? description = null)
    {
        var lineNum = _lines.Count;
        _lines.Add(new JournalVoucherLine
        {
            Id = Guid.NewGuid(),
            TenantId = _voucher.TenantId,
            JournalVoucherId = _voucher.Id,
            LineNumber = lineNum + 1,
            AccountId = debitAccountId,
            DebitAmount = amount,
            CreditAmount = 0,
            DebitAmountBase = amount * _voucher.ExchangeRate,
            CreditAmountBase = 0,
            Description = description ?? "Debit line",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "test",
        });
        _lines.Add(new JournalVoucherLine
        {
            Id = Guid.NewGuid(),
            TenantId = _voucher.TenantId,
            JournalVoucherId = _voucher.Id,
            LineNumber = lineNum + 2,
            AccountId = creditAccountId,
            DebitAmount = 0,
            CreditAmount = amount,
            DebitAmountBase = 0,
            CreditAmountBase = amount * _voucher.ExchangeRate,
            Description = description ?? "Credit line",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "test",
        });
        return this;
    }

    /// <summary>
    /// Adds a single debit line
    /// </summary>
    public JournalVoucherFactory WithDebitLine(Guid accountId, decimal amount)
    {
        _lines.Add(new JournalVoucherLine
        {
            Id = Guid.NewGuid(),
            TenantId = _voucher.TenantId,
            JournalVoucherId = _voucher.Id,
            LineNumber = _lines.Count + 1,
            AccountId = accountId,
            DebitAmount = amount,
            CreditAmount = 0,
            DebitAmountBase = amount * _voucher.ExchangeRate,
            CreditAmountBase = 0,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "test",
        });
        return this;
    }

    /// <summary>
    /// Adds a single credit line
    /// </summary>
    public JournalVoucherFactory WithCreditLine(Guid accountId, decimal amount)
    {
        _lines.Add(new JournalVoucherLine
        {
            Id = Guid.NewGuid(),
            TenantId = _voucher.TenantId,
            JournalVoucherId = _voucher.Id,
            LineNumber = _lines.Count + 1,
            AccountId = accountId,
            DebitAmount = 0,
            CreditAmount = amount,
            DebitAmountBase = 0,
            CreditAmountBase = amount * _voucher.ExchangeRate,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "test",
        });
        return this;
    }

    public (JournalVoucher Voucher, List<JournalVoucherLine> Lines) Build()
    {
        _voucher.TotalDebit = _lines.Sum(l => l.DebitAmount);
        _voucher.TotalCredit = _lines.Sum(l => l.CreditAmount);
        return (_voucher, _lines);
    }

    /// <summary>
    /// Quick helper: creates a balanced Draft voucher with one debit/credit pair
    /// </summary>
    public static (JournalVoucher Voucher, List<JournalVoucherLine> Lines) SimpleDraft(
        decimal amount = 1000m,
        Guid? debitAccountId = null,
        Guid? creditAccountId = null)
    {
        return new JournalVoucherFactory()
            .WithBalancedLines(
                debitAccountId ?? TestConstants.ExpenseAccountId,
                creditAccountId ?? TestConstants.CashAccountId,
                amount)
            .Build();
    }

    /// <summary>
    /// Quick helper: creates a balanced Posted voucher
    /// </summary>
    public static (JournalVoucher Voucher, List<JournalVoucherLine> Lines) SimplePosted(
        decimal amount = 1000m)
    {
        return new JournalVoucherFactory()
            .AsPosted()
            .WithBalancedLines(TestConstants.ExpenseAccountId, TestConstants.CashAccountId, amount)
            .Build();
    }
}
