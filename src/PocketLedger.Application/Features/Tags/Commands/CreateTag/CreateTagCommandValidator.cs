using FluentValidation;

namespace PocketLedger.Application.Features.Tags.Commands.CreateTag;

public class CreateTagCommandValidator : AbstractValidator<CreateTagCommand>
{
    public CreateTagCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(50).WithMessage("Tag name is required and must not exceed 50 characters.");
        RuleFor(x => x.Color).NotEmpty().Length(7).WithMessage("Color must be a valid hex color.");
    }
}
