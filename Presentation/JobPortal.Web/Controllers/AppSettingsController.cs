using JobPortal.Application.Features.AppSettings.Commands.UpdatePrivacyConsentSetting;
using JobPortal.Application.Features.AppSettings.Queries.GetPrivacyConsentSetting;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/app-settings")]
public class AppSettingsController(IMediator mediator) : ControllerBase
{
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
}
