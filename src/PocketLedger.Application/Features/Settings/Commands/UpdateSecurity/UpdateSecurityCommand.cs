using MediatR;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;
using PocketLedger.Application.Features.Settings.Queries.GetSettings;

namespace PocketLedger.Application.Features.Settings.Commands.UpdateSecurity;

public record UpdateSecurityCommand : IRequest<SettingsDto>
{
    public bool LoginNotifications { get; set; } = true;
    public bool SessionTimeout { get; set; } = false;
    public int SessionTimeoutMinutes { get; set; } = 30;
}

public class UpdateSecurityCommandHandler : IRequestHandler<UpdateSecurityCommand, SettingsDto>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateSecurityCommandHandler(ICurrentUserService currentUser, IUnitOfWork unitOfWork)
    {
        _currentUser = currentUser;
        _unitOfWork = unitOfWork;
    }

    public async Task<SettingsDto> Handle(UpdateSecurityCommand request, CancellationToken cancellationToken)
    {
        var settings = await GetOrCreateSettingsAsync(cancellationToken);
        settings.LoginNotifications = request.LoginNotifications;
        settings.SessionTimeout = request.SessionTimeout;
        settings.SessionTimeoutMinutes = request.SessionTimeoutMinutes;
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
