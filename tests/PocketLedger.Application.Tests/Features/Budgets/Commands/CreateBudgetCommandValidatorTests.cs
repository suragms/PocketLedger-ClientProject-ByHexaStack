using FluentValidation.TestHelper;
using PocketLedger.Application.Features.Budgets.Commands.CreateBudget;
using PocketLedger.Domain.Enums;
using Xunit;

namespace PocketLedger.Application.Tests.Features.Budgets.Commands;

public class CreateBudgetCommandValidatorTests
{
    private readonly CreateBudgetCommandValidator _validator = new();

    [Fact]
    public void Should_Have_Error_When_Name_Is_Empty()
    {
        var command = new CreateBudgetCommand { Name = "" };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Should_Have_Error_When_Name_Exceeds_MaxLength()
    {
        var command = new CreateBudgetCommand { Name = new string('a', 101) };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Should_Have_Error_When_Amount_Is_Zero()
    {
        var command = new CreateBudgetCommand { Amount = 0 };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Amount);
    }

    [Fact]
    public void Should_Have_Error_When_Amount_Is_Negative()
    {
        var command = new CreateBudgetCommand { Amount = -100 };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Amount);
    }

    [Fact]
    public void Should_Have_Error_When_Currency_Is_Empty()
    {
        var command = new CreateBudgetCommand { Currency = "" };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Currency);
    }

    [Fact]
    public void Should_Have_Error_When_Currency_Is_Not_3_Characters()
    {
        var command = new CreateBudgetCommand { Currency = "US" };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Currency);
    }

    [Fact]
    public void Should_Have_Error_When_AlertThreshold_Is_Below_Zero()
    {
        var command = new CreateBudgetCommand { AlertThreshold = -1 };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.AlertThreshold);
    }

    [Fact]
    public void Should_Have_Error_When_AlertThreshold_Exceeds_100()
    {
        var command = new CreateBudgetCommand { AlertThreshold = 101 };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.AlertThreshold);
    }

    [Fact]
    public void Should_Not_Have_Error_When_AlertThreshold_Is_Between_0_And_100()
    {
        var command = new CreateBudgetCommand { AlertThreshold = 80 };
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.AlertThreshold);
    }

    [Fact]
    public void Should_Not_Have_Error_When_All_Fields_Are_Valid()
    {
        var command = new CreateBudgetCommand
        {
            Name = "Food Budget",
            Amount = 400,
            Currency = "USD",
            Period = BudgetPeriod.Monthly,
            StartDate = DateTime.UtcNow,
            AlertThreshold = 80
        };
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }
}
