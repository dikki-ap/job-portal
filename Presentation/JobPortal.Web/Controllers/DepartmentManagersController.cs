using JobPortal.Application.Features.DepartmentManagers.Commands.CreateDepartmentManager;
using JobPortal.Application.Features.DepartmentManagers.Commands.DeleteDepartmentManager;
using JobPortal.Application.Features.DepartmentManagers.Commands.UpdateDepartmentManager;
using JobPortal.Application.Features.DepartmentManagers.Queries.GetAllDepartmentManagers;
using JobPortal.Application.Features.DepartmentManagers.Queries.GetDepartmentManagerById;
using JobPortal.Application.Features.DepartmentManagers.Queries.IsDepartmentManager;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/department-managers")]
[Authorize]
public class DepartmentManagersController(IMediator mediator, ILogger<DepartmentManagersController> logger) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = "HrOrAdmin")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        logger.LogDebug("GetAll: fetching all department managers");
        try
        {
            var result = await mediator.Send(new GetAllDepartmentManagersQuery(), cancellationToken);
            var list = result.ToList();
            logger.LogInformation("GetAll: returned {Count} department manager(s)", list.Count);
            return Ok(list);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetAll: unexpected error while fetching department managers");
            throw;
        }
    }

    [HttpGet("{id:int}")]
    [Authorize(Policy = "HrOrAdmin")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        logger.LogDebug("GetById: fetching department manager id={Id}", id);
        try
        {
            var result = await mediator.Send(new GetDepartmentManagerByIdQuery(id), cancellationToken);
            if (result is null)
            {
                logger.LogInformation("GetById: department manager id={Id} not found", id);
                return NotFound();
            }
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetById: unexpected error while fetching department manager id={Id}", id);
            throw;
        }
    }

    [HttpGet("is-department-manager")]
    [Authorize]
    public async Task<IActionResult> IsDepartmentManager(CancellationToken cancellationToken)
    {
        try
        {
            var result = await mediator.Send(new IsDepartmentManagerQuery(), cancellationToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "IsDepartmentManager: unexpected error");
            throw;
        }
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] CreateDepartmentManagerCommand command, CancellationToken cancellationToken)
    {
        logger.LogDebug("Create: request received email={Email}", command.Email);
        try
        {
            var result = await mediator.Send(command, cancellationToken);
            logger.LogInformation("Create: department manager created id={Id} email={Email}", result.Id, result.Email);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Create: unexpected error while creating department manager email={Email}", command.Email);
            throw;
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateDepartmentManagerCommand command, CancellationToken cancellationToken)
    {
        logger.LogDebug("Update: request received for id={Id}", id);
        try
        {
            if (id != command.Id)
            {
                logger.LogInformation("Update: id mismatch — route id={RouteId}, body id={BodyId}", id, command.Id);
                return BadRequest("ID mismatch.");
            }
            var result = await mediator.Send(command, cancellationToken);
            logger.LogInformation("Update: department manager id={Id} updated successfully", result.Id);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Update: unexpected error while updating department manager id={Id}", id);
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
            await mediator.Send(new DeleteDepartmentManagerCommand(id), cancellationToken);
            logger.LogInformation("Delete: department manager id={Id} deleted successfully", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Delete: unexpected error while deleting department manager id={Id}", id);
            throw;
        }
    }
}
