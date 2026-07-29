using JobPortal.Application.Features.TalentPool.Commands.AddToTalentPool;
using JobPortal.Application.Features.TalentPool.Commands.ReengageCandidate;
using JobPortal.Application.Features.TalentPool.Commands.RemoveFromTalentPool;
using JobPortal.Application.Features.TalentPool.Queries.GetPagedTalentPool;
using JobPortal.Application.Features.TalentPool.Queries.GetTalentPool;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/talent-pool")]
[Authorize(Policy = "HrOrAdmin")]
public class TalentPoolController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await mediator.Send(new GetTalentPoolQuery(), ct));

    [HttpGet("paged")]
    public async Task<IActionResult> GetPaged(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        CancellationToken ct = default)
    {
        pageSize = Math.Clamp(pageSize, 1, 100);
        return Ok(await mediator.Send(new GetPagedTalentPoolQuery(page, pageSize, search), ct));
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] AddToTalentPoolRequest req, CancellationToken ct)
    {
        try
        {
            var result = await mediator.Send(new AddToTalentPoolCommand(req.ApplicationId, req.Notes), ct);
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Remove(int id, CancellationToken ct)
    {
        try
        {
            await mediator.Send(new RemoveFromTalentPoolCommand(id), ct);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
    }

    [HttpPost("{id:int}/reengage")]
    public async Task<IActionResult> Reengage(int id, [FromBody] ReengageRequest req, CancellationToken ct)
    {
        try
        {
            var result = await mediator.Send(new ReengageCandidateCommand(id, req.JobPostId), ct);
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    public record AddToTalentPoolRequest(int ApplicationId, string? Notes);
    public record ReengageRequest(int JobPostId);
}
