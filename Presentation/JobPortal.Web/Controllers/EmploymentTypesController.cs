using JobPortal.Application.Features.EmploymentTypes.Commands.CreateEmploymentType;
using JobPortal.Application.Features.EmploymentTypes.Commands.DeleteEmploymentType;
using JobPortal.Application.Features.EmploymentTypes.Commands.UpdateEmploymentType;
using JobPortal.Application.Features.EmploymentTypes.Queries.GetAllEmploymentTypes;
using JobPortal.Application.Features.EmploymentTypes.Queries.GetEmploymentTypeById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/employment-types")]
public class EmploymentTypesController(IMediator mediator, ILogger<EmploymentTypesController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        logger.LogDebug("GetAll: fetching all employment types");
        try
        {
            var result = await mediator.Send(new GetAllEmploymentTypesQuery(), cancellationToken);
            var list = result.ToList();
            logger.LogInformation("GetAll: returned {Count} employment type(s)", list.Count);
            return Ok(list);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetAll: unexpected error while fetching employment types");
            throw;
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        logger.LogDebug("GetById: fetching employment type id={Id}", id);
        try
        {
            var result = await mediator.Send(new GetEmploymentTypeByIdQuery(id), cancellationToken);
            if (result is null)
            {
                logger.LogInformation("GetById: employment type id={Id} not found", id);
                return NotFound();
            }
            logger.LogInformation("GetById: found employment type id={Id} name={Name}", result.Id, result.Name);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetById: unexpected error while fetching employment type id={Id}", id);
            throw;
        }
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateEmploymentTypeCommand command, CancellationToken cancellationToken)
    {
        logger.LogDebug("Create: request received with name={Name}", command.Name);
        try
        {
            var result = await mediator.Send(command, cancellationToken);
            logger.LogInformation("Create: employment type created successfully id={Id} name={Name}", result.Id, result.Name);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Create: unexpected error while creating employment type name={Name}", command.Name);
            throw;
        }
    }

    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateEmploymentTypeCommand command, CancellationToken cancellationToken)
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
            logger.LogInformation("Update: employment type id={Id} updated successfully name={Name}", result.Id, result.Name);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Update: unexpected error while updating employment type id={Id}", id);
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
            await mediator.Send(new DeleteEmploymentTypeCommand(id), cancellationToken);
            logger.LogInformation("Delete: employment type id={Id} deleted successfully", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Delete: unexpected error while deleting employment type id={Id}", id);
            throw;
        }
    }
}
