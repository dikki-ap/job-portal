using JobPortal.Application.Features.CurrencyTypes.Commands.CreateCurrencyType;
using JobPortal.Application.Features.CurrencyTypes.Commands.DeleteCurrencyType;
using JobPortal.Application.Features.CurrencyTypes.Commands.UpdateCurrencyType;
using JobPortal.Application.Features.CurrencyTypes.Queries.GetAllCurrencyTypes;
using JobPortal.Application.Features.CurrencyTypes.Queries.GetCurrencyTypeById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/currency-types")]
public class CurrencyTypesController(IMediator mediator, ILogger<CurrencyTypesController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        logger.LogDebug("GetAll: fetching all currency types");
        try
        {
            var result = await mediator.Send(new GetAllCurrencyTypesQuery(), cancellationToken);
            var list = result.ToList();
            logger.LogInformation("GetAll: returned {Count} currency type(s)", list.Count);
            return Ok(list);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetAll: unexpected error while fetching currency types");
            throw;
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        logger.LogDebug("GetById: fetching currency type id={Id}", id);
        try
        {
            var result = await mediator.Send(new GetCurrencyTypeByIdQuery(id), cancellationToken);
            if (result is null)
            {
                logger.LogInformation("GetById: currency type id={Id} not found", id);
                return NotFound();
            }
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetById: unexpected error while fetching currency type id={Id}", id);
            throw;
        }
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateCurrencyTypeCommand command, CancellationToken cancellationToken)
    {
        logger.LogDebug("Create: request received with name={Name} prefix={Prefix}", command.Name, command.Prefix);
        try
        {
            var result = await mediator.Send(command, cancellationToken);
            logger.LogInformation("Create: currency type created id={Id} name={Name}", result.Id, result.Name);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Create: unexpected error while creating currency type name={Name}", command.Name);
            throw;
        }
    }

    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCurrencyTypeCommand command, CancellationToken cancellationToken)
    {
        logger.LogDebug("Update: request received for id={Id}", id);
        try
        {
            if (id != command.Id) return BadRequest("ID mismatch.");
            var result = await mediator.Send(command, cancellationToken);
            logger.LogInformation("Update: currency type id={Id} updated successfully", result.Id);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Update: unexpected error while updating currency type id={Id}", id);
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
            await mediator.Send(new DeleteCurrencyTypeCommand(id), cancellationToken);
            logger.LogInformation("Delete: currency type id={Id} deleted successfully", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Delete: unexpected error while deleting currency type id={Id}", id);
            throw;
        }
    }
}
