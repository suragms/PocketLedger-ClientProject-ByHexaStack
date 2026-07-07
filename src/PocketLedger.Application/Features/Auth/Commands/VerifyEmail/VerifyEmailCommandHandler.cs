using MediatR;
using Microsoft.AspNetCore.Identity;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Domain.Entities;

namespace PocketLedger.Application.Features.Auth.Commands.VerifyEmail;

public class VerifyEmailCommandHandler : IRequestHandler<VerifyEmailCommand, Unit>
{
    private readonly UserManager<User> _userManager;

    public VerifyEmailCommandHandler(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Unit> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId)
            ?? throw new NotFoundException(nameof(User), request.UserId);

        var result = await _userManager.ConfirmEmailAsync(user, request.Token);
        if (!result.Succeeded)
            throw new InvalidOperationException("Invalid or expired verification token.");

        user.EmailVerified = true;
        await _userManager.UpdateAsync(user);

        return Unit.Value;
    }
}
