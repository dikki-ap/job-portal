using JobPortal.Application.Features.Skills.Commands.CreateSkill;
using JobPortal.Application.Features.Skills.Commands.DeleteSkill;
using JobPortal.Application.Features.Skills.Commands.UpdateSkill;
using JobPortal.Application.Features.Skills.Queries.GetAllSkills;
using JobPortal.Application.Features.Skills.Queries.GetSkillById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SkillsController(IMediator mediator, ILogger<SkillsController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        logger.LogDebug("GetAll: fetching all skills");
        try
        {
            var result = await mediator.Send(new GetAllSkillsQuery(), cancellationToken);
            var list = result.ToList();
            logger.LogInformation("GetAll: returned {Count} skill(s)", list.Count);
            return Ok(list);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetAll: unexpected error while fetching skills");
            throw;
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        logger.LogDebug("GetById: fetching skill id={Id}", id);
        try
        {
            var result = await mediator.Send(new GetSkillByIdQuery(id), cancellationToken);
            if (result is null)
            {
                logger.LogInformation("GetById: skill id={Id} not found", id);
                return NotFound();
            }
            logger.LogInformation("GetById: found skill id={Id} name={Name}", result.Id, result.Name);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetById: unexpected error while fetching skill id={Id}", id);
            throw;
        }
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] CreateSkillCommand command, CancellationToken cancellationToken)
    {
        logger.LogDebug("Create: request received with name={Name}", command.Name);
        try
        {
            var result = await mediator.Send(command, cancellationToken);
            logger.LogInformation("Create: skill created successfully id={Id} name={Name}", result.Id, result.Name);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Create: unexpected error while creating skill name={Name}", command.Name);
            throw;
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateSkillCommand command, CancellationToken cancellationToken)
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
            logger.LogInformation("Update: skill id={Id} updated successfully name={Name}", result.Id, result.Name);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Update: unexpected error while updating skill id={Id}", id);
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
            await mediator.Send(new DeleteSkillCommand(id), cancellationToken);
            logger.LogInformation("Delete: skill id={Id} deleted successfully", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Delete: unexpected error while deleting skill id={Id}", id);
            throw;
        }
    }
}
