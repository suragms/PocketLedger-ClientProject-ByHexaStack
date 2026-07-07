using FluentValidation.TestHelper;
using PocketLedger.Application.Features.Transactions.Commands.CreateTransaction;
using PocketLedger.Domain.Enums;
using Xunit;

namespace PocketLedger.Application.Tests.Features.Transactions.Commands;

public class CreateTransactionCommandValidatorTests
{
    private readonly CreateTransactionCommandValidator _validator = new();

    [Fact]
    public void Should_Have_Error_When_Amount_Is_Zero()
    {
        var command = new CreateTransactionCommand { Amount = 0 };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Amount);
    }

    [Fact]
    public void Should_Have_Error_When_Amount_Is_Negative()
    {
        var command = new CreateTransactionCommand { Amount = -10 };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Amount);
    }

    [Fact]
    public void Should_Not_Have_Error_When_Amount_Is_Positive()
    {
        var command = new CreateTransactionCommand { Amount = 100, Currency = "USD", Date = DateTime.UtcNow, AccountId = 1 };
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.Amount);
    }

    [Fact]
    public void Should_Have_Error_When_Currency_Is_Empty()
    {
        var command = new CreateTransactionCommand { Currency = "" };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Currency);
    }

    [Fact]
    public void Should_Have_Error_When_Currency_Is_Not_3_Characters()
    {
        var command = new CreateTransactionCommand { Currency = "US" };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Currency);
    }

    [Fact]
    public void Should_Have_Error_When_AccountId_Is_Zero()
    {
        var command = new CreateTransactionCommand { AccountId = 0 };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.AccountId);
    }

    [Fact]
    public void Should_Have_Error_When_Note_Exceeds_MaxLength()
    {
        var command = new CreateTransactionCommand { Note = new string('a', 501) };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Note);
    }

    [Fact]
    public void Should_Have_Error_When_Payee_Exceeds_MaxLength()
    {
        var command = new CreateTransactionCommand { Payee = new string('a', 201) };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Payee);
    }

    [Fact]
    public void Should_Have_Error_When_Reference_Exceeds_MaxLength()
    {
        var command = new CreateTransactionCommand { Reference = new string('a', 101) };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Reference);
    }

    [Fact]
    public void Should_Not_Have_Error_When_All_Fields_Are_Valid()
    {
        var command = new CreateTransactionCommand
        {
            Amount = 50.25m,
            Currency = "USD",
            Date = DateTime.UtcNow,
            AccountId = 1,
            Type = TransactionType.Expense,
            Note = "Groceries",
            Payee = "Walmart",
            Reference = "REF-001"
        };
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }
}
