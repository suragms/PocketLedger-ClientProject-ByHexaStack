using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PocketLedger.Application.Common;
using PocketLedger.Application.Features.Budgets.Commands.CreateBudget;
using PocketLedger.Application.Features.Budgets.Commands.DeleteBudget;
using PocketLedger.Application.Features.Budgets.Commands.UpdateBudget;
using PocketLedger.Application.Features.Budgets.DTOs;
using PocketLedger.Application.Features.Budgets.Queries.GetBudgetAnalytics;
using PocketLedger.Application.Features.Budgets.Queries.GetBudgetById;
using PocketLedger.Application.Features.Budgets.Queries.GetBudgets;

namespace PocketLedger.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BudgetsController : ControllerBase
{
    private readonly IMediator _mediator;

    public BudgetsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetBudgets()
    {
        var result = await _mediator.Send(new GetBudgetsQuery());
        return Ok(ApiResponse<List<BudgetDto>>.SuccessResponse(result));
    }

    [HttpGet("analytics")]
    public async Task<IActionResult> GetBudgetAnalytics()
    {
        var result = await _mediator.Send(new GetBudgetAnalyticsQuery());
        return Ok(ApiResponse<BudgetAnalyticsDto>.SuccessResponse(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetBudgetById(int id)
    {
        var result = await _mediator.Send(new GetBudgetByIdQuery { Id = id });
        return Ok(ApiResponse<BudgetDto>.SuccessResponse(result));
    }

    [HttpPost]
    public async Task<IActionResult> CreateBudget([FromBody] CreateBudgetCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(ApiResponse<BudgetDto>.SuccessResponse(result, "Budget created successfully."));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBudget(int id, [FromBody] UpdateBudgetCommand command)
    {
        command.Id = id;
        var result = await _mediator.Send(command);
        return Ok(ApiResponse<BudgetDto>.SuccessResponse(result, "Budget updated successfully."));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBudget(int id)
    {
        await _mediator.Send(new DeleteBudgetCommand { Id = id });
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Budget deleted successfully."));
    }
}
