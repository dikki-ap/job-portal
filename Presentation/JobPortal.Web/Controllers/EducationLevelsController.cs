using JobPortal.Application.Features.EducationLevels.Commands.CreateEducationLevel;
using JobPortal.Application.Features.EducationLevels.Commands.DeleteEducationLevel;
using JobPortal.Application.Features.EducationLevels.Commands.UpdateEducationLevel;
using JobPortal.Application.Features.EducationLevels.Queries.GetAllEducationLevels;
using JobPortal.Application.Features.EducationLevels.Queries.GetEducationLevelById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/education-levels")]
[Authorize]
public class EducationLevelsController(IMediator mediator, ILogger<EducationLevelsController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        logger.LogDebug("GetAll: fetching all education levels");
        try
        {
            var result = await mediator.Send(new GetAllEducationLevelsQuery(), cancellationToken);
            var list = result.ToList();
            logger.LogInformation("GetAll: returned {Count} education level(s)", list.Count);
            return Ok(list);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetAll: unexpected error while fetching education levels");
            throw;
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        logger.LogDebug("GetById: fetching education level id={Id}", id);
        try
        {
            var result = await mediator.Send(new GetEducationLevelByIdQuery(id), cancellationToken);
            if (result is null)
            {
                logger.LogInformation("GetById: education level id={Id} not found", id);
                return NotFound();
            }
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetById: unexpected error while fetching education level id={Id}", id);
            throw;
        }
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] CreateEducationLevelCommand command, CancellationToken cancellationToken)
    {
        logger.LogDebug("Create: request received with name={Name} level={Level}", command.Name, command.Level);
        try
        {
            var result = await mediator.Send(command, cancellationToken);
            logger.LogInformation("Create: education level created id={Id} name={Name}", result.Id, result.Name);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Create: unexpected error while creating education level name={Name}", command.Name);
            throw;
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateEducationLevelCommand command, CancellationToken cancellationToken)
    {
        logger.LogDebug("Update: request received for id={Id}", id);
        try
        {
            if (id != command.Id) return BadRequest("ID mismatch.");
            var result = await mediator.Send(command, cancellationToken);
            logger.LogInformation("Update: education level id={Id} updated successfully", result.Id);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Update: unexpected error while updating education level id={Id}", id);
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
            await mediator.Send(new DeleteEducationLevelCommand(id), cancellationToken);
            logger.LogInformation("Delete: education level id={Id} deleted successfully", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Delete: unexpected error while deleting education level id={Id}", id);
            throw;
        }
    }
}
