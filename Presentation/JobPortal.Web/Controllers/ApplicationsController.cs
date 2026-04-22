using JobPortal.Application.Common;
using JobPortal.Application.Features.Applications.Commands.AcceptApplication;
using JobPortal.Application.Features.Applications.Commands.RejectApplication;
using JobPortal.Application.Features.Applications.Commands.UpdateApplicationStep;
using JobPortal.Application.Features.Applications.Queries.GetAllApplications;
using JobPortal.Application.Features.Applications.Queries.GetApplicationById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/applications")]
[Authorize]
public class ApplicationsController(IMediator mediator, ILogger<ApplicationsController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? jobPostId,
        [FromQuery] string? status,
        CancellationToken cancellationToken)
    {
        logger.LogDebug("GetAll: jobPostId={JobPostId} status={Status}", jobPostId, status);
        var result = await mediator.Send(new GetAllApplicationsQuery(jobPostId, status), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetApplicationByIdQuery(id), cancellationToken);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpPost("{id:int}/steps/{stepId:int}/pass")]
    public async Task<IActionResult> PassStep(int id, int stepId, CancellationToken cancellationToken)
    {
        try
        {
            var result = await mediator.Send(
                new UpdateApplicationStepCommand(id, stepId, ApplicationStepStatus.Passed),
                cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPost("{id:int}/steps/{stepId:int}/fail")]
    public async Task<IActionResult> FailStep(int id, int stepId, CancellationToken cancellationToken)
    {
        try
        {
            var result = await mediator.Send(
                new UpdateApplicationStepCommand(id, stepId, ApplicationStepStatus.Failed),
                cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPost("{id:int}/accept")]
    public async Task<IActionResult> Accept(int id, CancellationToken cancellationToken)
    {
        try
        {
            var result = await mediator.Send(new AcceptApplicationCommand(id), cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPost("{id:int}/reject")]
    public async Task<IActionResult> Reject(int id, CancellationToken cancellationToken)
    {
        try
        {
            var result = await mediator.Send(new RejectApplicationCommand(id), cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }
}
