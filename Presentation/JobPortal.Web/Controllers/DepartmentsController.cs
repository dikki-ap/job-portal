using JobPortal.Application.Features.Departments.Commands.CreateDepartment;
using JobPortal.Application.Features.Departments.Commands.DeleteDepartment;
using JobPortal.Application.Features.Departments.Commands.UpdateDepartment;
using JobPortal.Application.Features.Departments.Queries.GetAllDepartments;
using JobPortal.Application.Features.Departments.Queries.GetDepartmentById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepartmentsController(IMediator mediator, ILogger<DepartmentsController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        logger.LogDebug("GetAll: fetching all departments");
        try
        {
            var result = await mediator.Send(new GetAllDepartmentsQuery(), cancellationToken);
            var list = result.ToList();
            logger.LogInformation("GetAll: returned {Count} department(s)", list.Count);
            return Ok(list);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetAll: unexpected error while fetching departments");
            throw;
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        logger.LogDebug("GetById: fetching department id={Id}", id);
        try
        {
            var result = await mediator.Send(new GetDepartmentByIdQuery(id), cancellationToken);
            if (result is null)
            {
                logger.LogInformation("GetById: department id={Id} not found", id);
                return NotFound();
            }
            logger.LogInformation("GetById: found department id={Id} name={Name}", result.Id, result.Name);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetById: unexpected error while fetching department id={Id}", id);
            throw;
        }
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] CreateDepartmentCommand command, CancellationToken cancellationToken)
    {
        logger.LogDebug("Create: request received with name={Name}", command.Name);
        try
        {
            var result = await mediator.Send(command, cancellationToken);
            logger.LogInformation("Create: department created successfully id={Id} name={Name}", result.Id, result.Name);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Create: unexpected error while creating department name={Name}", command.Name);
            throw;
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateDepartmentCommand command, CancellationToken cancellationToken)
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
            logger.LogInformation("Update: department id={Id} updated successfully name={Name}", result.Id, result.Name);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Update: unexpected error while updating department id={Id}", id);
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
            await mediator.Send(new DeleteDepartmentCommand(id), cancellationToken);
            logger.LogInformation("Delete: department id={Id} deleted successfully", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Delete: unexpected error while deleting department id={Id}", id);
            throw;
        }
    }
}
