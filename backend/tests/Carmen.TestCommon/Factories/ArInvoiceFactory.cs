using Carmen.Domain.Entities.AR;
using Carmen.TestCommon.Constants;

namespace Carmen.TestCommon.Factories;

/// <summary>
/// Builder for creating AR Invoice test entities
/// </summary>
public class ArInvoiceFactory
{
    private static int _counter = 1;

    private readonly Guid _customerId;
    private readonly ArInvoice _invoice;
    private readonly List<ArInvoiceLine> _lines = new();

    public ArInvoiceFactory(Guid? customerId = null)
    {
        _customerId = customerId ?? Guid.NewGuid();
        _invoice = new ArInvoice
        {
            Id = Guid.NewGuid(),
            TenantId = TestConstants.DefaultTenantId,
            InvoiceNumber = $"ARI{DateTime.UtcNow:yyyyMM}{_counter++:D4}",
            InvoiceDate = DateTime.UtcNow.Date,
            DueDate = DateTime.UtcNow.Date.AddDays(30),
            Status = ArInvoiceStatus.Draft,
            CustomerId = _customerId,
            CurrencyCode = "USD",
            ExchangeRate = 1m,
            FiscalPeriodId = TestConstants.DefaultFiscalPeriodId,
            ArAccountId = TestConstants.ArAccountId,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "test",
        };
    }

    public ArInvoiceFactory WithId(Guid id) { _invoice.Id = id; return this; }
    public ArInvoiceFactory WithTenant(Guid tenantId) { _invoice.TenantId = tenantId; return this; }
    public ArInvoiceFactory WithStatus(ArInvoiceStatus status) { _invoice.Status = status; return this; }

    public ArInvoiceFactory WithLine(decimal amount, Guid? accountId = null, string? description = null)
    {
        _lines.Add(new ArInvoiceLine
        {
            Id = Guid.NewGuid(),
            TenantId = _invoice.TenantId,
            ArInvoiceId = _invoice.Id,
            LineNumber = _lines.Count + 1,
            AccountId = accountId ?? TestConstants.RevenueAccountId,
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

    public (Customer Customer, ArInvoice Invoice, List<ArInvoiceLine> Lines) Build()
    {
        _invoice.SubTotal = _lines.Sum(l => l.NetAmount);
        _invoice.TotalAmount = _invoice.SubTotal + _invoice.Tax1Amount + _invoice.Tax2Amount;
        _invoice.NetAmount = _invoice.TotalAmount - _invoice.WhtAmount;
        _invoice.BalanceAmount = _invoice.NetAmount - _invoice.PaidAmount;
        _invoice.SubTotalBase = _invoice.SubTotal * _invoice.ExchangeRate;
        _invoice.TotalAmountBase = _invoice.TotalAmount * _invoice.ExchangeRate;
        _invoice.NetAmountBase = _invoice.NetAmount * _invoice.ExchangeRate;

        var customer = CreateCustomer(_customerId, _invoice.TenantId);
        return (customer, _invoice, _lines);
    }

    public static Customer CreateCustomer(Guid? id = null, Guid? tenantId = null)
    {
        return new Customer
        {
            Id = id ?? Guid.NewGuid(),
            TenantId = tenantId ?? TestConstants.DefaultTenantId,
            CustomerCode = $"C{Random.Shared.Next(1000, 9999)}",
            CustomerName = "Test Customer",
            IsActive = true,
            CurrencyCode = "USD",
            DefaultArAccountId = TestConstants.ArAccountId,
            DefaultRevenueAccountId = TestConstants.RevenueAccountId,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "test",
        };
    }

    public static (Customer Customer, ArInvoice Invoice, List<ArInvoiceLine> Lines) SimpleDraft(decimal amount = 5000m)
    {
        return new ArInvoiceFactory()
            .WithLine(amount)
            .Build();
    }
}
