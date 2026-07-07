using MediatR;
using Microsoft.Extensions.Logging;
using Moq;
using PocketLedger.Application.Common.Behaviors;
using Xunit;

namespace PocketLedger.Application.Tests.Common.Behaviors;

public class PerformanceBehaviorTests
{
    private readonly Mock<ILogger<PerformanceBehavior<TestRequest, TestResponse>>> _loggerMock = new();

    [Fact]
    public async Task Should_Return_Response_When_Request_Is_Fast()
    {
        var behavior = new PerformanceBehavior<TestRequest, TestResponse>(_loggerMock.Object);
        var request = new TestRequest();
        var expected = new TestResponse { Message = "Fast" };

        var result = await behavior.Handle(request, () => Task.FromResult(expected), CancellationToken.None);

        Assert.Equal("Fast", result.Message);
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.IsAny<It.IsAnyType>(),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Never);
    }

    [Fact]
    public async Task Should_Log_Warning_When_Request_Is_Slow()
    {
        var slowLoggerMock = new Mock<ILogger<PerformanceBehavior<SlowRequest, TestResponse>>>();
        var behavior = new PerformanceBehavior<SlowRequest, TestResponse>(slowLoggerMock.Object);
        var request = new SlowRequest();
        var expected = new TestResponse { Message = "Slow" };

        var result = await behavior.Handle(request, () =>
        {
            Thread.Sleep(600);
            return Task.FromResult(expected);
        }, CancellationToken.None);

        Assert.Equal("Slow", result.Message);
        slowLoggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.IsAny<It.IsAnyType>(),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    public class TestRequest : IRequest<TestResponse> { }
    public class SlowRequest : IRequest<TestResponse> { }
    public class TestResponse { public string Message { get; set; } = string.Empty; }
}
