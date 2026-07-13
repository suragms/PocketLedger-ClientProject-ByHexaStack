using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PocketLedger.Application.Common;
using PocketLedger.Application.Features.Goals.Commands.CreateGoal;
using PocketLedger.Application.Features.Goals.Commands.DeleteGoal;
using PocketLedger.Application.Features.Goals.Commands.UpdateGoal;
using PocketLedger.Application.Features.Goals.Commands.ContributeToGoal;
using PocketLedger.Application.Features.Goals.DTOs;
using PocketLedger.Application.Features.Goals.Queries.GetGoalById;
using PocketLedger.Application.Features.Goals.Queries.GetGoals;

namespace PocketLedger.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GoalsController : ControllerBase
{
    private readonly IMediator _mediator;

    public GoalsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetGoals()
    {
        var result = await _mediator.Send(new GetGoalsQuery());
        return Ok(ApiResponse<List<GoalDto>>.SuccessResponse(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetGoalById(int id)
    {
        var result = await _mediator.Send(new GetGoalByIdQuery { Id = id });
        return Ok(ApiResponse<GoalDto>.SuccessResponse(result));
    }

    [HttpPost]
    public async Task<IActionResult> CreateGoal([FromBody] CreateGoalCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(ApiResponse<GoalDto>.SuccessResponse(result, "Goal created successfully."));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateGoal(int id, [FromBody] UpdateGoalCommand command)
    {
        command.Id = id;
        var result = await _mediator.Send(command);
        return Ok(ApiResponse<GoalDto>.SuccessResponse(result, "Goal updated successfully."));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGoal(int id)
    {
        await _mediator.Send(new DeleteGoalCommand { Id = id });
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Goal deleted successfully."));
    }

    [HttpPost("{id}/contribute")]
    public async Task<IActionResult> ContributeToGoal(int id, [FromBody] ContributeToGoalCommand command)
    {
        command.GoalId = id;
        var result = await _mediator.Send(command);
        return Ok(ApiResponse<GoalDto>.SuccessResponse(result, "Contribution added successfully."));
    }
}
