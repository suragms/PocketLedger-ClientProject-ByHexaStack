using MediatR;
using PocketLedger.Domain.Interfaces;

namespace PocketLedger.Application.Features.Settings.Commands.DeletePasskey;

public record DeletePasskeyCommand : IRequest
{
    public int Id { get; set; }
}

public class DeletePasskeyCommandHandler : IRequestHandler<DeletePasskeyCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUser;

    public DeletePasskeyCommandHandler(IUserRepository userRepository, ICurrentUserService currentUser)
    {
        _userRepository = userRepository;
        _currentUser = currentUser;
    }

    public async Task Handle(DeletePasskeyCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdWithPasskeysAsync(_currentUser.UserId!, cancellationToken)
            ?? throw new Exception("User not found");

        var passkey = user.Passkeys.FirstOrDefault(p => p.Id == request.Id)
            ?? throw new Exception("Passkey not found");

        await _userRepository.RemovePasskeyAsync(passkey, cancellationToken);
    }
}
