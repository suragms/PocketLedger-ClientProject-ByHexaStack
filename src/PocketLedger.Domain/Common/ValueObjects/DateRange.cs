namespace PocketLedger.Domain.Common.ValueObjects;

public class DateRange : ValueObject
{
    public DateTime Start { get; }
    public DateTime End { get; }

    private DateRange(DateTime start, DateTime end)
    {
        if (start > end)
            throw new ArgumentException("Start date must be before or equal to end date.");
        Start = start;
        End = end;
    }

    public static DateRange Create(DateTime start, DateTime end) => new(start, end);

    public static DateRange Month(DateTime date)
    {
        var monthStart = new DateTime(date.Year, date.Month, 1, 0, 0, 0, date.Kind);
        var monthEnd = monthStart.AddMonths(1).AddDays(-1);
        return new DateRange(monthStart, monthEnd);
    }

    public static DateRange Quarter(DateTime date)
    {
        var quarterStartMonth = ((date.Month - 1) / 3) * 3 + 1;
        var start = new DateTime(date.Year, quarterStartMonth, 1, 0, 0, 0, date.Kind);
        var end = start.AddMonths(3).AddDays(-1);
        return new DateRange(start, end);
    }

    public static DateRange Year(DateTime date)
    {
        var start = new DateTime(date.Year, 1, 1, 0, 0, 0, date.Kind);
        var end = start.AddYears(1).AddDays(-1);
        return new DateRange(start, end);
    }

    public static DateRange Last30Days(DateTime date)
    {
        var end = date.Date;
        var start = end.AddDays(-29);
        return new DateRange(start, end);
    }

    public DateRange GetPreviousPeriod()
    {
        var duration = End - Start;
        var prevEnd = Start.AddDays(-1);
        var prevStart = prevEnd.AddDays(-duration.TotalDays);
        return new DateRange(prevStart, prevEnd);
    }

    public DateRange GetYearOverYearPeriod()
    {
        return new DateRange(Start.AddYears(-1), End.AddYears(-1));
    }

    public static bool operator ==(DateRange? left, DateRange? right)
    {
        if (left is null && right is null) return true;
        if (left is null || right is null) return false;
        return left.Equals(right);
    }

    public static bool operator !=(DateRange? left, DateRange? right) => !(left == right);

    public int DurationDays => (int)(End - Start).TotalDays + 1;

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Start;
        yield return End;
    }

    public override string ToString() => $"{Start:yyyy-MM-dd} to {End:yyyy-MM-dd}";
}
