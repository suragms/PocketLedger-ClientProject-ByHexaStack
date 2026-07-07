using MediatR;
using Microsoft.Extensions.Logging;
using Moq;
using PocketLedger.Application.Common.Behaviors;
using Xunit;

namespace PocketLedger.Application.Tests.Common.Behaviors;

public class LoggingBehaviorTests
{
    private readonly Mock<ILogger<LoggingBehavior<TestRequest, TestResponse>>> _loggerMock = new();

    [Fact]
    public async Task Should_Log_Handling_And_Handled_Messages()
    {
        var behavior = new LoggingBehavior<TestRequest, TestResponse>(_loggerMock.Object);
        var request = new TestRequest();
        var expected = new TestResponse { Message = "Done" };

        var result = await behavior.Handle(request, () => Task.FromResult(expected), CancellationToken.None);

        Assert.Equal("Done", result.Message);
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.IsAny<It.IsAnyType>(),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Exactly(2));
    }

    [Fact]
    public async Task Should_Log_Error_When_Exception_Occurs()
    {
        var behavior = new LoggingBehavior<TestRequest, TestResponse>(_loggerMock.Object);
        var request = new TestRequest();

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => behavior.Handle(request, () => throw new InvalidOperationException("Test error"), CancellationToken.None));

        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.IsAny<It.IsAnyType>(),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    public class TestRequest : IRequest<TestResponse> { }
    public class TestResponse { public string Message { get; set; } = string.Empty; }
}
