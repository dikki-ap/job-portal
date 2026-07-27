using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Features.Applications.Commands.AcceptApplication;
using JobPortal.Application.Features.Applications.Commands.BulkAcceptDepartmentApplication;
using JobPortal.Application.Features.Applications.Commands.BulkRejectDepartmentApplication;
using JobPortal.Application.Features.Applications.Commands.BulkUpdateDepartmentApplicationStep;
using JobPortal.Application.Features.Applications.Commands.RateDepartmentApplication;
using JobPortal.Application.Features.Applications.Commands.RejectApplication;
using JobPortal.Application.Features.Applications.Commands.UpdateApplicationStep;
using JobPortal.Application.Features.DepartmentApplications.Queries.GetDepartmentApplicationById;
using JobPortal.Application.Features.DepartmentApplications.Queries.GetDepartmentApplications;
using JobPortal.Application.Features.DepartmentManagers.Queries.IsDepartmentManager;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/department-applications")]
[Authorize]
public class DepartmentApplicationsController(IMediator mediator, ILogger<DepartmentApplicationsController> logger) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        logger.LogDebug("GetAll: fetching department applications");
        try
        {
            var (dmInfo, error) = await GetDmOrForbidAsync(cancellationToken);
            if (error is not null) return error;

            var result = await mediator.Send(new GetDepartmentApplicationsQuery(dmInfo!.DepartmentIds), cancellationToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetAll: unexpected error while fetching department applications");
            throw;
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        logger.LogDebug("GetById: fetching department application id={Id}", id);
        try
        {
            var (dmInfo, error) = await GetDmOrForbidAsync(cancellationToken);
            if (error is not null) return error;

            var result = await mediator.Send(new GetDepartmentApplicationByIdQuery(id, dmInfo!.DepartmentIds), cancellationToken);
            if (result is null) return NotFound();
            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetById: unexpected error while fetching department application id={Id}", id);
            throw;
        }
    }

    [HttpPost("{id:int}/steps/{stepId:int}/pass")]
    public async Task<IActionResult> PassStep(int id, int stepId, CancellationToken cancellationToken)
    {
        var (dmInfo, error) = await GetDmOrForbidAsync(cancellationToken);
        if (error is not null) return error;

        if (!await IsInScopeAsync(id, dmInfo!.DepartmentIds, cancellationToken))
            return Forbid();

        try
        {
            var result = await mediator.Send(
                new UpdateApplicationStepCommand(id, stepId, ApplicationStepStatus.Passed), cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPost("{id:int}/steps/{stepId:int}/fail")]
    public async Task<IActionResult> FailStep(int id, int stepId, CancellationToken cancellationToken)
    {
        var (dmInfo, error) = await GetDmOrForbidAsync(cancellationToken);
        if (error is not null) return error;

        if (!await IsInScopeAsync(id, dmInfo!.DepartmentIds, cancellationToken))
            return Forbid();

        try
        {
            var result = await mediator.Send(
                new UpdateApplicationStepCommand(id, stepId, ApplicationStepStatus.Failed), cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPost("{id:int}/accept")]
    public async Task<IActionResult> Accept(int id, CancellationToken cancellationToken)
    {
        var (dmInfo, error) = await GetDmOrForbidAsync(cancellationToken);
        if (error is not null) return error;

        if (!await IsInScopeAsync(id, dmInfo!.DepartmentIds, cancellationToken))
            return Forbid();

        try
        {
            var result = await mediator.Send(new AcceptApplicationCommand(id), cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPost("{id:int}/reject")]
    public async Task<IActionResult> Reject(int id, CancellationToken cancellationToken)
    {
        var (dmInfo, error) = await GetDmOrForbidAsync(cancellationToken);
        if (error is not null) return error;

        if (!await IsInScopeAsync(id, dmInfo!.DepartmentIds, cancellationToken))
            return Forbid();

        try
        {
            var result = await mediator.Send(new RejectApplicationCommand(id), cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    public record RateDmRequest(int Rating, string? Note);

    [HttpPost("{id:int}/rate")]
    public async Task<IActionResult> Rate(int id, [FromBody] RateDmRequest req, CancellationToken cancellationToken)
    {
        var (dmInfo, error) = await GetDmOrForbidAsync(cancellationToken);
        if (error is not null) return error;

        if (!await IsInScopeAsync(id, dmInfo!.DepartmentIds, cancellationToken))
            return Forbid();

        try
        {
            var result = await mediator.Send(
                new RateDepartmentApplicationCommand(id, req.Rating, req.Note), cancellationToken);
            return Ok(result);
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    public record BulkStepRequest(List<int> ApplicationIds, string Action);
    public record BulkIdsRequest(List<int> ApplicationIds);

    [HttpPost("bulk-step")]
    public async Task<IActionResult> BulkUpdateStep(
        [FromBody] BulkStepRequest req, CancellationToken cancellationToken)
    {
        if (req.ApplicationIds is null || req.ApplicationIds.Count == 0)
            return BadRequest(new { error = "No application IDs provided." });
        if (req.Action is not (ApplicationStepStatus.Passed or ApplicationStepStatus.Failed))
            return BadRequest(new { error = "Action must be 'Passed' or 'Failed'." });

        var (dmInfo, error) = await GetDmOrForbidAsync(cancellationToken);
        if (error is not null) return error;

        var result = await mediator.Send(
            new BulkUpdateDepartmentApplicationStepCommand(req.ApplicationIds, req.Action, dmInfo!.DepartmentIds),
            cancellationToken);
        return Ok(result);
    }

    [HttpPost("bulk-accept")]
    public async Task<IActionResult> BulkAccept(
        [FromBody] BulkIdsRequest req, CancellationToken cancellationToken)
    {
        if (req.ApplicationIds is null || req.ApplicationIds.Count == 0)
            return BadRequest(new { error = "No application IDs provided." });

        var (dmInfo, error) = await GetDmOrForbidAsync(cancellationToken);
        if (error is not null) return error;

        var result = await mediator.Send(
            new BulkAcceptDepartmentApplicationCommand(req.ApplicationIds, dmInfo!.DepartmentIds),
            cancellationToken);
        return Ok(result);
    }

    [HttpPost("bulk-reject")]
    public async Task<IActionResult> BulkReject(
        [FromBody] BulkIdsRequest req, CancellationToken cancellationToken)
    {
        if (req.ApplicationIds is null || req.ApplicationIds.Count == 0)
            return BadRequest(new { error = "No application IDs provided." });

        var (dmInfo, error) = await GetDmOrForbidAsync(cancellationToken);
        if (error is not null) return error;

        var result = await mediator.Send(
            new BulkRejectDepartmentApplicationCommand(req.ApplicationIds, dmInfo!.DepartmentIds),
            cancellationToken);
        return Ok(result);
    }

    // Returns (dmInfo, null) on success; (null, ForbidResult) if user is not a DM.
    private async Task<(IsDepartmentManagerDto? dmInfo, IActionResult? error)> GetDmOrForbidAsync(CancellationToken ct)
    {
        var dmInfo = await mediator.Send(new IsDepartmentManagerQuery(), ct);
        if (!dmInfo.IsDepartmentManager || dmInfo.DepartmentIds.Count == 0)
        {
            logger.LogInformation("Access denied — user is not a department manager");
            return (null, Forbid());
        }
        return (dmInfo, null);
    }

    // Validates the application is within the DM's department scope.
    private async Task<bool> IsInScopeAsync(int applicationId, IReadOnlyList<int> departmentIds, CancellationToken ct)
    {
        try
        {
            var result = await mediator.Send(new GetDepartmentApplicationByIdQuery(applicationId, departmentIds), ct);
            return result is not null;
        }
        catch (UnauthorizedAccessException)
        {
            return false;
        }
    }
}
