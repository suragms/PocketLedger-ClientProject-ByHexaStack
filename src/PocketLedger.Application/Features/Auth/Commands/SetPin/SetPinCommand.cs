using MediatR;

namespace PocketLedger.Application.Features.Auth.Commands.SetPin;

public class SetPinCommand : IRequest<Unit>
{
    public string Pin { get; set; } = string.Empty;
}
