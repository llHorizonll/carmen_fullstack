using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.GL;
using Carmen.Domain.Entities.GL;

namespace Carmen.Application.Services.GL;

public interface IRecurringVoucherService
{
    Task<PaginatedResult<RecurringVoucherListDto>> GetRecurringVouchersAsync(RecurringVoucherQueryParams query);
    Task<RecurringVoucherDto?> GetRecurringVoucherByIdAsync(Guid id);
    Task<RecurringVoucherDto> CreateRecurringVoucherAsync(CreateRecurringVoucherRequest request);
    Task<RecurringVoucherDto> UpdateRecurringVoucherAsync(Guid id, UpdateRecurringVoucherRequest request);
    Task DeleteRecurringVoucherAsync(Guid id);
    Task<RecurringVoucherDto> ActivateAsync(Guid id);
    Task<RecurringVoucherDto> DeactivateAsync(Guid id);
    Task<List<RecurringVoucher>> GetDueVouchersAsync(DateTime processDate);
}
