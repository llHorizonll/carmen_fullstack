namespace Carmen.Domain.Entities.AP;

/// <summary>
/// AP Invoice status enumeration
/// </summary>
public enum ApInvoiceStatus
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
/// AP Payment status enumeration
/// </summary>
public enum ApPaymentStatus
{
    /// <summary>Payment is being drafted</summary>
    Draft = 0,
    /// <summary>Payment is pending approval</summary>
    Pending = 1,
    /// <summary>Payment has been approved</summary>
    Approved = 2,
    /// <summary>Payment has been posted to GL</summary>
    Posted = 3,
    /// <summary>Payment has been voided</summary>
    Void = 4
}

/// <summary>
/// Payment method enumeration
/// </summary>
public enum PaymentMethod
{
    /// <summary>Cash payment</summary>
    Cash = 1,
    /// <summary>Check payment</summary>
    Check = 2,
    /// <summary>Bank transfer</summary>
    BankTransfer = 3,
    /// <summary>Credit card payment</summary>
    CreditCard = 4,
    /// <summary>Other payment method</summary>
    Other = 99
}
