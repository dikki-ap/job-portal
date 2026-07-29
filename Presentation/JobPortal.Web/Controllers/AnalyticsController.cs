using JobPortal.Application.Features.Analytics.Queries.GetApplicationsForAnalytics;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/analytics")]
[Authorize(Policy = "HrOrAdmin")]
public class AnalyticsController(IMediator mediator) : ControllerBase
{
    [HttpGet("applications")]
    public async Task<IActionResult> GetApplications(CancellationToken ct)
    {
        var result = await mediator.Send(new GetApplicationsForAnalyticsQuery(), ct);
        return Ok(result);
    }
}
