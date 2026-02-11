using Carmen.Application.DTOs.Jobs;
using Carmen.Application.Jobs;
using Hangfire;
using Hangfire.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// Controller for managing background jobs
/// </summary>
[ApiController]
[Route("api/v1/tenants/{tenantId}/jobs")]
[Authorize]
public class JobsController : ControllerBase
{
    private readonly IBackgroundJobClient _backgroundJobs;
    private readonly IRecurringJobManager _recurringJobs;
    private readonly ILogger<JobsController> _logger;

    public JobsController(
        IBackgroundJobClient backgroundJobs,
        IRecurringJobManager recurringJobs,
        ILogger<JobsController> logger)
    {
        _backgroundJobs = backgroundJobs;
        _recurringJobs = recurringJobs;
        _logger = logger;
    }

    /// <summary>
    /// Get list of available jobs and their status
    /// </summary>
    [HttpGet]
    public ActionResult<List<JobStatusDto>> GetJobs(Guid tenantId)
    {
        var jobs = new List<JobStatusDto>
        {
            new(
                JobId: "depreciation",
                JobName: "Monthly Depreciation",
                Status: "Available",
                LastExecution: null,
                NextExecution: null,
                LastError: null,
                SuccessCount: 0,
                FailureCount: 0
            ),
            new(
                JobId: "recurring-vouchers",
                JobName: "Recurring Voucher Processing",
                Status: "Available",
                LastExecution: null,
                NextExecution: null,
                LastError: null,
                SuccessCount: 0,
                FailureCount: 0
            ),
            new(
                JobId: "amortization",
                JobName: "Prepaid Expense Amortization",
                Status: "Available",
                LastExecution: null,
                NextExecution: null,
                LastError: null,
                SuccessCount: 0,
                FailureCount: 0
            )
        };

        return Ok(jobs);
    }

    /// <summary>
    /// Trigger depreciation job manually
    /// </summary>
    [HttpPost("depreciation/run")]
    public ActionResult<JobTriggerResponse> TriggerDepreciation(
        Guid tenantId,
        [FromBody] TriggerDepreciationRequest request)
    {
        _logger.LogInformation(
            "Triggering depreciation job for tenant {TenantId}, period {FiscalPeriodId}, autoPost: {AutoPost}",
            tenantId, request.FiscalPeriodId, request.AutoPost);

        var jobId = _backgroundJobs.Enqueue<IDepreciationJob>(
            job => job.RunMonthlyDepreciationAsync(tenantId, request.FiscalPeriodId, request.AutoPost));

        return Ok(new JobTriggerResponse(
            JobId: jobId,
            Message: "Depreciation job has been queued",
            EnqueuedAt: DateTime.UtcNow
        ));
    }

    /// <summary>
    /// Trigger post all depreciation job
    /// </summary>
    [HttpPost("depreciation/post-all")]
    public ActionResult<JobTriggerResponse> TriggerPostAllDepreciation(
        Guid tenantId,
        [FromBody] TriggerDepreciationRequest request)
    {
        _logger.LogInformation(
            "Triggering post all depreciation job for tenant {TenantId}, period {FiscalPeriodId}",
            tenantId, request.FiscalPeriodId);

        var jobId = _backgroundJobs.Enqueue<IDepreciationJob>(
            job => job.PostAllDepreciationAsync(tenantId, request.FiscalPeriodId));

        return Ok(new JobTriggerResponse(
            JobId: jobId,
            Message: "Post all depreciation job has been queued",
            EnqueuedAt: DateTime.UtcNow
        ));
    }

    /// <summary>
    /// Trigger recurring voucher processing job
    /// </summary>
    [HttpPost("recurring-vouchers/run")]
    public ActionResult<JobTriggerResponse> TriggerRecurringVouchers(
        Guid tenantId,
        [FromBody] TriggerRecurringVouchersRequest request)
    {
        var processDate = request.ProcessDate ?? DateTime.UtcNow;

        _logger.LogInformation(
            "Triggering recurring voucher job for tenant {TenantId}, date {ProcessDate}",
            tenantId, processDate.ToString("yyyy-MM-dd"));

        var jobId = _backgroundJobs.Enqueue<IRecurringVoucherJob>(
            job => job.ProcessRecurringVouchersAsync(tenantId, processDate));

        return Ok(new JobTriggerResponse(
            JobId: jobId,
            Message: "Recurring voucher processing job has been queued",
            EnqueuedAt: DateTime.UtcNow
        ));
    }

    /// <summary>
    /// Trigger amortization job manually
    /// </summary>
    [HttpPost("amortization/run")]
    public ActionResult<JobTriggerResponse> TriggerAmortization(
        Guid tenantId,
        [FromBody] TriggerAmortizationRequest request)
    {
        _logger.LogInformation(
            "Triggering amortization job for tenant {TenantId}, period {FiscalPeriodId}, autoPost: {AutoPost}",
            tenantId, request.FiscalPeriodId, request.AutoPost);

        var jobId = _backgroundJobs.Enqueue<IAmortizationJob>(
            job => job.RunMonthlyAmortizationAsync(tenantId, request.FiscalPeriodId, request.AutoPost));

        return Ok(new JobTriggerResponse(
            JobId: jobId,
            Message: "Amortization job has been queued",
            EnqueuedAt: DateTime.UtcNow
        ));
    }

    /// <summary>
    /// Get job execution history
    /// </summary>
    [HttpGet("history")]
    public ActionResult<List<JobHistoryDto>> GetJobHistory(
        Guid tenantId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        // Note: This is a simplified implementation
        // In production, you would query Hangfire's storage for job history
        // filtered by tenant ID from job arguments

        var history = new List<JobHistoryDto>();

        try
        {
            using var connection = JobStorage.Current.GetConnection();
            var succeededJobs = connection.GetAllEntriesFromHash("succeeded-job");

            // For now, return empty list as Hangfire history requires more complex queries
            // The actual implementation would parse job history from Hangfire tables
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not retrieve job history from Hangfire storage");
        }

        return Ok(history);
    }

    /// <summary>
    /// Get status of a specific job by ID
    /// </summary>
    [HttpGet("{jobId}/status")]
    public ActionResult<object> GetJobStatus(Guid tenantId, string jobId)
    {
        try
        {
            using var connection = JobStorage.Current.GetConnection();
            var jobData = connection.GetJobData(jobId);

            if (jobData == null)
            {
                return NotFound(new { Message = $"Job {jobId} not found" });
            }

            return Ok(new
            {
                JobId = jobId,
                State = jobData.State,
                CreatedAt = jobData.CreatedAt,
                Job = jobData.Job?.Type.Name
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting job status for {JobId}", jobId);
            return StatusCode(500, new { Message = "Error retrieving job status" });
        }
    }
}
