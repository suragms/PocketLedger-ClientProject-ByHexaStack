using FluentValidation.TestHelper;
using PocketLedger.Application.Features.Categories.Commands.CreateCategory;
using PocketLedger.Domain.Enums;
using Xunit;

namespace PocketLedger.Application.Tests.Features.Categories.Commands;

public class CreateCategoryCommandValidatorTests
{
    private readonly CreateCategoryCommandValidator _validator = new();

    [Fact]
    public void Should_Have_Error_When_Name_Is_Empty()
    {
        var command = new CreateCategoryCommand { Name = "" };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Should_Have_Error_When_Name_Exceeds_MaxLength()
    {
        var command = new CreateCategoryCommand { Name = new string('a', 101) };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Should_Have_Error_When_Color_Is_Invalid_Hex()
    {
        var command = new CreateCategoryCommand { Color = "not-a-color" };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Color);
    }

    [Fact]
    public void Should_Not_Have_Error_When_Color_Is_Valid_Hex()
    {
        var command = new CreateCategoryCommand { Color = "#FF5722" };
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.Color);
    }

    [Fact]
    public void Should_Not_Have_Error_When_All_Fields_Are_Valid()
    {
        var command = new CreateCategoryCommand
        {
            Name = "Groceries",
            Description = "Food and household items",
            Icon = "shopping-cart",
            Color = "#FF5722",
            Type = (int)CategoryType.Expense
        };
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }
}
