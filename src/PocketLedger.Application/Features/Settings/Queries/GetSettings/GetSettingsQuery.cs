using MediatR;
using Microsoft.AspNetCore.Identity;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Settings.Queries.GetSettings;

public record GetSettingsQuery : IRequest<SettingsDto>;

public class SettingsDto
{
    // Appearance
    public string Theme { get; set; } = "system";
    public string Language { get; set; } = "en";
    public string Currency { get; set; } = "USD";

    // Notifications
    public bool EmailNotifications { get; set; } = true;
    public bool PushNotifications { get; set; } = true;
    public bool BudgetAlerts { get; set; } = true;
    public bool WeeklyReport { get; set; } = true;
    public bool MonthlyReport { get; set; } = true;

    // Privacy
    public bool ShowBalance { get; set; } = true;
    public bool ShowTransactions { get; set; } = true;
    public bool PublicProfile { get; set; } = false;

    // Security
    public bool LoginNotifications { get; set; } = true;
    public bool SessionTimeout { get; set; } = false;
    public int SessionTimeoutMinutes { get; set; } = 30;
}

public class GetSettingsQueryHandler : IRequestHandler<GetSettingsQuery, SettingsDto>
{
    private readonly UserManager<User> _userManager;
    private readonly ICurrentUserService _currentUser;
    private readonly IUnitOfWork _unitOfWork;

    public GetSettingsQueryHandler(
        UserManager<User> userManager,
        ICurrentUserService currentUser,
        IUnitOfWork unitOfWork)
    {
        _userManager = userManager;
        _currentUser = currentUser;
        _unitOfWork = unitOfWork;
    }

    public async Task<SettingsDto> Handle(GetSettingsQuery request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(_currentUser.UserId!)
            ?? throw new Exception("User not found");

        var settings = await _unitOfWork.UserSettings.GetByUserIdAsync(_currentUser.UserId!, cancellationToken);

        if (settings == null)
        {
            return new SettingsDto { Currency = user.DefaultCurrency };
        }

        return new SettingsDto
        {
            Theme = settings.Theme,
            Language = settings.Language,
            Currency = settings.Currency,
            EmailNotifications = settings.EmailNotifications,
            PushNotifications = settings.PushNotifications,
            BudgetAlerts = settings.BudgetAlerts,
            WeeklyReport = settings.WeeklyReport,
            MonthlyReport = settings.MonthlyReport,
            ShowBalance = settings.ShowBalance,
            ShowTransactions = settings.ShowTransactions,
            PublicProfile = settings.PublicProfile,
            LoginNotifications = settings.LoginNotifications,
            SessionTimeout = settings.SessionTimeout,
            SessionTimeoutMinutes = settings.SessionTimeoutMinutes
        };
    }
}
