using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PocketLedger.Application.Features.Settings.Commands.UpdateProfile;
using PocketLedger.Application.Features.Settings.Commands.UploadAvatar;
using PocketLedger.Application.Features.Settings.Commands.UpdateAppearance;
using PocketLedger.Application.Features.Settings.Commands.UpdateNotifications;
using PocketLedger.Application.Features.Settings.Commands.UpdatePrivacy;
using PocketLedger.Application.Features.Settings.Commands.UpdateSecurity;
using PocketLedger.Application.Features.Settings.Commands.ChangePassword;
using PocketLedger.Application.Features.Settings.Commands.Enable2FA;
using PocketLedger.Application.Features.Settings.Commands.Disable2FA;
using PocketLedger.Application.Features.Settings.Commands.Verify2FA;
using PocketLedger.Application.Features.Settings.Commands.DeleteAccount;
using PocketLedger.Application.Features.Settings.Commands.ExportData;
using PocketLedger.Application.Features.Settings.Commands.ImportData;
using PocketLedger.Application.Features.Settings.Queries.GetProfile;
using PocketLedger.Application.Features.Settings.Queries.GetSettings;
using PocketLedger.Application.Features.Settings.Queries.GetPasskeys;
using PocketLedger.Application.Features.Settings.Queries.Get2FAStatus;
using PocketLedger.Application.Features.Settings.Queries.GetAbout;

namespace PocketLedger.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class SettingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public SettingsController(IMediator mediator) => _mediator = mediator;

    // Profile
    [HttpGet("profile")]
    [ProducesResponseType(typeof(ProfileDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProfile()
    {
        var result = await _mediator.Send(new GetProfileQuery());
        return Ok(result);
    }

    [HttpPut("profile")]
    [ProducesResponseType(typeof(ProfileDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("avatar")]
    [ProducesResponseType(typeof(AvatarResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        using var stream = file.OpenReadStream();
        var result = await _mediator.Send(new UploadAvatarCommand
        {
            FileStream = stream,
            FileName = file.FileName,
            ContentType = file.ContentType
        });
        return Ok(result);
    }

    // Settings
    [HttpGet]
    [ProducesResponseType(typeof(SettingsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSettings()
    {
        var result = await _mediator.Send(new GetSettingsQuery());
        return Ok(result);
    }

    [HttpPut("appearance")]
    [ProducesResponseType(typeof(SettingsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateAppearance([FromBody] UpdateAppearanceCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPut("notifications")]
    [ProducesResponseType(typeof(SettingsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateNotifications([FromBody] UpdateNotificationsCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPut("privacy")]
    [ProducesResponseType(typeof(SettingsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdatePrivacy([FromBody] UpdatePrivacyCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPut("security")]
    [ProducesResponseType(typeof(SettingsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateSecurity([FromBody] UpdateSecurityCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    // Security - Password
    [HttpPost("change-password")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordCommand command)
    {
        await _mediator.Send(command);
        return NoContent();
    }

    // Security - Passkeys
    [HttpGet("passkeys")]
    [ProducesResponseType(typeof(PasskeyListDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPasskeys()
    {
        var result = await _mediator.Send(new GetPasskeysQuery());
        return Ok(result);
    }

    [HttpDelete("passkeys/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeletePasskey(int id)
    {
        await _mediator.Send(new PocketLedger.Application.Features.Settings.Commands.DeletePasskey.DeletePasskeyCommand { Id = id });
        return NoContent();
    }

    // Security - 2FA
    [HttpGet("2fa")]
    [ProducesResponseType(typeof(TwoFactorStatusDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get2FAStatus()
    {
        var result = await _mediator.Send(new Get2FAStatusQuery());
        return Ok(result);
    }

    [HttpPost("2fa/enable")]
    [ProducesResponseType(typeof(TwoFactorSetupDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Enable2FA()
    {
        var result = await _mediator.Send(new Enable2FACommand());
        return Ok(result);
    }

    [HttpPost("2fa/verify")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Verify2FA([FromBody] Verify2FACommand command)
    {
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpPost("2fa/disable")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Disable2FA([FromBody] Disable2FACommand command)
    {
        await _mediator.Send(command);
        return NoContent();
    }

    // Data - Export/Import
    [HttpPost("export")]
    [ProducesResponseType(typeof(ExportResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportData()
    {
        var result = await _mediator.Send(new ExportDataCommand());
        return Ok(result);
    }

    [HttpPost("import")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ImportData(IFormFile file)
    {
        using var stream = file.OpenReadStream();
        var result = await _mediator.Send(new ImportDataCommand
        {
            FileStream = stream,
            FileName = file.FileName
        });
        return Ok(result);
    }

    // About
    [HttpGet("about")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AboutDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAbout()
    {
        var result = await _mediator.Send(new GetAboutQuery());
        return Ok(result);
    }

    // Delete Account
    [HttpPost("delete-account")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountCommand command)
    {
        await _mediator.Send(command);
        return Ok(new { message = "Account has been deleted." });
    }
}
