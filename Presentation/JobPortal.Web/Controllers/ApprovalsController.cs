using JobPortal.Application.Features.JobPosts.Queries.GetJobPostById;
using JobPortal.Application.Features.JobPosts.Queries.GetPendingApprovals;
using JobPortal.Application.Features.JobPosts.Queries.IsApprover;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/approvals")]
[Authorize]
public class ApprovalsController(IMediator mediator) : ControllerBase
{
    [HttpGet("pending")]
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
    public async Task<IActionResult> GetJobPostForReview(int jobPostId, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetJobPostByIdQuery(jobPostId), cancellationToken);
        if (result is null) return NotFound();
        return Ok(result);
    }
}
