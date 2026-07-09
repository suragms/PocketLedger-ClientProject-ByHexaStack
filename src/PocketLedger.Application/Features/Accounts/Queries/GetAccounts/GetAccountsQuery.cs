using MediatR;
using PocketLedger.Application.Common;
using PocketLedger.Application.Features.Accounts.DTOs;
using PocketLedger.Domain.Enums;

namespace PocketLedger.Application.Features.Accounts.Queries.GetAccounts;

public class GetAccountsQuery : PaginationRequest, IRequest<PagedResult<AccountDto>>
{
    public AccountType? AccountType { get; set; }
    public bool? IncludeInBalance { get; set; }
    public bool? IsArchived { get; set; }
}
