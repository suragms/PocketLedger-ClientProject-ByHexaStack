using MediatR;
using PocketLedger.Application.Features.Accounts.DTOs;
using PocketLedger.Domain.Enums;

namespace PocketLedger.Application.Features.Accounts.Commands.CreateAccount;

public class CreateAccountCommand : IRequest<AccountDto>
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public AccountType Type { get; set; }
    public decimal Balance { get; set; }
    public string Currency { get; set; } = "USD";
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public bool IncludeInBalance { get; set; } = true;
}
