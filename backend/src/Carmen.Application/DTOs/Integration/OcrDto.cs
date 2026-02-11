namespace Carmen.Application.DTOs.Integration;

// --- OCR Extracted Invoice ---

public record OcrExtractedInvoiceDto(
    string? VendorName,
    string? VendorTaxId,
    string? InvoiceNumber,
    DateTime? InvoiceDate,
    DateTime? DueDate,
    string? CurrencyCode,
    decimal SubTotal,
    decimal TaxAmount,
    decimal TotalAmount,
    List<OcrExtractedLineDto> Lines,
    string RawText,
    double Confidence
);

public record OcrExtractedLineDto(
    string? Description,
    decimal Quantity,
    decimal UnitPrice,
    decimal Amount,
    string? AccountCode
);

// --- Create Invoice from OCR ---

public record CreateInvoiceFromOcrRequest(
    Guid VendorId,
    string InvoiceNumber,
    DateTime InvoiceDate,
    DateTime DueDate,
    string CurrencyCode,
    decimal ExchangeRate,
    Guid FiscalPeriodId,
    Guid? PaymentTermId,
    string? Notes,
    List<CreateInvoiceFromOcrLineRequest> Lines
);

public record CreateInvoiceFromOcrLineRequest(
    Guid AccountId,
    Guid? DepartmentId,
    string Description,
    decimal Quantity,
    decimal UnitPrice,
    decimal Amount,
    Guid? TaxProfileId
);
