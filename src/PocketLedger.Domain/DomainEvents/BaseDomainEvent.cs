using MediatR;

namespace PocketLedger.Domain.DomainEvents;

public abstract class BaseDomainEvent : INotification
{
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}
