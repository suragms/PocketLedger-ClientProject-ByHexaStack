using PocketLedger.Domain.Entities;

namespace PocketLedger.Domain.DomainEvents;

public class TransactionCreatedEvent : BaseDomainEvent
{
    public Transaction Transaction { get; }

    public TransactionCreatedEvent(Transaction transaction)
    {
        Transaction = transaction;
    }
}
