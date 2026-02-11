namespace Carmen.Application.DTOs.Integration;

// --- Inventory Movement ---

public record BlueLedgerInventoryMovementDto(
    string MovementId,
    DateTime MovementDate,
    string ItemCode,
    string ItemName,
    string WarehouseCode,
    decimal Quantity,
    decimal UnitCost,
    decimal TotalCost,
    string MovementType, // "IN", "OUT", "ADJUST"
    string Reference
);

public record PostInventoryToGlRequest(
    DateTime FromDate,
    DateTime ToDate
);

public record PostInventoryToGlResponse(
    int MovementsProcessed,
    Guid? JournalVoucherId,
    decimal TotalAmount,
    List<string> Errors
);

// --- Extra Cost (Guest Folio Charges) ---

public record BlueLedgerExtraCostDto(
    string ChargeId,
    DateTime ChargeDate,
    string FolioNumber,
    string GuestName,
    string RoomNumber,
    string ChargeCode,
    string Description,
    decimal Amount,
    string CurrencyCode,
    bool IsPosted
);

public record PostExtraCostRequest(
    string ChargeId,
    Guid AccountId,
    Guid? DepartmentId,
    string? Notes
);

public record PostExtraCostResponse(
    bool Success,
    string ChargeId,
    string FolioNumber,
    decimal Amount,
    string? ErrorMessage
);

// --- Receiving Integration ---

public record BlueLedgerReceivingDocumentDto(
    string ReceivingId,
    DateTime ReceivingDate,
    string VendorCode,
    string VendorName,
    decimal TotalAmount,
    string CurrencyCode,
    List<BlueLedgerReceivingLineDto> Lines
);

public record BlueLedgerReceivingLineDto(
    string ItemCode,
    string ItemName,
    decimal Quantity,
    string Unit,
    decimal UnitPrice,
    decimal Amount
);

public record ImportReceivingDocumentRequest(
    string ReceivingId
);

public record ImportReceivingDocumentResponse(
    bool Success,
    Guid? ApInvoiceId,
    string? InvoiceNumber,
    string? ErrorMessage
);

// --- Reconciliation ---

public record BlueLedgerReconciliationRequest(
    DateTime ReconciliationDate
);

public record BlueLedgerReconciliationResponse(
    DateTime ReconciliationDate,
    int InventoryMovementsCount,
    int ExtraCostsCount,
    int ReceivingDocumentsCount,
    List<string> Discrepancies
);

// --- Integration Status ---

public record BlueLedgerStatusDto(
    bool IsConnected,
    string? BaseUrl,
    DateTime? LastSyncTime,
    int PendingInventoryMovements,
    int PendingExtraCosts,
    int PendingReceivingDocuments,
    string? ErrorMessage
);
