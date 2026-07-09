using FluentAssertions;
using PocketLedger.Domain.Common.ValueObjects;
using Xunit;

namespace PocketLedger.Application.Tests.Domain.ValueObjects;

public class DateRangeTests
{
    [Fact]
    public void Create_With_Valid_Dates_Should_Succeed()
    {
        var start = new DateTime(2024, 1, 1);
        var end = new DateTime(2024, 1, 31);
        var range = DateRange.Create(start, end);

        range.Start.Should().Be(start);
        range.End.Should().Be(end);
    }

    [Fact]
    public void Create_With_Start_After_End_Should_Throw()
    {
        var start = new DateTime(2024, 2, 1);
        var end = new DateTime(2024, 1, 31);

        var act = () => DateRange.Create(start, end);

        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Month_Should_Set_Start_To_First_Of_Month()
    {
        var date = new DateTime(2024, 6, 15);
        var range = DateRange.Month(date);

        range.Start.Should().Be(new DateTime(2024, 6, 1));
    }

    [Fact]
    public void Month_Should_Set_End_To_Last_Of_Month()
    {
        var date = new DateTime(2024, 6, 15);
        var range = DateRange.Month(date);

        range.End.Should().Be(new DateTime(2024, 6, 30));
    }

    [Fact]
    public void Month_December_Should_Have_31_Days()
    {
        var date = new DateTime(2024, 12, 15);
        var range = DateRange.Month(date);

        range.End.Should().Be(new DateTime(2024, 12, 31));
    }

    [Fact]
    public void Quarter_Q1_Should_Be_Jan_To_Mar()
    {
        var date = new DateTime(2024, 2, 15);
        var range = DateRange.Quarter(date);

        range.Start.Should().Be(new DateTime(2024, 1, 1));
        range.End.Should().Be(new DateTime(2024, 3, 31));
    }

    [Fact]
    public void Quarter_Q4_Should_Be_Oct_To_Dec()
    {
        var date = new DateTime(2024, 11, 15);
        var range = DateRange.Quarter(date);

        range.Start.Should().Be(new DateTime(2024, 10, 1));
        range.End.Should().Be(new DateTime(2024, 12, 31));
    }

    [Fact]
    public void Year_Should_Set_Start_To_Jan_1()
    {
        var date = new DateTime(2024, 6, 15);
        var range = DateRange.Year(date);

        range.Start.Should().Be(new DateTime(2024, 1, 1));
        range.End.Should().Be(new DateTime(2024, 12, 31));
    }

    [Fact]
    public void Year_Leap_Year_Should_Have_366_Days()
    {
        var date = new DateTime(2024, 6, 15);
        var range = DateRange.Year(date);

        range.DurationDays.Should().Be(366);
    }

    [Fact]
    public void Last30Days_Should_Have_30_Days()
    {
        var date = new DateTime(2024, 6, 15);
        var range = DateRange.Last30Days(date);

        range.Start.Should().Be(new DateTime(2024, 5, 17));
        range.End.Should().Be(new DateTime(2024, 6, 15));
        range.DurationDays.Should().Be(30);
    }

    [Fact]
    public void GetPreviousPeriod_Should_Return_Same_Length()
    {
        var range = DateRange.Month(new DateTime(2024, 6, 15));
        var previous = range.GetPreviousPeriod();

        previous.DurationDays.Should().Be(range.DurationDays);
        previous.End.Should().Be(range.Start.AddDays(-1));
    }

    [Fact]
    public void GetPreviousPeriod_January_Should_Go_To_December()
    {
        var range = DateRange.Month(new DateTime(2024, 1, 15));
        var previous = range.GetPreviousPeriod();

        previous.Start.Should().Be(new DateTime(2023, 12, 1));
        previous.End.Should().Be(new DateTime(2023, 12, 31));
    }

    [Fact]
    public void GetYearOverYearPeriod_Should_Return_Same_Calendar_Period_Previous_Year()
    {
        var range = DateRange.Month(new DateTime(2024, 6, 15));
        var yoy = range.GetYearOverYearPeriod();

        yoy.Start.Should().Be(new DateTime(2023, 6, 1));
        yoy.End.Should().Be(new DateTime(2023, 6, 30));
        yoy.DurationDays.Should().Be(range.DurationDays);
    }

    [Fact]
    public void Equals_Same_Dates_Should_Be_Equal()
    {
        var start = new DateTime(2024, 1, 1);
        var end = new DateTime(2024, 1, 31);
        var range1 = DateRange.Create(start, end);
        var range2 = DateRange.Create(start, end);

        range1.Should().Be(range2);
        (range1 == range2).Should().BeTrue();
    }

    [Fact]
    public void Equals_Different_Dates_Should_Not_Be_Equal()
    {
        var range1 = DateRange.Month(new DateTime(2024, 1, 15));
        var range2 = DateRange.Month(new DateTime(2024, 2, 15));

        range1.Should().NotBe(range2);
        (range1 != range2).Should().BeTrue();
    }
}
