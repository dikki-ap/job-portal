using JobPortal.Application.Features.EducationMajors.Commands.CreateEducationMajor;
using JobPortal.Application.Features.EducationMajors.Commands.DeleteEducationMajor;
using JobPortal.Application.Features.EducationMajors.Commands.UpdateEducationMajor;
using JobPortal.Application.Features.EducationMajors.Queries.GetAllEducationMajors;
using JobPortal.Application.Features.EducationMajors.Queries.GetEducationMajorById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/education-majors")]
public class EducationMajorsController(IMediator mediator, ILogger<EducationMajorsController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        logger.LogDebug("GetAll: fetching all education majors");
        try
        {
            var result = await mediator.Send(new GetAllEducationMajorsQuery(), cancellationToken);
            var list = result.ToList();
            logger.LogInformation("GetAll: returned {Count} education major(s)", list.Count);
            return Ok(list);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetAll: unexpected error while fetching education majors");
            throw;
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        logger.LogDebug("GetById: fetching education major id={Id}", id);
        try
        {
            var result = await mediator.Send(new GetEducationMajorByIdQuery(id), cancellationToken);
            if (result is null)
            {
                logger.LogInformation("GetById: education major id={Id} not found", id);
                return NotFound();
            }
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetById: unexpected error while fetching education major id={Id}", id);
            throw;
        }
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] CreateEducationMajorCommand command, CancellationToken cancellationToken)
    {
        logger.LogDebug("Create: request received with name={Name}", command.Name);
        try
        {
            var result = await mediator.Send(command, cancellationToken);
            logger.LogInformation("Create: education major created id={Id} name={Name}", result.Id, result.Name);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Create: unexpected error while creating education major name={Name}", command.Name);
            throw;
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateEducationMajorCommand command, CancellationToken cancellationToken)
    {
        logger.LogDebug("Update: request received for id={Id}", id);
        try
        {
            if (id != command.Id) return BadRequest("ID mismatch.");
            var result = await mediator.Send(command, cancellationToken);
            logger.LogInformation("Update: education major id={Id} updated successfully", result.Id);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Update: unexpected error while updating education major id={Id}", id);
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
            await mediator.Send(new DeleteEducationMajorCommand(id), cancellationToken);
            logger.LogInformation("Delete: education major id={Id} deleted successfully", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Delete: unexpected error while deleting education major id={Id}", id);
            throw;
        }
    }
}
