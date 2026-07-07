using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PocketLedger.Application.Features.Auth.Commands.ChangePassword;
using PocketLedger.Application.Features.Auth.Commands.DeleteAccount;
using PocketLedger.Application.Features.Auth.Commands.ForgotPassword;
using PocketLedger.Application.Features.Auth.Commands.Login;
using PocketLedger.Application.Features.Auth.Commands.RefreshToken;
using PocketLedger.Application.Features.Auth.Commands.Register;
using PocketLedger.Application.Features.Auth.Commands.RemovePin;
using PocketLedger.Application.Features.Auth.Commands.ResendVerification;
using PocketLedger.Application.Features.Auth.Commands.ResetPassword;
using PocketLedger.Application.Features.Auth.Commands.SetPin;
using PocketLedger.Application.Features.Auth.Commands.UpdateProfile;
using PocketLedger.Application.Features.Auth.Commands.VerifyEmail;
using PocketLedger.Application.Features.Auth.Commands.VerifyPin;
using PocketLedger.Application.Features.Auth.DTOs;
using PocketLedger.Application.Features.Auth.Queries.GetCurrentUser;

namespace PocketLedger.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator) => _mediator = mediator;

    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("login/pin")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> LoginWithPin([FromBody] VerifyPinCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("refresh")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(UserProfile), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCurrentUser()
    {
        var result = await _mediator.Send(new GetCurrentUserQuery());
        return Ok(result);
    }

    [Authorize]
    [HttpPut("profile")]
    [ProducesResponseType(typeof(UserProfile), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [Authorize]
    [HttpPost("change-password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordCommand command)
    {
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpPost("forgot-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordCommand command)
    {
        await _mediator.Send(command);
        return Ok(new { message = "If an account exists with this email, a password reset link has been sent." });
    }

    [HttpPost("reset-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command)
    {
        await _mediator.Send(command);
        return Ok(new { message = "Password has been reset successfully." });
    }

    [HttpPost("verify-email")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailCommand command)
    {
        await _mediator.Send(command);
        return Ok(new { message = "Email verified successfully." });
    }

    [HttpPost("resend-verification")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationCommand command)
    {
        await _mediator.Send(command);
        return Ok(new { message = "Verification email sent." });
    }

    [Authorize]
    [HttpPost("set-pin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SetPin([FromBody] SetPinCommand command)
    {
        await _mediator.Send(command);
        return NoContent();
    }

    [Authorize]
    [HttpPost("remove-pin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> RemovePin([FromBody] RemovePinCommand command)
    {
        await _mediator.Send(command);
        return NoContent();
    }

    [Authorize]
    [HttpPost("delete-account")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountCommand command)
    {
        await _mediator.Send(command);
        return Ok(new { message = "Account has been deleted." });
    }
}
