using JobPortal.Application.Features.WorkModes.Commands.CreateWorkMode;
using JobPortal.Application.Features.WorkModes.Commands.DeleteWorkMode;
using JobPortal.Application.Features.WorkModes.Commands.UpdateWorkMode;
using JobPortal.Application.Features.WorkModes.Queries.GetAllWorkModes;
using JobPortal.Application.Features.WorkModes.Queries.GetWorkModeById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/work-modes")]
public class WorkModesController(IMediator mediator, ILogger<WorkModesController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        logger.LogDebug("GetAll: fetching all work modes");
        try
        {
            var result = await mediator.Send(new GetAllWorkModesQuery(), cancellationToken);
            var list = result.ToList();
            logger.LogInformation("GetAll: returned {Count} work mode(s)", list.Count);
            return Ok(list);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetAll: unexpected error while fetching work modes");
            throw;
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        logger.LogDebug("GetById: fetching work mode id={Id}", id);
        try
        {
            var result = await mediator.Send(new GetWorkModeByIdQuery(id), cancellationToken);
            if (result is null)
            {
                logger.LogInformation("GetById: work mode id={Id} not found", id);
                return NotFound();
            }
            logger.LogInformation("GetById: found work mode id={Id} name={Name}", result.Id, result.Name);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetById: unexpected error while fetching work mode id={Id}", id);
            throw;
        }
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] CreateWorkModeCommand command, CancellationToken cancellationToken)
    {
        logger.LogDebug("Create: request received with name={Name}", command.Name);
        try
        {
            var result = await mediator.Send(command, cancellationToken);
            logger.LogInformation("Create: work mode created successfully id={Id} name={Name}", result.Id, result.Name);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Create: unexpected error while creating work mode name={Name}", command.Name);
            throw;
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateWorkModeCommand command, CancellationToken cancellationToken)
    {
        logger.LogDebug("Update: request received for id={Id} new name={Name}", id, command.Name);
        try
        {
            if (id != command.Id)
            {
                logger.LogInformation("Update: id mismatch — route id={RouteId}, body id={BodyId}", id, command.Id);
                return BadRequest("ID mismatch.");
            }
            var result = await mediator.Send(command, cancellationToken);
            logger.LogInformation("Update: work mode id={Id} updated successfully name={Name}", result.Id, result.Name);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Update: unexpected error while updating work mode id={Id}", id);
            throw;
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        logger.LogDebug("Delete: request received for id={Id}", id);
        try
        {
            await mediator.Send(new DeleteWorkModeCommand(id), cancellationToken);
            logger.LogInformation("Delete: work mode id={Id} deleted successfully", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Delete: unexpected error while deleting work mode id={Id}", id);
            throw;
        }
    }
}
