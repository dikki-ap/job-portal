using JobPortal.Application.Features.DocumentTypes.Commands.CreateDocumentType;
using JobPortal.Application.Features.DocumentTypes.Commands.DeleteDocumentType;
using JobPortal.Application.Features.DocumentTypes.Commands.UpdateDocumentType;
using JobPortal.Application.Features.DocumentTypes.Queries.GetAllDocumentTypes;
using JobPortal.Application.Features.DocumentTypes.Queries.GetDocumentTypeById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/document-types")]
public class DocumentTypesController(IMediator mediator, ILogger<DocumentTypesController> logger) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        logger.LogDebug("GetAll: fetching all document types");
        try
        {
            var result = await mediator.Send(new GetAllDocumentTypesQuery(), cancellationToken);
            var list = result.ToList();
            logger.LogInformation("GetAll: returned {Count} document type(s)", list.Count);
            return Ok(list);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetAll: unexpected error while fetching document types");
            throw;
        }
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        logger.LogDebug("GetById: fetching document type id={Id}", id);
        try
        {
            var result = await mediator.Send(new GetDocumentTypeByIdQuery(id), cancellationToken);
            if (result is null)
            {
                logger.LogInformation("GetById: document type id={Id} not found", id);
                return NotFound();
            }
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetById: unexpected error while fetching document type id={Id}", id);
            throw;
        }
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] CreateDocumentTypeCommand command, CancellationToken cancellationToken)
    {
        logger.LogDebug("Create: request received with name={Name}", command.Name);
        try
        {
            var result = await mediator.Send(command, cancellationToken);
            logger.LogInformation("Create: document type created id={Id} name={Name}", result.Id, result.Name);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Create: unexpected error while creating document type name={Name}", command.Name);
            throw;
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateDocumentTypeCommand command, CancellationToken cancellationToken)
    {
        logger.LogDebug("Update: request received for id={Id}", id);
        try
        {
            if (id != command.Id) return BadRequest("ID mismatch.");
            var result = await mediator.Send(command, cancellationToken);
            logger.LogInformation("Update: document type id={Id} updated successfully", result.Id);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Update: unexpected error while updating document type id={Id}", id);
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
            await mediator.Send(new DeleteDocumentTypeCommand(id), cancellationToken);
            logger.LogInformation("Delete: document type id={Id} deleted successfully", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Delete: unexpected error while deleting document type id={Id}", id);
            throw;
        }
    }
}
