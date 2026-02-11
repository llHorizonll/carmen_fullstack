namespace Carmen.Application.DTOs.AR;

// Response DTOs
public record CustomerDto(
    Guid Id,
    string CustomerCode,
    string CustomerName,
    string? CustomerNameLocal,
    string? ContactPerson,
    string? Email,
    string? Phone,
    string? Fax,
    string? Address,
    string? City,
    string? State,
    string? PostalCode,
    string? Country,
    string? TaxId,
    bool IsActive,
    Guid? DefaultPaymentTermId,
    string? DefaultPaymentTermName,
    string CurrencyCode,
    decimal CreditLimit,
    decimal CurrentBalance,
    Guid? DefaultTax1ProfileId,
    string? DefaultTax1ProfileName,
    Guid? DefaultTax2ProfileId,
    string? DefaultTax2ProfileName,
    Guid? DefaultWhtProfileId,
    string? DefaultWhtProfileName,
    Guid? DefaultArAccountId,
    string? DefaultArAccountCode,
    Guid? DefaultRevenueAccountId,
    string? DefaultRevenueAccountCode,
    string? BankName,
    string? BankAccountNumber,
    string? BankBranch,
    string? BankSwiftCode,
    string? Notes,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt
);

public record CustomerListDto(
    Guid Id,
    string CustomerCode,
    string CustomerName,
    string? ContactPerson,
    string? Email,
    string? Phone,
    bool IsActive,
    string CurrencyCode,
    decimal CreditLimit,
    decimal CurrentBalance,
    int InvoiceCount,
    DateTime CreatedAt
);

public record CustomerLookupDto(
    Guid Id,
    string CustomerCode,
    string CustomerName,
    string CurrencyCode,
    Guid? DefaultPaymentTermId,
    Guid? DefaultTax1ProfileId,
    Guid? DefaultTax2ProfileId,
    Guid? DefaultWhtProfileId,
    Guid? DefaultArAccountId,
    Guid? DefaultRevenueAccountId
);

// Request DTOs
public record CreateCustomerRequest(
    string CustomerCode,
    string CustomerName,
    string? CustomerNameLocal,
    string? ContactPerson,
    string? Email,
    string? Phone,
    string? Fax,
    string? Address,
    string? City,
    string? State,
    string? PostalCode,
    string? Country,
    string? TaxId,
    Guid? DefaultPaymentTermId,
    string CurrencyCode,
    decimal CreditLimit,
    Guid? DefaultTax1ProfileId,
    Guid? DefaultTax2ProfileId,
    Guid? DefaultWhtProfileId,
    Guid? DefaultArAccountId,
    Guid? DefaultRevenueAccountId,
    string? BankName,
    string? BankAccountNumber,
    string? BankBranch,
    string? BankSwiftCode,
    string? Notes
);

public record UpdateCustomerRequest(
    string CustomerName,
    string? CustomerNameLocal,
    string? ContactPerson,
    string? Email,
    string? Phone,
    string? Fax,
    string? Address,
    string? City,
    string? State,
    string? PostalCode,
    string? Country,
    string? TaxId,
    bool IsActive,
    Guid? DefaultPaymentTermId,
    string CurrencyCode,
    decimal CreditLimit,
    Guid? DefaultTax1ProfileId,
    Guid? DefaultTax2ProfileId,
    Guid? DefaultWhtProfileId,
    Guid? DefaultArAccountId,
    Guid? DefaultRevenueAccountId,
    string? BankName,
    string? BankAccountNumber,
    string? BankBranch,
    string? BankSwiftCode,
    string? Notes
);

// Query parameters
public record CustomerQueryParams(
    string? Search,
    bool? IsActive,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "CustomerCode",
    bool SortDescending = false
);

// Aging DTOs
public record CustomerAgingDto(
    Guid CustomerId,
    string CustomerCode,
    string CustomerName,
    string CurrencyCode,
    DateTime AsOfDate,
    decimal Current,
    decimal Days1To30,
    decimal Days31To60,
    decimal Days61To90,
    decimal Days90Plus,
    decimal TotalOutstanding,
    List<CustomerAgingInvoiceDto> Invoices
);

public record CustomerAgingInvoiceDto(
    Guid InvoiceId,
    string InvoiceNumber,
    string? CustomerReference,
    DateTime InvoiceDate,
    DateTime DueDate,
    int DaysOverdue,
    decimal TotalAmount,
    decimal BalanceAmount,
    string AgingBucket
);

public record CustomerAgingSummaryDto(
    Guid CustomerId,
    string CustomerCode,
    string CustomerName,
    string CurrencyCode,
    decimal Current,
    decimal Days1To30,
    decimal Days31To60,
    decimal Days61To90,
    decimal Days90Plus,
    decimal TotalOutstanding
);
