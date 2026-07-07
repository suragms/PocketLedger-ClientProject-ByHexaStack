using MediatR;
using PocketLedger.Application.Features.Accounts.DTOs;

namespace PocketLedger.Application.Features.Accounts.Queries.GetAccountById;

public class GetAccountByIdQuery : IRequest<AccountDto>
{
    public int Id { get; set; }
}
