using FluentValidation;

namespace PocketLedger.Application.Features.Categories.Commands.CreateCategory;

public class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Category name is required.")
            .MaximumLength(100).WithMessage("Category name must not exceed 100 characters.");

        RuleFor(x => x.Color)
            .Matches("^#[0-9A-Fa-f]{6}$").WithMessage("Color must be a valid hex color.");
    }
}
