using FluentValidation;
using MediatR;
using Moq;
using PocketLedger.Application.Common.Behaviors;
using Xunit;

namespace PocketLedger.Application.Tests.Common.Behaviors;

public class ValidationBehaviorTests
{
    [Fact]
    public async Task Should_Return_Response_When_No_Validators()
    {
        var behavior = new ValidationBehavior<TestRequest, TestResponse>(new List<IValidator<TestRequest>>());
        var request = new TestRequest();
        var expected = new TestResponse { Message = "Success" };

        var result = await behavior.Handle(request, () => Task.FromResult(expected), CancellationToken.None);

        Assert.Equal(expected.Message, result.Message);
    }

    [Fact]
    public async Task Should_Throw_ValidationException_When_Validation_Fails()
    {
        var validator = new Mock<IValidator<TestRequest>>();
        var validationResult = new FluentValidation.Results.ValidationResult(
            new List<FluentValidation.Results.ValidationFailure>
            {
                new("Name", "Name is required.")
            });
        validator.Setup(v => v.ValidateAsync(It.IsAny<ValidationContext<TestRequest>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(validationResult);

        var behavior = new ValidationBehavior<TestRequest, TestResponse>(new[] { validator.Object });
        var request = new TestRequest();

        await Assert.ThrowsAsync<FluentValidation.ValidationException>(
            () => behavior.Handle(request, () => Task.FromResult(new TestResponse()), CancellationToken.None));
    }

    [Fact]
    public async Task Should_Pass_Through_When_Validation_Succeeds()
    {
        var validator = new Mock<IValidator<TestRequest>>();
        var validationResult = new FluentValidation.Results.ValidationResult();
        validator.Setup(v => v.ValidateAsync(It.IsAny<ValidationContext<TestRequest>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(validationResult);

        var behavior = new ValidationBehavior<TestRequest, TestResponse>(new[] { validator.Object });
        var request = new TestRequest();
        var expected = new TestResponse { Message = "Valid" };

        var result = await behavior.Handle(request, () => Task.FromResult(expected), CancellationToken.None);

        Assert.Equal("Valid", result.Message);
    }

    public class TestRequest : IRequest<TestResponse> { }
    public class TestResponse { public string Message { get; set; } = string.Empty; }
}
