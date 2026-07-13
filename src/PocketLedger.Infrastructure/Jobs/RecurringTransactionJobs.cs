using Microsoft.Extensions.Logging;
using PocketLedger.Domain.Entities;
using PocketLedger.Domain.Enums;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Infrastructure.Jobs;

public class RecurringTransactionJobs
{
    private readonly IRepository<RecurringTransaction> _recurringRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<RecurringTransactionJobs> _logger;

    public RecurringTransactionJobs(
        IRepository<RecurringTransaction> recurringRepo,
        IUnitOfWork unitOfWork,
        ILogger<RecurringTransactionJobs> logger)
    {
        _recurringRepo = recurringRepo;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task MaterializeDueTransactions(CancellationToken ct = default)
    {
        var due = await _recurringRepo.FindAsync(
            r => r.IsActive && r.NextDueDate <= DateTime.UtcNow && !r.IsDeleted && (r.EndDate == null || r.EndDate >= DateTime.UtcNow),
            ct);

        _logger.LogInformation("Found {Count} due recurring transactions", due.Count);

        foreach (var recurring in due)
        {
            try
            {
                var account = await _unitOfWork.Accounts.GetByIdAsync(recurring.AccountId, ct);
                if (account == null)
                {
                    _logger.LogWarning("Account {AccountId} not found for recurring transaction {Id}", recurring.AccountId, recurring.Id);
                    continue;
                }

                var transaction = new Transaction
                {
                    Amount = recurring.Amount,
                    Currency = recurring.Currency,
                    Type = recurring.Type,
                    Date = DateTime.UtcNow,
                    Note = recurring.Note,
                    Payee = recurring.Payee,
                    PaymentMethod = PaymentMethod.BankTransfer,
                    IsRecurring = true,
                    RecurringTransactionId = recurring.Id,
                    AccountId = recurring.AccountId,
                    CategoryId = recurring.CategoryId,
                    UserId = recurring.UserId,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = recurring.UserId
                };

                await _unitOfWork.Transactions.AddAsync(transaction, ct);

                account.Balance = recurring.Type switch
                {
                    TransactionType.Income => account.Balance + recurring.Amount,
                    TransactionType.Expense => account.Balance - recurring.Amount,
                    _ => account.Balance
                };
                account.UpdatedAt = DateTime.UtcNow;
                await _unitOfWork.Accounts.UpdateAsync(account, ct);

                // Advance the next due date
                recurring.NextDueDate = recurring.NextDueDate.AddDays(recurring.FrequencyDays);
                recurring.UpdatedAt = DateTime.UtcNow;
                await _recurringRepo.UpdateAsync(recurring, ct);

                await _unitOfWork.SaveChangesAsync(ct);

                _logger.LogInformation("Materialized recurring transaction {RecurringId} -> Transaction {TransactionId}",
                    recurring.Id, transaction.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to materialize recurring transaction {Id}", recurring.Id);
            }
        }
    }
}
