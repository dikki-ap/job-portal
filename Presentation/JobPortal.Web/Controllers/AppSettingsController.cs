using JobPortal.Application.Features.AppSettings.Commands.UpdateBrandingSetting;
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

    [HttpPut("branding")]
    [Authorize]
    [ApiExplorerSettings(IgnoreApi = true)]
    public async Task<IActionResult> UpdateBranding(
        [FromBody] UpdateBrandingSettingRequest req, CancellationToken ct)
    {
        await mediator.Send(new UpdateBrandingSettingCommand(
            req.CompanyName, req.LogoUrl, req.PrimaryColor, req.PrimaryHoverColor,
            req.GradientMidColor, req.GradientEndColor, req.ContactEmail,
            req.ContactPhone, req.Address, req.Description), ct);
        return NoContent();
    }

    public record UpdateBrandingSettingRequest(
        string CompanyName, string LogoUrl, string PrimaryColor, string PrimaryHoverColor,
        string GradientMidColor, string GradientEndColor, string ContactEmail,
        string ContactPhone, string Address, string Description);

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
