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
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlite(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<ITransactionRepository, TransactionRepository>();
        services.AddScoped<IAccountRepository, AccountRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IBudgetRepository, BudgetRepository>();
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
}
