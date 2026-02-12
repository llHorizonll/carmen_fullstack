using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.GL;
using Carmen.Domain.Entities.GL;

namespace Carmen.Application.Services.GL;

public interface IJournalVoucherService
{
    /// <summary>
    /// Get paginated list of journal vouchers
    /// </summary>
    Task<PaginatedResult<JournalVoucherListDto>> GetVouchersAsync(JournalVoucherQueryParams query);

    /// <summary>
    /// Get journal voucher by ID with lines
    /// </summary>
    Task<JournalVoucherDto?> GetVoucherByIdAsync(Guid id);

    /// <summary>
    /// Get journal voucher by voucher number
    /// </summary>
    Task<JournalVoucherDto?> GetVoucherByNumberAsync(string voucherNumber);

    /// <summary>
    /// Create a new journal voucher (draft status)
    /// </summary>
    Task<JournalVoucherDto> CreateVoucherAsync(CreateJournalVoucherRequest request);

    /// <summary>
    /// Update an existing journal voucher (only if draft status)
    /// </summary>
    Task<JournalVoucherDto> UpdateVoucherAsync(Guid id, UpdateJournalVoucherRequest request);

    /// <summary>
    /// Delete a journal voucher (only if draft status)
    /// </summary>
    Task DeleteVoucherAsync(Guid id);

    /// <summary>
    /// Submit journal voucher for approval
    /// </summary>
    Task<JournalVoucherDto> SubmitForApprovalAsync(Guid id, SubmitForApprovalRequest request);

    /// <summary>
    /// Approve a journal voucher
    /// </summary>
    Task<JournalVoucherDto> ApproveVoucherAsync(Guid id, ApproveVoucherRequest request);

    /// <summary>
    /// Reject a journal voucher
    /// </summary>
    Task<JournalVoucherDto> RejectVoucherAsync(Guid id, RejectVoucherRequest request);

    /// <summary>
    /// Post a journal voucher (finalize)
    /// </summary>
    Task<JournalVoucherDto> PostVoucherAsync(Guid id, PostVoucherRequest request);

    /// <summary>
    /// Reverse a posted journal voucher
    /// </summary>
    Task<JournalVoucherDto> ReverseVoucherAsync(Guid id, ReverseVoucherRequest request);

    /// <summary>
    /// Void a journal voucher
    /// </summary>
    Task<JournalVoucherDto> VoidVoucherAsync(Guid id, string reason);

    /// <summary>
    /// Generate next voucher number
    /// </summary>
    Task<string> GenerateVoucherNumberAsync(VoucherType voucherType, DateTime voucherDate);

    /// <summary>
    /// Validate voucher lines (debit = credit, valid accounts, etc.)
    /// </summary>
    Task<List<string>> ValidateVoucherAsync(CreateJournalVoucherRequest request, bool isDraft = false);
}
