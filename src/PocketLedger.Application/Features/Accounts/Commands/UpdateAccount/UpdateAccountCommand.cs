using MediatR;
using PocketLedger.Application.Features.Accounts.DTOs;
using PocketLedger.Domain.Enums;

namespace PocketLedger.Application.Features.Accounts.Commands.UpdateAccount;

public class UpdateAccountCommand : IRequest<AccountDto>
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public AccountType Type { get; set; }
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public bool IncludeInBalance { get; set; }
    public int DisplayOrder { get; set; }
}
