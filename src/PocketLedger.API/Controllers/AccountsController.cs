using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PocketLedger.Application.Common;
using PocketLedger.Application.Features.Accounts.Commands.ArchiveAccount;
using PocketLedger.Application.Features.Accounts.Commands.CreateAccount;
using PocketLedger.Application.Features.Accounts.Commands.DeleteAccount;
using PocketLedger.Application.Features.Accounts.Commands.RestoreAccount;
using PocketLedger.Application.Features.Accounts.Commands.UpdateAccount;
using PocketLedger.Application.Features.Accounts.DTOs;
using PocketLedger.Application.Features.Accounts.Queries.GetAccountById;
using PocketLedger.Application.Features.Accounts.Queries.GetAccounts;
using PocketLedger.Application.Features.Accounts.Queries.GetWalletStatistics;

namespace PocketLedger.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AccountsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AccountsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAccounts([FromQuery] GetAccountsQuery query)
    {
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<PagedResult<AccountDto>>.SuccessResponse(result));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetAccount(int id)
    {
        var result = await _mediator.Send(new GetAccountByIdQuery { Id = id });
        return Ok(ApiResponse<AccountDto>.SuccessResponse(result));
    }

    [HttpGet("{id}/statistics")]
    public async Task<IActionResult> GetWalletStatistics(int id)
    {
        var result = await _mediator.Send(new GetWalletStatisticsQuery { AccountId = id });
        return Ok(ApiResponse<WalletStatisticsDto>.SuccessResponse(result));
    }

    [HttpPost]
    public async Task<IActionResult> CreateAccount([FromBody] CreateAccountCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetAccount), new { id = result.Id }, ApiResponse<AccountDto>.SuccessResponse(result, "Account created successfully."));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAccount(int id, [FromBody] UpdateAccountCommand command)
    {
        command.Id = id;
        var result = await _mediator.Send(command);
        return Ok(ApiResponse<AccountDto>.SuccessResponse(result, "Account updated successfully."));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAccount(int id)
    {
        await _mediator.Send(new DeleteAccountCommand { Id = id });
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Account deleted successfully."));
    }

    [HttpPut("{id}/archive")]
    public async Task<IActionResult> ArchiveAccount(int id)
    {
        await _mediator.Send(new ArchiveAccountCommand { Id = id });
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Account archived successfully."));
    }

    [HttpPut("{id}/restore")]
    public async Task<IActionResult> RestoreAccount(int id)
    {
        await _mediator.Send(new RestoreAccountCommand { Id = id });
        return Ok(ApiResponse<object>.SuccessResponse(null!, "Account restored successfully."));
    }
}
