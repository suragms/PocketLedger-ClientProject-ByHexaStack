using MediatR;
using FluentValidation;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;
using PocketLedger.Application.Features.Settings.Queries.GetSettings;

namespace PocketLedger.Application.Features.Settings.Commands.UpdateNotifications;

public record UpdateNotificationsCommand : IRequest<SettingsDto>
{
    public bool EmailNotifications { get; set; } = true;
    public bool PushNotifications { get; set; } = true;
    public bool BudgetAlerts { get; set; } = true;
    public bool WeeklyReport { get; set; } = true;
    public bool MonthlyReport { get; set; } = true;
}

public class UpdateNotificationsCommandHandler : IRequestHandler<UpdateNotificationsCommand, SettingsDto>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateNotificationsCommandHandler(ICurrentUserService currentUser, IUnitOfWork unitOfWork)
    {
        _currentUser = currentUser;
        _unitOfWork = unitOfWork;
    }

    public async Task<SettingsDto> Handle(UpdateNotificationsCommand request, CancellationToken cancellationToken)
    {
        var settings = await GetOrCreateSettingsAsync(cancellationToken);
        settings.EmailNotifications = request.EmailNotifications;
        settings.PushNotifications = request.PushNotifications;
        settings.BudgetAlerts = request.BudgetAlerts;
        settings.WeeklyReport = request.WeeklyReport;
        settings.MonthlyReport = request.MonthlyReport;
        await _unitOfWork.UserSettings.UpdateAsync(settings, cancellationToken);
        return MapToDto(settings);
    }

    private async Task<UserSettings> GetOrCreateSettingsAsync(CancellationToken cancellationToken)
    {
        var existing = await _unitOfWork.UserSettings.GetByUserIdAsync(_currentUser.UserId!, cancellationToken);
        if (existing != null) return existing;
        var newSettings = new UserSettings { UserId = _currentUser.UserId! };
        return await _unitOfWork.UserSettings.CreateAsync(newSettings, cancellationToken);
    }

    private static SettingsDto MapToDto(UserSettings s) => new()
    {
        Theme = s.Theme, Language = s.Language, Currency = s.Currency,
        EmailNotifications = s.EmailNotifications, PushNotifications = s.PushNotifications,
        BudgetAlerts = s.BudgetAlerts, WeeklyReport = s.WeeklyReport, MonthlyReport = s.MonthlyReport,
        ShowBalance = s.ShowBalance, ShowTransactions = s.ShowTransactions, PublicProfile = s.PublicProfile,
        LoginNotifications = s.LoginNotifications, SessionTimeout = s.SessionTimeout,
        SessionTimeoutMinutes = s.SessionTimeoutMinutes
    };
}
