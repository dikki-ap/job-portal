using JobPortal.Application.Features.JobPosts.Commands.CancelJobPostApproval;
using JobPortal.Application.Features.JobPosts.Commands.CloseJobPost;
using JobPortal.Application.Features.JobPosts.Commands.CreateJobPost;
using JobPortal.Application.Features.JobPosts.Commands.DeleteJobPost;
using JobPortal.Application.Features.JobPosts.Commands.PublishJobPost;
using JobPortal.Application.Features.JobPosts.Commands.SubmitJobPostForApproval;
using JobPortal.Application.Features.JobPosts.Commands.UpdateJobPost;
using JobPortal.Application.Features.JobPosts.Queries.GetAllJobPosts;
using JobPortal.Application.Features.JobPosts.Queries.GetJobPostById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/job-posts")]
[Authorize(Policy = "HrOrAdmin")]
public class JobPostsController(IMediator mediator, ILogger<JobPostsController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        logger.LogDebug("GetAll: fetching all job posts");
        try
        {
            var result = await mediator.Send(new GetAllJobPostsQuery(), cancellationToken);
            var list = result.ToList();
            logger.LogInformation("GetAll: returned {Count} job post(s)", list.Count);
            return Ok(list);
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
        logger.LogDebug("GetById: fetching job post id={Id}", id);
        try
        {
            var result = await mediator.Send(new GetJobPostByIdQuery(id), cancellationToken);
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
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateJobPostCommand command, CancellationToken cancellationToken)
    {
        logger.LogDebug("Create: request received title={Title}", command.Title);
        try
        {
            var result = await mediator.Send(command, cancellationToken);
            logger.LogInformation("Create: job post created id={Id}", result.Id);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Create: unexpected error title={Title}", command.Title);
            throw;
        }
    }

    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateJobPostCommand command, CancellationToken cancellationToken)
    {
        logger.LogDebug("Update: request received id={Id}", id);
        try
        {
            if (id != command.Id) return BadRequest("ID mismatch.");
            var result = await mediator.Send(command, cancellationToken);
            logger.LogInformation("Update: job post id={Id} updated", result.Id);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Update: unexpected error id={Id}", id);
            throw;
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        logger.LogDebug("Delete: request received id={Id}", id);
        try
        {
            await mediator.Send(new DeleteJobPostCommand(id), cancellationToken);
            logger.LogInformation("Delete: job post id={Id} soft-deleted", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Delete: unexpected error id={Id}", id);
            throw;
        }
    }

    [HttpPost("{id:int}/publish")]
    [Authorize]
    public async Task<IActionResult> Publish(int id, CancellationToken cancellationToken)
    {
        logger.LogDebug("Publish: request received id={Id}", id);
        try
        {
            await mediator.Send(new PublishJobPostCommand(id), cancellationToken);
            logger.LogInformation("Publish: job post id={Id} published", id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Publish: unexpected error id={Id}", id);
            throw;
        }
    }

    [HttpPost("{id:int}/submit-approval")]
    [Authorize(Policy = "HrOrAdmin")]
    public async Task<IActionResult> SubmitForApproval(int id, CancellationToken cancellationToken)
    {
        try
        {
            await mediator.Send(new SubmitJobPostForApprovalCommand(id), cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPost("{id:int}/cancel-approval")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> CancelApproval(int id, CancellationToken cancellationToken)
    {
        try
        {
            await mediator.Send(new CancelJobPostApprovalCommand(id), cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPost("{id:int}/close")]
    [Authorize]
    public async Task<IActionResult> Close(int id, CancellationToken cancellationToken)
    {
        logger.LogDebug("Close: request received id={Id}", id);
        try
        {
            await mediator.Send(new CloseJobPostCommand(id), cancellationToken);
            logger.LogInformation("Close: job post id={Id} closed", id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Close: unexpected error id={Id}", id);
            throw;
        }
    }
}
