using MediatR;
using Microsoft.AspNetCore.Identity;
using PocketLedger.Application.Common.Exceptions;
using PocketLedger.Domain.Entities;

namespace PocketLedger.Application.Features.Auth.Commands.ResetPassword;

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Unit>
{
    private readonly UserManager<User> _userManager;

    public ResetPasswordCommandHandler(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Unit> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email)
            ?? throw new NotFoundException(nameof(User), request.Email);

        if (user.PasswordResetToken != request.Token || user.PasswordResetTokenExpiry < DateTime.UtcNow)
            throw new UnauthorizedAccessException("Invalid or expired reset token.");

        var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException(errors);
        }

        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiry = null;
        await _userManager.UpdateAsync(user);

        return Unit.Value;
    }
}
