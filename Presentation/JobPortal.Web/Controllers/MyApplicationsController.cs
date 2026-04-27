using JobPortal.Application.Features.Applications.Queries.GetApplicationByCode;
using JobPortal.Application.Features.Applications.Queries.GetMyApplications;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/my-applications")]
[Authorize]
public class MyApplicationsController(IMediator mediator, ICurrentUserService currentUserService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMine(CancellationToken cancellationToken)
    {
        try
        {
            var result = await mediator.Send(new GetMyApplicationsQuery(), cancellationToken);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex) { return Unauthorized(new { error = ex.Message }); }
    }

    [HttpGet("{code}")]
    public async Task<IActionResult> GetByCode(string code, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetApplicationByCodeQuery(code), cancellationToken);
        if (result is null) return NotFound();

        var currentUserId = currentUserService.GetCurrentUserId();
        if (result.UserId != currentUserId) return Forbid();

        return Ok(result);
    }
}
