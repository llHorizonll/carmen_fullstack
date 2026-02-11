using Carmen.Application.Jobs;
using Carmen.Domain.Entities.GL;
using Carmen.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Carmen.Infrastructure.Jobs;

/// <summary>
/// Background job for processing recurring journal vouchers.
/// This job finds all recurring vouchers due for execution and creates journal vouchers from them.
/// </summary>
public class RecurringVoucherJob : IRecurringVoucherJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<RecurringVoucherJob> _logger;

    public RecurringVoucherJob(
        IServiceProvider serviceProvider,
        ILogger<RecurringVoucherJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task ProcessRecurringVouchersAsync(Guid tenantId, DateTime processDate)
    {
        _logger.LogInformation(
            "Starting recurring voucher processing for tenant {TenantId}, date {ProcessDate}",
            tenantId, processDate.ToString("yyyy-MM-dd"));

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContextOptions = scope.ServiceProvider
                .GetRequiredService<DbContextOptions<CarmenDbContext>>();

            // Create tenant-scoped DbContext
            var context = new CarmenDbContext(dbContextOptions, tenantId);

            // Query recurring vouchers that are due for execution
            var dueVouchers = await context.RecurringVouchers
                .Include(rv => rv.Lines)
                .Where(rv => rv.IsActive
                    && rv.NextExecutionDate <= processDate
                    && (rv.EndDate == null || rv.EndDate >= processDate))
                .ToListAsync();

            if (dueVouchers.Count == 0)
            {
                _logger.LogInformation(
                    "No recurring vouchers due for processing for tenant {TenantId}",
                    tenantId);
                return;
            }

            _logger.LogInformation(
                "Found {Count} recurring vouchers to process for tenant {TenantId}",
                dueVouchers.Count, tenantId);

            // Get the current open fiscal period for the process date
            var fiscalPeriod = await context.FiscalPeriods
                .Where(fp => fp.StartDate <= processDate && fp.EndDate >= processDate
                    && fp.Status == PeriodStatus.Open)
                .FirstOrDefaultAsync();

            if (fiscalPeriod == null)
            {
                _logger.LogWarning(
                    "No open fiscal period found for date {ProcessDate} in tenant {TenantId}. Skipping.",
                    processDate.ToString("yyyy-MM-dd"), tenantId);
                return;
            }

            int createdCount = 0;

            foreach (var template in dueVouchers)
            {
                try
                {
                    // Generate voucher number
                    var voucherNumber = await GenerateVoucherNumberAsync(context, tenantId, processDate);

                    // Create journal voucher from template
                    var jv = new JournalVoucher
                    {
                        Id = Guid.NewGuid(),
                        TenantId = tenantId,
                        VoucherNumber = voucherNumber,
                        VoucherDate = processDate,
                        PostingDate = processDate,
                        VoucherType = VoucherType.Recurring,
                        Status = DocumentStatus.Draft,
                        Description = $"[Auto] {template.Name} - {processDate:MMM yyyy}",
                        Reference = template.Reference,
                        CurrencyCode = template.CurrencyCode,
                        ExchangeRate = template.ExchangeRate,
                        TotalDebit = template.TotalDebit,
                        TotalCredit = template.TotalCredit,
                        FiscalPeriodId = fiscalPeriod.Id,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = "system-recurring-job"
                    };

                    // Create voucher lines from template lines
                    int lineNumber = 1;
                    foreach (var templateLine in template.Lines.OrderBy(l => l.LineNumber))
                    {
                        jv.Lines.Add(new JournalVoucherLine
                        {
                            Id = Guid.NewGuid(),
                            TenantId = tenantId,
                            JournalVoucherId = jv.Id,
                            LineNumber = lineNumber++,
                            AccountId = templateLine.AccountId,
                            DebitAmount = templateLine.DebitAmount,
                            CreditAmount = templateLine.CreditAmount,
                            DebitAmountBase = templateLine.DebitAmount * template.ExchangeRate,
                            CreditAmountBase = templateLine.CreditAmount * template.ExchangeRate,
                            Description = templateLine.Description,
                            Reference = templateLine.Reference,
                            DepartmentId = templateLine.DepartmentId,
                            CreatedAt = DateTime.UtcNow,
                            CreatedBy = "system-recurring-job"
                        });
                    }

                    context.JournalVouchers.Add(jv);

                    // Update template: advance NextExecutionDate, increment count
                    template.LastExecutionDate = processDate;
                    template.ExecutionCount++;
                    template.NextExecutionDate = CalculateNextExecutionDate(
                        template.NextExecutionDate,
                        template.Frequency,
                        template.CustomIntervalDays);

                    // Deactivate if past end date
                    if (template.EndDate.HasValue && template.NextExecutionDate > template.EndDate.Value)
                    {
                        template.IsActive = false;
                        _logger.LogInformation(
                            "Recurring voucher {Name} has reached its end date and was deactivated",
                            template.Name);
                    }

                    createdCount++;

                    _logger.LogInformation(
                        "Created JV {VoucherNumber} from recurring template {TemplateName}",
                        voucherNumber, template.Name);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex,
                        "Failed to create JV from recurring template {TemplateName} ({TemplateId})",
                        template.Name, template.Id);
                }
            }

            await context.SaveChangesAsync();

            _logger.LogInformation(
                "Recurring voucher processing completed for tenant {TenantId}. Created {Count} journal vouchers.",
                tenantId, createdCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Recurring voucher processing failed for tenant {TenantId}, date {ProcessDate}",
                tenantId, processDate.ToString("yyyy-MM-dd"));
            throw;
        }
    }

    private static DateTime CalculateNextExecutionDate(
        DateTime currentDate,
        RecurringFrequency frequency,
        int? customIntervalDays)
    {
        return frequency switch
        {
            RecurringFrequency.Monthly => currentDate.AddMonths(1),
            RecurringFrequency.Quarterly => currentDate.AddMonths(3),
            RecurringFrequency.SemiAnnually => currentDate.AddMonths(6),
            RecurringFrequency.Annually => currentDate.AddYears(1),
            RecurringFrequency.Custom => currentDate.AddDays(customIntervalDays ?? 30),
            _ => currentDate.AddMonths(1)
        };
    }

    private static async Task<string> GenerateVoucherNumberAsync(
        CarmenDbContext context, Guid tenantId, DateTime date)
    {
        var prefix = $"RV-{date:yyyy}-";
        var lastVoucher = await context.JournalVouchers
            .Where(jv => jv.VoucherNumber.StartsWith(prefix))
            .OrderByDescending(jv => jv.VoucherNumber)
            .FirstOrDefaultAsync();

        int nextNumber = 1;
        if (lastVoucher != null)
        {
            var lastNumberStr = lastVoucher.VoucherNumber[prefix.Length..];
            if (int.TryParse(lastNumberStr, out var lastNumber))
            {
                nextNumber = lastNumber + 1;
            }
        }

        return $"{prefix}{nextNumber:D4}";
    }
}
