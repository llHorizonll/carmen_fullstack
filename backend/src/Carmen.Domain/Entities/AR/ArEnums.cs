namespace Carmen.Domain.Entities.AR;

/// <summary>
/// AR Invoice status enumeration
/// </summary>
public enum ArInvoiceStatus
{
    /// <summary>Invoice is being drafted</summary>
    Draft = 0,
    /// <summary>Invoice is pending approval</summary>
    Pending = 1,
    /// <summary>Invoice has been approved</summary>
    Approved = 2,
    /// <summary>Invoice has been rejected</summary>
    Rejected = 3,
    /// <summary>Invoice is partially paid</summary>
    PartiallyPaid = 4,
    /// <summary>Invoice is fully paid</summary>
    Paid = 5,
    /// <summary>Invoice has been voided</summary>
    Void = 6
}

/// <summary>
/// AR Receipt status enumeration
/// </summary>
public enum ArReceiptStatus
{
    /// <summary>Receipt is being drafted</summary>
    Draft = 0,
    /// <summary>Receipt is pending approval</summary>
    Pending = 1,
    /// <summary>Receipt has been approved</summary>
    Approved = 2,
    /// <summary>Receipt has been posted to GL</summary>
    Posted = 3,
    /// <summary>Receipt has been voided</summary>
    Void = 4
}

/// <summary>
/// Receipt method enumeration
/// </summary>
public enum ReceiptMethod
{
    /// <summary>Cash receipt</summary>
    Cash = 1,
    /// <summary>Check receipt</summary>
    Check = 2,
    /// <summary>Bank transfer</summary>
    BankTransfer = 3,
    /// <summary>Credit card payment</summary>
    CreditCard = 4,
    /// <summary>Other receipt method</summary>
    Other = 99
}
