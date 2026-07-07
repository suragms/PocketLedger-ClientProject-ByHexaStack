using MediatR;

namespace PocketLedger.Application.Features.Settings.Queries.GetAbout;

public record GetAboutQuery : IRequest<AboutDto>;

public class AboutDto
{
    public string AppName { get; set; } = "PocketLedger";
    public string Version { get; set; } = "1.0.0";
    public string Description { get; set; } = "A comprehensive personal finance management application";
    public string Author { get; set; } = "PocketLedger Team";
    public string Website { get; set; } = "https://pocketledger.app";
    public string SupportEmail { get; set; } = "support@pocketledger.app";
    public string License { get; set; } = "MIT";
    public DateTime ReleaseDate { get; set; } = new DateTime(2025, 1, 1);
    public List<string> Features { get; set; } = new()
    {
        "Transaction tracking with categories and tags",
        "Budget management with alerts",
        "Multi-wallet support",
        "Detailed reports and analytics",
        "CSV and PDF export",
        "Backup and restore",
        "Multi-currency support",
        "Dark and light mode",
        "Mobile responsive design",
        "Two-factor authentication",
        "Passkey support",
        "PIN login"
    };
    public List<LicenseDto> Licenses { get; set; } = new()
    {
        new() { Name = "PocketLedger", License = "MIT", Copyright = "2025 PocketLedger Team" },
        new() { Name = ".NET", License = "MIT", Copyright = ".NET Foundation" },
        new() { Name = "React", License = "MIT", Copyright = "Meta Platforms, Inc." },
        new() { Name = "TailwindCSS", License = "MIT", Copyright = "Tailwind Labs" }
    };
}

public class LicenseDto
{
    public string Name { get; set; } = string.Empty;
    public string License { get; set; } = string.Empty;
    public string Copyright { get; set; } = string.Empty;
}

public class GetAboutQueryHandler : IRequestHandler<GetAboutQuery, AboutDto>
{
    public Task<AboutDto> Handle(GetAboutQuery request, CancellationToken cancellationToken)
    {
        return Task.FromResult(new AboutDto());
    }
}
