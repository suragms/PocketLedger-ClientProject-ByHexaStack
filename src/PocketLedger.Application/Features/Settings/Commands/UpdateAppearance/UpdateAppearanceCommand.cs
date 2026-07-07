using MediatR;
using FluentValidation;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;
using PocketLedger.Application.Features.Settings.Queries.GetSettings;

namespace PocketLedger.Application.Features.Settings.Commands.UpdateAppearance;

public record UpdateAppearanceCommand : IRequest<SettingsDto>
{
    public string Theme { get; set; } = "system";
    public string Language { get; set; } = "en";
    public string Currency { get; set; } = "USD";
}

public class UpdateAppearanceCommandValidator : AbstractValidator<UpdateAppearanceCommand>
{
    public UpdateAppearanceCommandValidator()
    {
        RuleFor(x => x.Theme).NotEmpty().Must(t => new[] { "light", "dark", "system" }.Contains(t));
        RuleFor(x => x.Language).NotEmpty().MaximumLength(10);
        RuleFor(x => x.Currency).NotEmpty().Length(3);
    }
}

public class UpdateAppearanceCommandHandler : IRequestHandler<UpdateAppearanceCommand, SettingsDto>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateAppearanceCommandHandler(ICurrentUserService currentUser, IUnitOfWork unitOfWork)
    {
        _currentUser = currentUser;
        _unitOfWork = unitOfWork;
    }

    public async Task<SettingsDto> Handle(UpdateAppearanceCommand request, CancellationToken cancellationToken)
    {
        var settings = await GetOrCreateSettingsAsync(cancellationToken);
        settings.Theme = request.Theme;
        settings.Language = request.Language;
        settings.Currency = request.Currency;
        await _unitOfWork.UserSettings.UpdateAsync(settings, cancellationToken);
        return MapToDto(settings);
    }

    private async Task<UserSettings> GetOrCreateSettingsAsync(CancellationToken cancellationToken)
    {
        var existing = await _unitOfWork.UserSettings.GetByUserIdAsync(_currentUser.UserId!, cancellationToken);
        if (existing != null) return existing;
        var newSettings = new UserSettings { UserId = _currentUser.UserId!, Currency = "USD" };
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
