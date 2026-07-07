using PocketLedger.Domain.Entities;

namespace PocketLedger.Domain.DomainEvents;

public class AccountBalanceChangedEvent : BaseDomainEvent
{
    public Account Account { get; }
    public decimal PreviousBalance { get; }
    public decimal NewBalance { get; }

    public AccountBalanceChangedEvent(Account account, decimal previousBalance, decimal newBalance)
    {
        Account = account;
        PreviousBalance = previousBalance;
        NewBalance = newBalance;
    }
}
