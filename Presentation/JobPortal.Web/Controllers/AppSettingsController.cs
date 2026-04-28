using JobPortal.Application.Features.AppSettings.Commands.UpdatePrivacyConsentSetting;
using JobPortal.Application.Features.AppSettings.Commands.UpdateSmtpSetting;
using JobPortal.Application.Features.AppSettings.Queries.GetBrandingSetting;
using JobPortal.Application.Features.AppSettings.Queries.GetPrivacyConsentSetting;
using JobPortal.Application.Features.AppSettings.Queries.GetSmtpSetting;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/app-settings")]
public class AppSettingsController(IMediator mediator) : ControllerBase
{
    [HttpGet("branding")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBranding(CancellationToken ct)
        => Ok(await mediator.Send(new GetBrandingSettingQuery(), ct));

    [HttpGet("require-privacy-consent")]
    [AllowAnonymous]
    public async Task<IActionResult> GetRequirePrivacyConsent(CancellationToken ct)
        => Ok(await mediator.Send(new GetPrivacyConsentSettingQuery(), ct));

    [HttpPut("require-privacy-consent")]
    [Authorize]
    public async Task<IActionResult> UpdateRequirePrivacyConsent(
        [FromBody] UpdatePrivacyConsentSettingRequest req, CancellationToken ct)
    {
        await mediator.Send(new UpdatePrivacyConsentSettingCommand(req.RequireConsent), ct);
        return NoContent();
    }

    public record UpdatePrivacyConsentSettingRequest(bool RequireConsent);

    [HttpGet("smtp")]
    [Authorize]
    public async Task<IActionResult> GetSmtpSetting(CancellationToken ct)
        => Ok(await mediator.Send(new GetSmtpSettingQuery(), ct));

    [HttpPut("smtp")]
    [Authorize]
    public async Task<IActionResult> UpdateSmtpSetting(
        [FromBody] UpdateSmtpSettingRequest req, CancellationToken ct)
    {
        await mediator.Send(new UpdateSmtpSettingCommand(
            req.Host, req.Port, req.SenderName, req.SenderEmail, req.Username, req.EnableSsl), ct);
        return NoContent();
    }

    public record UpdateSmtpSettingRequest(
        string Host, int Port, string SenderName, string SenderEmail, string Username, bool EnableSsl);
}
