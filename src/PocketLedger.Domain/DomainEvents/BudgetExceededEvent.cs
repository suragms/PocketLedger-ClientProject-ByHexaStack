using PocketLedger.Domain.Entities;

namespace PocketLedger.Domain.DomainEvents;

public class BudgetExceededEvent : BaseDomainEvent
{
    public Budget Budget { get; }
    public decimal CurrentSpending { get; }

    public BudgetExceededEvent(Budget budget, decimal currentSpending)
    {
        Budget = budget;
        CurrentSpending = currentSpending;
    }
}
