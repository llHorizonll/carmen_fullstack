using Carmen.Domain.Entities.AP;
using Carmen.TestCommon.Constants;

namespace Carmen.TestCommon.Factories;

/// <summary>
/// Builder for creating AP Invoice test entities
/// </summary>
public class ApInvoiceFactory
{
    private static int _counter = 1;

    private readonly Guid _vendorId;
    private readonly ApInvoice _invoice;
    private readonly List<ApInvoiceLine> _lines = new();

    public ApInvoiceFactory(Guid? vendorId = null)
    {
        _vendorId = vendorId ?? Guid.NewGuid();
        _invoice = new ApInvoice
        {
            Id = Guid.NewGuid(),
            TenantId = TestConstants.DefaultTenantId,
            InvoiceNumber = $"API{DateTime.UtcNow:yyyyMM}{_counter++:D4}",
            InvoiceDate = DateTime.UtcNow.Date,
            DueDate = DateTime.UtcNow.Date.AddDays(30),
            Status = ApInvoiceStatus.Draft,
            VendorId = _vendorId,
            CurrencyCode = "USD",
            ExchangeRate = 1m,
            FiscalPeriodId = TestConstants.DefaultFiscalPeriodId,
            ApAccountId = TestConstants.ApAccountId,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "test",
        };
    }

    public ApInvoiceFactory WithId(Guid id) { _invoice.Id = id; return this; }
    public ApInvoiceFactory WithTenant(Guid tenantId) { _invoice.TenantId = tenantId; return this; }
    public ApInvoiceFactory WithStatus(ApInvoiceStatus status) { _invoice.Status = status; return this; }
    public ApInvoiceFactory WithNumber(string number) { _invoice.InvoiceNumber = number; return this; }

    public ApInvoiceFactory WithLine(decimal amount, Guid? accountId = null, string? description = null)
    {
        _lines.Add(new ApInvoiceLine
        {
            Id = Guid.NewGuid(),
            TenantId = _invoice.TenantId,
            ApInvoiceId = _invoice.Id,
            LineNumber = _lines.Count + 1,
            AccountId = accountId ?? TestConstants.ExpenseAccountId,
            Quantity = 1,
            UnitPrice = amount,
            Amount = amount,
            AmountBase = amount * _invoice.ExchangeRate,
            NetAmount = amount,
            Description = description ?? $"Line {_lines.Count + 1}",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "test",
        });
        return this;
    }

    public (Vendor Vendor, ApInvoice Invoice, List<ApInvoiceLine> Lines) Build()
    {
        _invoice.SubTotal = _lines.Sum(l => l.NetAmount);
        _invoice.TotalAmount = _invoice.SubTotal + _invoice.Tax1Amount + _invoice.Tax2Amount;
        _invoice.NetAmount = _invoice.TotalAmount - _invoice.WhtAmount;
        _invoice.BalanceAmount = _invoice.NetAmount - _invoice.PaidAmount;
        _invoice.SubTotalBase = _invoice.SubTotal * _invoice.ExchangeRate;
        _invoice.TotalAmountBase = _invoice.TotalAmount * _invoice.ExchangeRate;
        _invoice.NetAmountBase = _invoice.NetAmount * _invoice.ExchangeRate;

        var vendor = CreateVendor(_vendorId, _invoice.TenantId);
        return (vendor, _invoice, _lines);
    }

    public static Vendor CreateVendor(Guid? id = null, Guid? tenantId = null)
    {
        return new Vendor
        {
            Id = id ?? Guid.NewGuid(),
            TenantId = tenantId ?? TestConstants.DefaultTenantId,
            VendorCode = $"V{Random.Shared.Next(1000, 9999)}",
            VendorName = "Test Vendor",
            IsActive = true,
            CurrencyCode = "USD",
            DefaultApAccountId = TestConstants.ApAccountId,
            DefaultExpenseAccountId = TestConstants.ExpenseAccountId,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "test",
        };
    }

    /// <summary>
    /// Quick helper: creates a Draft invoice with one line
    /// </summary>
    public static (Vendor Vendor, ApInvoice Invoice, List<ApInvoiceLine> Lines) SimpleDraft(decimal amount = 5000m)
    {
        return new ApInvoiceFactory()
            .WithLine(amount)
            .Build();
    }
}
