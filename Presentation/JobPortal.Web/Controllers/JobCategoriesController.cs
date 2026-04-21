using JobPortal.Application.Features.JobCategories.Commands.CreateJobCategory;
using JobPortal.Application.Features.JobCategories.Commands.DeleteJobCategory;
using JobPortal.Application.Features.JobCategories.Commands.UpdateJobCategory;
using JobPortal.Application.Features.JobCategories.Queries.GetAllJobCategories;
using JobPortal.Application.Features.JobCategories.Queries.GetJobCategoryById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/job-categories")]
public class JobCategoriesController(IMediator mediator, ILogger<JobCategoriesController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        logger.LogDebug("GetAll: fetching all job categories");
        try
        {
            var result = await mediator.Send(new GetAllJobCategoriesQuery(), cancellationToken);
            var list = result.ToList();
            logger.LogInformation("GetAll: returned {Count} job categorie(s)", list.Count);
            return Ok(list);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetAll: unexpected error while fetching job categories");
            throw;
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        logger.LogDebug("GetById: fetching job category id={Id}", id);
        try
        {
            var result = await mediator.Send(new GetJobCategoryByIdQuery(id), cancellationToken);
            if (result is null)
            {
                logger.LogInformation("GetById: job category id={Id} not found", id);
                return NotFound();
            }
            logger.LogInformation("GetById: found job category id={Id} name={Name}", result.Id, result.Name);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetById: unexpected error while fetching job category id={Id}", id);
            throw;
        }
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateJobCategoryCommand command, CancellationToken cancellationToken)
    {
        logger.LogDebug("Create: request received with name={Name}", command.Name);
        try
        {
            var result = await mediator.Send(command, cancellationToken);
            logger.LogInformation("Create: job category created successfully id={Id} name={Name}", result.Id, result.Name);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Create: unexpected error while creating job category name={Name}", command.Name);
            throw;
        }
    }

    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateJobCategoryCommand command, CancellationToken cancellationToken)
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
            logger.LogInformation("Update: job category id={Id} updated successfully name={Name}", result.Id, result.Name);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Update: unexpected error while updating job category id={Id}", id);
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
            await mediator.Send(new DeleteJobCategoryCommand(id), cancellationToken);
            logger.LogInformation("Delete: job category id={Id} deleted successfully", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Delete: unexpected error while deleting job category id={Id}", id);
            throw;
        }
    }
}
