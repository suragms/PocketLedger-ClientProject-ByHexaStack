using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PocketLedger.Application.Common;
using PocketLedger.Application.Features.RecurringTransactions.Commands.CreateRecurringTransaction;
using PocketLedger.Application.Features.RecurringTransactions.Commands.DeleteRecurringTransaction;
using PocketLedger.Application.Features.RecurringTransactions.Commands.ToggleRecurringTransaction;
using PocketLedger.Application.Features.RecurringTransactions.Commands.UpdateRecurringTransaction;
using PocketLedger.Application.Features.RecurringTransactions.DTOs;
using PocketLedger.Application.Features.RecurringTransactions.Queries.GetRecurringTransactionById;
using PocketLedger.Application.Features.RecurringTransactions.Queries.GetRecurringTransactions;

namespace PocketLedger.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[Produces("application/json")]
public class RecurringTransactionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public RecurringTransactionsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<RecurringTransactionDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRecurringTransactions([FromQuery] GetRecurringTransactionsQuery query)
    {
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<List<RecurringTransactionDto>>.SuccessResponse(result));
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<RecurringTransactionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRecurringTransaction(int id)
    {
        var result = await _mediator.Send(new GetRecurringTransactionByIdQuery { Id = id });
        return Ok(ApiResponse<RecurringTransactionDto>.SuccessResponse(result));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<RecurringTransactionDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateRecurringTransaction([FromBody] CreateRecurringTransactionCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetRecurringTransaction), new { id = result.Id },
            ApiResponse<RecurringTransactionDto>.SuccessResponse(result, "Recurring transaction created successfully."));
    }

    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<RecurringTransactionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateRecurringTransaction(int id, [FromBody] UpdateRecurringTransactionCommand command)
    {
        command.Id = id;
        var result = await _mediator.Send(command);
        return Ok(ApiResponse<RecurringTransactionDto>.SuccessResponse(result, "Recurring transaction updated successfully."));
    }

    [HttpPut("{id}/toggle")]
    [ProducesResponseType(typeof(ApiResponse<RecurringTransactionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ToggleRecurringTransaction(int id)
    {
        var result = await _mediator.Send(new ToggleRecurringTransactionCommand { Id = id });
        var status = result.IsActive ? "resumed" : "paused";
        return Ok(ApiResponse<RecurringTransactionDto>.SuccessResponse(result, $"Recurring transaction {status} successfully."));
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteRecurringTransaction(int id)
    {
        await _mediator.Send(new DeleteRecurringTransactionCommand { Id = id });
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Recurring transaction deleted successfully."));
    }
}
