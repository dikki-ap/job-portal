using JobPortal.Application.Features.JobLevels.Commands.CreateJobLevel;
using JobPortal.Application.Features.JobLevels.Commands.DeleteJobLevel;
using JobPortal.Application.Features.JobLevels.Commands.UpdateJobLevel;
using JobPortal.Application.Features.JobLevels.Queries.GetAllJobLevels;
using JobPortal.Application.Features.JobLevels.Queries.GetJobLevelById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/job-levels")]
public class JobLevelsController(IMediator mediator, ILogger<JobLevelsController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        logger.LogDebug("GetAll: fetching all job levels");
        try
        {
            var result = await mediator.Send(new GetAllJobLevelsQuery(), cancellationToken);
            var list = result.ToList();
            logger.LogInformation("GetAll: returned {Count} job level(s)", list.Count);
            return Ok(list);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetAll: unexpected error while fetching job levels");
            throw;
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        logger.LogDebug("GetById: fetching job level id={Id}", id);
        try
        {
            var result = await mediator.Send(new GetJobLevelByIdQuery(id), cancellationToken);
            if (result is null)
            {
                logger.LogInformation("GetById: job level id={Id} not found", id);
                return NotFound();
            }
            logger.LogInformation("GetById: found job level id={Id} name={Name}", result.Id, result.Name);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetById: unexpected error while fetching job level id={Id}", id);
            throw;
        }
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateJobLevelCommand command, CancellationToken cancellationToken)
    {
        logger.LogDebug("Create: request received with name={Name}", command.Name);
        try
        {
            var result = await mediator.Send(command, cancellationToken);
            logger.LogInformation("Create: job level created successfully id={Id} name={Name}", result.Id, result.Name);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Create: unexpected error while creating job level name={Name}", command.Name);
            throw;
        }
    }

    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateJobLevelCommand command, CancellationToken cancellationToken)
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
            logger.LogInformation("Update: job level id={Id} updated successfully name={Name}", result.Id, result.Name);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Update: unexpected error while updating job level id={Id}", id);
            throw;
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        logger.LogDebug("Delete: request received for id={Id}", id);
        try
        {
            await mediator.Send(new DeleteJobLevelCommand(id), cancellationToken);
            logger.LogInformation("Delete: job level id={Id} deleted successfully", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Delete: unexpected error while deleting job level id={Id}", id);
            throw;
        }
    }
}
