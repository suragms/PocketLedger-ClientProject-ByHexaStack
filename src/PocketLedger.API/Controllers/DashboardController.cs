using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PocketLedger.Application.Common;
using PocketLedger.Application.Features.Dashboard.Queries.GetDashboardSummary;

namespace PocketLedger.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IMediator _mediator;

    public DashboardController(IMediator mediator) => _mediator = mediator;

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(
        [FromQuery] string? period,
        [FromQuery] DateTime? customStartDate,
        [FromQuery] DateTime? customEndDate)
    {
        var query = new GetDashboardSummaryQuery
        {
            Period = period,
            CustomStartDate = customStartDate,
            CustomEndDate = customEndDate,
        };
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<DashboardSummaryDto>.SuccessResponse(result));
    }
}
