using JobPortal.Application.Features.HiringTemplates.Commands.CreateHiringTemplate;
using JobPortal.Application.Features.HiringTemplates.Commands.DeleteHiringTemplate;
using JobPortal.Application.Features.HiringTemplates.Commands.UpdateHiringTemplate;
using JobPortal.Application.Features.HiringTemplates.Queries.GetAllHiringTemplates;
using JobPortal.Application.Features.HiringTemplates.Queries.GetHiringTemplateById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/hiring-templates")]
[Authorize(Policy = "HrOrAdmin")]
public class HiringTemplatesController(IMediator mediator, ILogger<HiringTemplatesController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        try
        {
            var result = await mediator.Send(new GetAllHiringTemplatesQuery(), cancellationToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetAll: unexpected error");
            throw;
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        try
        {
            var result = await mediator.Send(new GetHiringTemplateByIdQuery(id), cancellationToken);
            if (result is null) return NotFound();
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetById: unexpected error id={Id}", id);
            throw;
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateHiringTemplateCommand command, CancellationToken cancellationToken)
    {
        try
        {
            var result = await mediator.Send(command, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Create: unexpected error");
            throw;
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateHiringTemplateCommand command, CancellationToken cancellationToken)
    {
        try
        {
            if (id != command.Id) return BadRequest("ID mismatch.");
            var result = await mediator.Send(command, cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Update: unexpected error id={Id}", id);
            throw;
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        try
        {
            await mediator.Send(new DeleteHiringTemplateCommand(id), cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Delete: unexpected error id={Id}", id);
            throw;
        }
    }
}
