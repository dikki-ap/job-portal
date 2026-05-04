using JobPortal.Application.Features.Applications.Commands.CreateApplication;
using JobPortal.Application.Features.JobPosts.Queries.GetPublishedCountries;
using JobPortal.Application.Features.JobPosts.Queries.GetJobPostById;
using JobPortal.Application.Features.JobPosts.Queries.GetJobPostBySlug;
using JobPortal.Application.Features.JobPosts.Queries.GetPublishedJobPosts;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/careers")]
[EnableRateLimiting("public")]
public class CareersController(IMediator mediator, ILogger<CareersController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] int[]? categoryIds,
        [FromQuery] int[]? employmentTypeIds,
        [FromQuery] int[]? workModeIds,
        [FromQuery] string[]? countries,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 9,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(
            new GetPublishedJobPostsQuery(search, categoryIds, employmentTypeIds, workModeIds,
                countries, Math.Max(1, page), Math.Clamp(pageSize, 1, 50)),
            cancellationToken);
        return Ok(result);
    }

    [HttpGet("countries")]
    public async Task<IActionResult> GetCountries(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetPublishedCountriesQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetJobPostByIdQuery(id), cancellationToken);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetJobPostBySlugQuery(slug), cancellationToken);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpPost("{id:int}/apply")]
    [Authorize]
    [EnableRateLimiting("apply")]
    public async Task<IActionResult> Apply(int id, [FromBody] ApplyRequest request, CancellationToken cancellationToken)
    {
        logger.LogDebug("Apply: jobPostId={Id}", id);
        try
        {
            var documents = request.Documents?
                .Select(d => new DocumentInput(d.DocumentId, d.DocumentTypeName))
                .ToList() ?? [];
            var result = await mediator.Send(new CreateApplicationCommand(id, documents), cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { error = ex.Message }); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(new { error = ex.Message }); }
    }

    public record DocumentRequest(int DocumentId, string DocumentTypeName);
    public record ApplyRequest(IReadOnlyList<DocumentRequest>? Documents);
}
