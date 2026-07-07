using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using PocketLedger.API.Controllers;
using PocketLedger.Application.Common;
using PocketLedger.Application.Features.Reports.Queries.GetReport;
using PocketLedger.Application.Common.Interfaces;
using Xunit;

namespace PocketLedger.API.Tests.Controllers;

public class ReportsControllerTests
{
    private readonly Mock<IMediator> _mediatorMock = new();
    private readonly Mock<IReportExportService> _exportServiceMock = new();

    private ReportsController CreateController()
    {
        return new ReportsController(_mediatorMock.Object, _exportServiceMock.Object);
    }

    [Fact]
    public async Task GetReport_Should_Return_Ok_With_Report()
    {
        var report = new ReportDto
        {
            Period = "monthly",
            StartDate = DateTime.UtcNow.AddMonths(-1),
            EndDate = DateTime.UtcNow,
            TotalIncome = 5000,
            TotalExpense = 3000,
            Currency = "USD",
            MonthlyBreakdown = new List<MonthlyDataDto>(),
            CategoryBreakdown = new List<CategorySpendingReportDto>(),
            WalletAnalysis = new List<WalletAnalysisDto>()
        };
        _mediatorMock.Setup(m => m.Send(It.IsAny<GetReportQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(report);

        var controller = CreateController();

        var result = await controller.GetReport("monthly");

        var okResult = Assert.IsType<OkObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<ReportDto>>(okResult.Value);
        Assert.True(apiResponse.Success);
        Assert.Equal("monthly", apiResponse.Data!.Period);
    }

    [Fact]
    public async Task ExportCsv_Should_Return_File()
    {
        var report = new ReportDto
        {
            Period = "monthly",
            StartDate = DateTime.UtcNow.AddMonths(-1),
            EndDate = DateTime.UtcNow,
            TotalIncome = 5000,
            TotalExpense = 3000,
            Currency = "USD",
            MonthlyBreakdown = new List<MonthlyDataDto>(),
            CategoryBreakdown = new List<CategorySpendingReportDto>(),
            WalletAnalysis = new List<WalletAnalysisDto>()
        };
        _mediatorMock.Setup(m => m.Send(It.IsAny<GetReportQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(report);
        _exportServiceMock.Setup(e => e.ExportToCsv(report)).Returns(new byte[] { 1, 2, 3 });

        var controller = CreateController();

        var result = await controller.ExportCsv("monthly");

        var fileResult = Assert.IsType<FileContentResult>(result);
        Assert.Equal("text/csv", fileResult.ContentType);
    }

    [Fact]
    public async Task ExportPdf_Should_Return_File()
    {
        var report = new ReportDto
        {
            Period = "monthly",
            StartDate = DateTime.UtcNow.AddMonths(-1),
            EndDate = DateTime.UtcNow,
            TotalIncome = 5000,
            TotalExpense = 3000,
            Currency = "USD",
            MonthlyBreakdown = new List<MonthlyDataDto>(),
            CategoryBreakdown = new List<CategorySpendingReportDto>(),
            WalletAnalysis = new List<WalletAnalysisDto>()
        };
        _mediatorMock.Setup(m => m.Send(It.IsAny<GetReportQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(report);
        _exportServiceMock.Setup(e => e.ExportToPdf(report)).Returns(new byte[] { 1, 2, 3 });

        var controller = CreateController();

        var result = await controller.ExportPdf("monthly");

        var fileResult = Assert.IsType<FileContentResult>(result);
        Assert.Equal("application/pdf", fileResult.ContentType);
    }
}
