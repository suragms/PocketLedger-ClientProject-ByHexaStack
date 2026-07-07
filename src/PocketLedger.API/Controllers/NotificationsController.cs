using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PocketLedger.Application.Common;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationRepository _notificationRepo;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public NotificationsController(
        INotificationRepository notificationRepo,
        ICurrentUserService currentUserService,
        IUnitOfWork unitOfWork)
    {
        _notificationRepo = notificationRepo;
        _currentUserService = currentUserService;
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var userId = _currentUserService.UserId!;
        var skip = (page - 1) * pageSize;
        var notifications = await _notificationRepo.GetByUserIdAsync(userId, skip, pageSize);
        var total = await _notificationRepo.GetTotalCountAsync(userId);
        var unread = await _notificationRepo.GetUnreadCountAsync(userId);

        return Ok(ApiResponse<object>.SuccessResponse(new
        {
            items = notifications,
            totalCount = total,
            unreadCount = unread,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling(total / (double)pageSize),
        }));
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var count = await _notificationRepo.GetUnreadCountAsync(_currentUserService.UserId!);
        return Ok(ApiResponse<int>.SuccessResponse(count));
    }

    [HttpGet("preferences")]
    public async Task<IActionResult> GetPreferences()
    {
        var userId = _currentUserService.UserId!;
        var preference = await _notificationRepo.GetPreferenceAsync(userId);

        if (preference == null)
        {
            preference = new NotificationPreference { UserId = userId };
        }

        return Ok(ApiResponse<NotificationPreference>.SuccessResponse(preference));
    }

    [HttpPut("preferences")]
    public async Task<IActionResult> UpdatePreferences([FromBody] UpdateNotificationPreferencesRequest request)
    {
        var userId = _currentUserService.UserId!;
        var existing = await _notificationRepo.GetPreferenceAsync(userId);

        if (existing == null)
        {
            var preference = new NotificationPreference
            {
                UserId = userId,
                DailyReminderEnabled = request.DailyReminderEnabled,
                DailyReminderHour = request.DailyReminderHour,
                WeeklySummaryEnabled = request.WeeklySummaryEnabled,
                WeeklySummaryDay = request.WeeklySummaryDay,
                MonthlySummaryEnabled = request.MonthlySummaryEnabled,
                MonthlySummaryDay = request.MonthlySummaryDay,
                BudgetAlertEnabled = request.BudgetAlertEnabled,
                BudgetExceededEnabled = request.BudgetExceededEnabled,
                PushNotificationsEnabled = request.PushNotificationsEnabled,
            };
            await _notificationRepo.CreatePreferenceAsync(preference);
        }
        else
        {
            existing.DailyReminderEnabled = request.DailyReminderEnabled;
            existing.DailyReminderHour = request.DailyReminderHour;
            existing.WeeklySummaryEnabled = request.WeeklySummaryEnabled;
            existing.WeeklySummaryDay = request.WeeklySummaryDay;
            existing.MonthlySummaryEnabled = request.MonthlySummaryEnabled;
            existing.MonthlySummaryDay = request.MonthlySummaryDay;
            existing.BudgetAlertEnabled = request.BudgetAlertEnabled;
            existing.BudgetExceededEnabled = request.BudgetExceededEnabled;
            existing.PushNotificationsEnabled = request.PushNotificationsEnabled;
            await _notificationRepo.UpdatePreferenceAsync(existing);
        }

        await _unitOfWork.SaveChangesAsync(CancellationToken.None);

        return Ok(ApiResponse<object>.SuccessResponse(new { message = "Preferences updated" }));
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var notification = await _notificationRepo.GetByIdAsync(id);
        if (notification == null || notification.UserId != _currentUserService.UserId)
            return NotFound();

        await _notificationRepo.MarkAsReadAsync(id);
        await _unitOfWork.SaveChangesAsync(CancellationToken.None);
        return Ok(ApiResponse<object>.SuccessResponse(new { message = "Marked as read" }));
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        await _notificationRepo.MarkAllAsReadAsync(_currentUserService.UserId!);
        await _unitOfWork.SaveChangesAsync(CancellationToken.None);
        return Ok(ApiResponse<object>.SuccessResponse(new { message = "All marked as read" }));
    }

    [HttpPut("{id}/archive")]
    public async Task<IActionResult> Archive(int id)
    {
        var notification = await _notificationRepo.GetByIdAsync(id);
        if (notification == null || notification.UserId != _currentUserService.UserId)
            return NotFound();

        await _notificationRepo.ArchiveAsync(id);
        await _unitOfWork.SaveChangesAsync(CancellationToken.None);
        return Ok(ApiResponse<object>.SuccessResponse(new { message = "Archived" }));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var notification = await _notificationRepo.GetByIdAsync(id);
        if (notification == null || notification.UserId != _currentUserService.UserId)
            return NotFound();

        await _notificationRepo.DeleteAsync(notification);
        await _unitOfWork.SaveChangesAsync(CancellationToken.None);
        return Ok(ApiResponse<object>.SuccessResponse(new { message = "Deleted" }));
    }
}

public class UpdateNotificationPreferencesRequest
{
    public bool DailyReminderEnabled { get; set; }
    public int DailyReminderHour { get; set; } = 9;
    public bool WeeklySummaryEnabled { get; set; }
    public int WeeklySummaryDay { get; set; } = 1;
    public bool MonthlySummaryEnabled { get; set; }
    public int MonthlySummaryDay { get; set; } = 1;
    public bool BudgetAlertEnabled { get; set; } = true;
    public bool BudgetExceededEnabled { get; set; } = true;
    public bool PushNotificationsEnabled { get; set; }
}
