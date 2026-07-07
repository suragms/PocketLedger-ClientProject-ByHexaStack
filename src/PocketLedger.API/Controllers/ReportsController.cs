using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PocketLedger.Application.Common;
using PocketLedger.Application.Features.Reports.Queries.GetReport;
using PocketLedger.Application.Features.Reports.Queries.GetSpendingByCategory;
using PocketLedger.Application.Features.Reports.Queries.GetIncomeVsExpense;
using PocketLedger.Application.Common.Interfaces;

namespace PocketLedger.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IReportExportService _exportService;

    public ReportsController(IMediator mediator, IReportExportService exportService)
    {
        _mediator = mediator;
        _exportService = exportService;
    }

    [HttpGet("income-vs-expense")]
    public async Task<IActionResult> GetIncomeVsExpense([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        var result = await _mediator.Send(new GetIncomeVsExpenseQuery { StartDate = startDate, EndDate = endDate });
        return Ok(ApiResponse<IncomeVsExpenseDto>.SuccessResponse(result));
    }

    [HttpGet("spending-by-category")]
    public async Task<IActionResult> GetSpendingByCategory([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        var result = await _mediator.Send(new GetSpendingByCategoryQuery { StartDate = startDate, EndDate = endDate });
        return Ok(ApiResponse<List<CategorySpendingDto>>.SuccessResponse(result));
    }

    [HttpGet]
    public async Task<IActionResult> GetReport(
        [FromQuery] string period = "monthly",
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var result = await _mediator.Send(new GetReportQuery
        {
            Period = period,
            StartDate = startDate,
            EndDate = endDate,
        });
        return Ok(ApiResponse<ReportDto>.SuccessResponse(result));
    }

    [HttpGet("export/csv")]
    public async Task<IActionResult> ExportCsv(
        [FromQuery] string period = "monthly",
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var result = await _mediator.Send(new GetReportQuery
        {
            Period = period,
            StartDate = startDate,
            EndDate = endDate,
        });

        var csvBytes = _exportService.ExportToCsv(result);
        return File(csvBytes, "text/csv", $"report_{period}_{DateTime.UtcNow:yyyyMMdd}.csv");
    }

    [HttpGet("export/pdf")]
    public async Task<IActionResult> ExportPdf(
        [FromQuery] string period = "monthly",
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var result = await _mediator.Send(new GetReportQuery
        {
            Period = period,
            StartDate = startDate,
            EndDate = endDate,
        });

        var pdfBytes = _exportService.ExportToPdf(result);
        return File(pdfBytes, "application/pdf", $"report_{period}_{DateTime.UtcNow:yyyyMMdd}.pdf");
    }
}
