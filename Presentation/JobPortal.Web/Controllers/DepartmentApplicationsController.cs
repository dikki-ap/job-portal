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
    public async Task<IActionResult> GetAll([FromQuery] string? status, CancellationToken cancellationToken)
    {
        logger.LogDebug("GetAll: fetching department applications status={Status}", status);
        try
        {
            var dmInfo = await mediator.Send(new IsDepartmentManagerQuery(), cancellationToken);
            if (!dmInfo.IsDepartmentManager || dmInfo.DepartmentId is null)
            {
                logger.LogInformation("GetAll: access denied — user is not a department manager");
                return Forbid();
            }

            var result = await mediator.Send(new GetDepartmentApplicationsQuery(dmInfo.DepartmentId.Value, status), cancellationToken);
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
            var dmInfo = await mediator.Send(new IsDepartmentManagerQuery(), cancellationToken);
            if (!dmInfo.IsDepartmentManager || dmInfo.DepartmentId is null)
            {
                logger.LogInformation("GetById: access denied — user is not a department manager");
                return Forbid();
            }

            var result = await mediator.Send(new GetDepartmentApplicationByIdQuery(id, dmInfo.DepartmentId.Value), cancellationToken);
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
}
