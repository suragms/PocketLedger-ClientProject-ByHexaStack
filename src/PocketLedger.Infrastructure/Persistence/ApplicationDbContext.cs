using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PocketLedger.Domain.Common;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Interfaces;
using PocketLedger.Infrastructure.Repositories;

namespace PocketLedger.Infrastructure.Persistence;

public class ApplicationDbContext : IdentityDbContext<User, Role, string, IdentityUserClaim<string>, IdentityUserRole<string>, IdentityUserLogin<string>, IdentityRoleClaim<string>, IdentityUserToken<string>>, IUnitOfWork
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Budget> Budgets => Set<Budget>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<TransactionTag> TransactionTags => Set<TransactionTag>();
    public DbSet<RecurringTransaction> RecurringTransactions => Set<RecurringTransaction>();
    public DbSet<UserPasskey> UserPasskeys => Set<UserPasskey>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<NotificationPreference> NotificationPreferences => Set<NotificationPreference>();
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    ITransactionRepository IUnitOfWork.Transactions => new TransactionRepository(this);
    IAccountRepository IUnitOfWork.Accounts => new AccountRepository(this);
    ICategoryRepository IUnitOfWork.Categories => new CategoryRepository(this);
    IBudgetRepository IUnitOfWork.Budgets => new BudgetRepository(this);
    INotificationRepository IUnitOfWork.Notifications => new NotificationRepository(this);
    IUserSettingsRepository IUnitOfWork.UserSettings => new UserSettingsRepository(this);
    IAuditLogRepository IUnitOfWork.AuditLogs => new AuditLogRepository(this);

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        builder.Entity<UserPasskey>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CredentialId).IsRequired();
            entity.Property(e => e.PublicKey).IsRequired();
            entity.HasOne(e => e.User).WithMany(u => u.Passkeys).HasForeignKey(e => e.UserId);
        });

        builder.Entity<UserRole>(entity =>
        {
            entity.HasOne(e => e.User).WithMany(u => u.UserRoles).HasForeignKey(e => e.UserId);
            entity.HasOne(e => e.Role).WithMany().HasForeignKey(e => e.RoleId);
        });
    }
}
