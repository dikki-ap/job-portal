using JobPortal.Application.Features.PrivacyConsent.Commands.RecordConsent;
using JobPortal.Application.Features.PrivacyConsent.Queries.GetMyConsentStatus;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/privacy-consent")]
[Authorize]
public class PrivacyConsentController(IMediator mediator) : ControllerBase
{
    [HttpGet("status")]
    public async Task<IActionResult> GetStatus(CancellationToken ct)
        => Ok(await mediator.Send(new GetMyConsentStatusQuery(), ct));

    [HttpPost]
    public async Task<IActionResult> RecordConsent(CancellationToken ct)
        => Ok(await mediator.Send(new RecordConsentCommand(), ct));
}
