namespace PocketLedger.Domain.Common.ValueObjects;

public class Money : ValueObject
{
    public decimal Amount { get; }
    public string Currency { get; }

    private Money(decimal amount, string currency)
    {
        Amount = amount;
        Currency = currency;
    }

    public static Money Create(decimal amount, string currency = "USD")
    {
        if (string.IsNullOrWhiteSpace(currency))
            throw new ArgumentException("Currency is required.", nameof(currency));
        if (currency.Length != 3)
            throw new ArgumentException("Currency must be 3 characters.", nameof(currency));
        return new Money(amount, currency.ToUpperInvariant());
    }

    public static Money Zero(string currency = "USD") => Create(0, currency);

    public Money Add(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException("Cannot add amounts with different currencies.");
        return Create(Amount + other.Amount, Currency);
    }

    public Money Subtract(Money other)
    {
        if (Currency != other.Currency)
            throw new InvalidOperationException("Cannot subtract amounts with different currencies.");
        return Create(Amount - other.Amount, Currency);
    }

    public static Money operator +(Money left, Money right) => left.Add(right);
    public static Money operator -(Money left, Money right) => left.Subtract(right);
    public static bool operator >(Money left, Money right) => left.Amount > right.Amount;
    public static bool operator <(Money left, Money right) => left.Amount < right.Amount;
    public static bool operator >=(Money left, Money right) => left.Amount >= right.Amount;
    public static bool operator <=(Money left, Money right) => left.Amount <= right.Amount;

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Amount;
        yield return Currency;
    }

    public override string ToString() => $"{Amount:F2} {Currency}";
}
