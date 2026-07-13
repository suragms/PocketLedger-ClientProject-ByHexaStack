namespace PocketLedger.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    ITransactionRepository Transactions { get; }
    IAccountRepository Accounts { get; }
    ICategoryRepository Categories { get; }
    IBudgetRepository Budgets { get; }
    IGoalRepository Goals { get; }
    INotificationRepository Notifications { get; }
    IUserSettingsRepository UserSettings { get; }
    IAuditLogRepository AuditLogs { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
