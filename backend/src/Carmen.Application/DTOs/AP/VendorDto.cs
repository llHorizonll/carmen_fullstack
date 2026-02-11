namespace Carmen.Application.DTOs.AP;

// Response DTOs
public record VendorDto(
    Guid Id,
    string VendorCode,
    string VendorName,
    string? VendorNameLocal,
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
    Guid? DefaultApAccountId,
    string? DefaultApAccountCode,
    Guid? DefaultExpenseAccountId,
    string? DefaultExpenseAccountCode,
    string? BankName,
    string? BankAccountNumber,
    string? BankBranch,
    string? BankSwiftCode,
    string? Notes,
    DateTime CreatedAt,
    string CreatedBy,
    DateTime? UpdatedAt
);

public record VendorListDto(
    Guid Id,
    string VendorCode,
    string VendorName,
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

public record VendorLookupDto(
    Guid Id,
    string VendorCode,
    string VendorName,
    string CurrencyCode,
    Guid? DefaultPaymentTermId,
    Guid? DefaultTax1ProfileId,
    Guid? DefaultTax2ProfileId,
    Guid? DefaultWhtProfileId,
    Guid? DefaultApAccountId,
    Guid? DefaultExpenseAccountId
);

// Request DTOs
public record CreateVendorRequest(
    string VendorCode,
    string VendorName,
    string? VendorNameLocal,
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
    Guid? DefaultApAccountId,
    Guid? DefaultExpenseAccountId,
    string? BankName,
    string? BankAccountNumber,
    string? BankBranch,
    string? BankSwiftCode,
    string? Notes
);

public record UpdateVendorRequest(
    string VendorName,
    string? VendorNameLocal,
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
    Guid? DefaultApAccountId,
    Guid? DefaultExpenseAccountId,
    string? BankName,
    string? BankAccountNumber,
    string? BankBranch,
    string? BankSwiftCode,
    string? Notes
);

// Query parameters
public record VendorQueryParams(
    string? Search,
    bool? IsActive,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "VendorCode",
    bool SortDescending = false
);

// Aging DTOs
public record VendorAgingDto(
    Guid VendorId,
    string VendorCode,
    string VendorName,
    string CurrencyCode,
    DateTime AsOfDate,
    decimal Current,
    decimal Days1To30,
    decimal Days31To60,
    decimal Days61To90,
    decimal Days90Plus,
    decimal TotalOutstanding,
    List<VendorAgingInvoiceDto> Invoices
);

public record VendorAgingInvoiceDto(
    Guid InvoiceId,
    string InvoiceNumber,
    string? VendorInvoiceNumber,
    DateTime InvoiceDate,
    DateTime DueDate,
    int DaysOverdue,
    decimal TotalAmount,
    decimal BalanceAmount,
    string AgingBucket
);

public record VendorAgingSummaryDto(
    Guid VendorId,
    string VendorCode,
    string VendorName,
    string CurrencyCode,
    decimal Current,
    decimal Days1To30,
    decimal Days31To60,
    decimal Days61To90,
    decimal Days90Plus,
    decimal TotalOutstanding
);
