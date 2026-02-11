using Carmen.Application.DTOs.Common;
using Carmen.Application.DTOs.Notification;
using Carmen.Application.Services.Notification;
using Carmen.Domain.Entities.Notification;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Carmen.WebApi.Controllers;

/// <summary>
/// Notification management endpoints
/// </summary>
[ApiController]
[Route("api/v1/tenants/{tenantId:guid}/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly ILogger<NotificationsController> _logger;

    public NotificationsController(
        INotificationService notificationService,
        ILogger<NotificationsController> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("sub")?.Value
            ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }

    /// <summary>
    /// Get paginated notifications for current user
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResult<NotificationDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<NotificationDto>>> GetNotifications(
        [FromRoute] Guid tenantId,
        [FromQuery] NotificationType? type,
        [FromQuery] bool? isRead,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = GetCurrentUserId();
        var queryParams = new NotificationQueryParams
        {
            Type = type,
            IsRead = isRead,
            Page = page,
            PageSize = Math.Min(pageSize, 100),
        };

        var result = await _notificationService.GetUserNotificationsAsync(tenantId, userId, queryParams);
        return Ok(result);
    }

    /// <summary>
    /// Get unread notification count for current user
    /// </summary>
    [HttpGet("unread-count")]
    [ProducesResponseType(typeof(UnreadCountDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<UnreadCountDto>> GetUnreadCount([FromRoute] Guid tenantId)
    {
        var userId = GetCurrentUserId();
        var count = await _notificationService.GetUnreadCountAsync(tenantId, userId);
        return Ok(new UnreadCountDto { Count = count });
    }

    /// <summary>
    /// Mark a specific notification as read
    /// </summary>
    [HttpPut("{id:guid}/read")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult> MarkAsRead(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        await _notificationService.MarkAsReadAsync(tenantId, id);
        return NoContent();
    }

    /// <summary>
    /// Mark all notifications as read for current user
    /// </summary>
    [HttpPut("read-all")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult> MarkAllRead([FromRoute] Guid tenantId)
    {
        var userId = GetCurrentUserId();
        await _notificationService.MarkAllReadAsync(tenantId, userId);
        return NoContent();
    }

    /// <summary>
    /// Delete a specific notification
    /// </summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult> Delete(
        [FromRoute] Guid tenantId,
        [FromRoute] Guid id)
    {
        await _notificationService.DeleteAsync(tenantId, id);
        return NoContent();
    }

    /// <summary>
    /// Get notification preferences for current user
    /// </summary>
    [HttpGet("preferences")]
    [ProducesResponseType(typeof(List<NotificationPreferenceDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<NotificationPreferenceDto>>> GetPreferences(
        [FromRoute] Guid tenantId)
    {
        var userId = GetCurrentUserId();
        var result = await _notificationService.GetPreferencesAsync(userId);
        return Ok(result);
    }

    /// <summary>
    /// Update notification preferences for current user
    /// </summary>
    [HttpPut("preferences")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult> UpdatePreferences(
        [FromRoute] Guid tenantId,
        [FromBody] List<UpdatePreferenceRequest> requests)
    {
        var userId = GetCurrentUserId();
        await _notificationService.UpdatePreferencesAsync(userId, requests);
        return NoContent();
    }
}
