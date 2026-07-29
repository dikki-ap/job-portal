using JobPortal.Application.Features.JobPosts.Commands.ApproveJobPostStep;
using JobPortal.Application.Features.JobPosts.Commands.RejectJobPostStep;
using JobPortal.Application.Features.JobPosts.Queries.GetJobApprovalStatus;
using JobPortal.Application.Features.JobPosts.Queries.GetJobPostById;
using JobPortal.Application.Features.JobPosts.Queries.GetPendingApprovals;
using JobPortal.Application.Features.JobPosts.Queries.IsApprover;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

public record ApprovalActionRequest(string? Comment);

[ApiController]
[Route("api/approvals")]
[Authorize]
public class ApprovalsController(IMediator mediator) : ControllerBase
{
    [HttpGet("pending")]
    [Authorize(Policy = "HrOrAdmin")]
    public async Task<IActionResult> GetPending(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetPendingApprovalsQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("is-approver")]
    public async Task<IActionResult> IsApprover(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new IsApproverQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{jobPostId:int}/job-post")]
    [Authorize(Policy = "HrOrAdmin")]
    public async Task<IActionResult> GetJobPostForReview(int jobPostId, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetJobPostByIdQuery(jobPostId), cancellationToken);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpGet("{jobPostId:int}/approval-status")]
    [Authorize(Policy = "HrOrAdmin")]
    public async Task<IActionResult> GetApprovalStatus(int jobPostId, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetJobApprovalStatusQuery(jobPostId), cancellationToken);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpPost("{jobPostId:int}/approve")]
    public async Task<IActionResult> Approve(int jobPostId, [FromBody] ApprovalActionRequest? body, CancellationToken cancellationToken)
    {
        try
        {
            await mediator.Send(new ApproveJobPostStepCommand(jobPostId, body?.Comment), cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }

    [HttpPost("{jobPostId:int}/reject")]
    public async Task<IActionResult> Reject(int jobPostId, [FromBody] ApprovalActionRequest body, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(body?.Comment))
            return BadRequest(new { error = "Comment is required when rejecting." });
        try
        {
            await mediator.Send(new RejectJobPostStepCommand(jobPostId, body.Comment), cancellationToken);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }
}
