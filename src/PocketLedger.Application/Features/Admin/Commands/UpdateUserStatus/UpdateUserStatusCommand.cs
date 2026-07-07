using MediatR;
using Microsoft.AspNetCore.Identity;
using PocketLedger.Domain.Entities;

namespace PocketLedger.Application.Features.Admin.Commands.UpdateUserStatus;

public record UpdateUserStatusCommand : IRequest
{
    public string UserId { get; init; } = string.Empty;
    public bool IsActive { get; init; }
}

public class UpdateUserStatusCommandHandler : IRequestHandler<UpdateUserStatusCommand>
{
    private readonly UserManager<User> _userManager;

    public UpdateUserStatusCommandHandler(UserManager<User> userManager) => _userManager = userManager;

    public async Task Handle(UpdateUserStatusCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId)
            ?? throw new Exception("User not found");

        user.IsActive = request.IsActive;
        await _userManager.UpdateAsync(user);
    }
}
