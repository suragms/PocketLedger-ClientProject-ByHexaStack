using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PocketLedger.Application.Common.Interfaces;
using PocketLedger.Domain.Interfaces;
using PocketLedger.Infrastructure.Persistence;
using PocketLedger.Infrastructure.Repositories;
using PocketLedger.Infrastructure.Services;

namespace PocketLedger.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        if (connectionString != null && (connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) || connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)))
        {
            connectionString = ConvertPostgresUriToConnectionString(connectionString);
        }

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            if (connectionString != null && (connectionString.Contains("Host=") || connectionString.Contains("Port=") || connectionString.Contains("Server=") || connectionString.Contains("Database=") || connectionString.Contains("Username=") || connectionString.Contains("Password=") || connectionString.Contains("User Id=")))
            {
                options.UseNpgsql(
                    connectionString,
                    b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName));
            }
            else
            {
                options.UseSqlite(
                    connectionString,
                    b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName));
            }
        });

        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<ITransactionRepository, TransactionRepository>();
        services.AddScoped<IAccountRepository, AccountRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IBudgetRepository, BudgetRepository>();
        services.AddScoped<IGoalRepository, GoalRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<IUserSettingsRepository, UserSettingsRepository>();
        services.AddScoped<IAuditLogRepository, AuditLogRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IUnitOfWork>(provider => provider.GetRequiredService<ApplicationDbContext>());

        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IPinService, PinService>();
        services.AddScoped<IWebAuthnService, WebAuthnService>();
        services.AddScoped<IFileStorageService, FileStorageService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IReportExportService, ReportExportService>();

        return services;
    }

    private static string ConvertPostgresUriToConnectionString(string uriString)
    {
        try
        {
            if (Uri.TryCreate(uriString, UriKind.Absolute, out var uri))
            {
                var userInfo = uri.UserInfo.Split(':');
                var username = userInfo[0];
                var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
                var host = uri.Host;
                var port = uri.Port == -1 ? 5432 : uri.Port;
                var database = uri.AbsolutePath.TrimStart('/');

                return $"Host={host};Port={port};Database={database};Username={username};Password={password};SslMode=Require;Trust Server Certificate=true;";
            }
        }
        catch
        {
            // Fallback
        }
        return uriString;
    }
}
