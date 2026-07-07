namespace PocketLedger.Domain.Common;

public abstract class ValueObject
{
    protected static bool EqualOperator(ValueObject? left, ValueObject? right)
    {
        if (left is null || right is null) return false;
        if (ReferenceEquals(left, right)) return true;
        return left.GetType() == right.GetType() && left.GetEqualityComponents().SequenceEqual(right.GetEqualityComponents());
    }

    protected static bool NotEqualOperator(ValueObject? left, ValueObject? right)
    {
        return !EqualOperator(left, right);
    }

    public override bool Equals(object? obj)
    {
        if (obj is null || obj.GetType() != GetType()) return false;
        var other = (ValueObject)obj;
        return GetEqualityComponents().SequenceEqual(other.GetEqualityComponents());
    }

    public override int GetHashCode()
    {
        return GetEqualityComponents()
            .Select(x => x?.GetHashCode() ?? 0)
            .Aggregate((x, y) => x ^ y);
    }

    protected abstract IEnumerable<object?> GetEqualityComponents();
}
