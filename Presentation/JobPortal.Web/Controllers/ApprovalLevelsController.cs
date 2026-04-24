using JobPortal.Application.Features.ApprovalLevels.Commands.CreateApprovalLevel;
using JobPortal.Application.Features.ApprovalLevels.Commands.DeleteApprovalLevel;
using JobPortal.Application.Features.ApprovalLevels.Commands.UpdateApprovalLevel;
using JobPortal.Application.Features.ApprovalLevels.Queries.GetApprovalLevels;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/approval-levels")]
[Authorize(Policy = "HrOrAdmin")]
public class ApprovalLevelsController(IMediator mediator, ILogger<ApprovalLevelsController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetApprovalLevelsQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] CreateApprovalLevelCommand command, CancellationToken cancellationToken)
    {
        try
        {
            var result = await mediator.Send(command, cancellationToken);
            return CreatedAtAction(nameof(GetAll), result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Create approval level failed");
            throw;
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateApprovalLevelCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id) return BadRequest("ID mismatch.");
        try
        {
            var result = await mediator.Send(command, cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        try
        {
            await mediator.Send(new DeleteApprovalLevelCommand(id), cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
    }
}
