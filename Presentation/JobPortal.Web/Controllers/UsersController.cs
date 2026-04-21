using JobPortal.Application.Features.Users.Queries.GetCurrentUser;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController(IMediator mediator, ILogger<UsersController> logger) : ControllerBase
{
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser(CancellationToken cancellationToken)
    {
        logger.LogDebug("GetCurrentUser: request received");
        try
        {
            var result = await mediator.Send(new GetCurrentUserQuery(), cancellationToken);
            if (result is null)
            {
                logger.LogWarning("GetCurrentUser: user not found after sync");
                return NotFound();
            }
            logger.LogInformation("GetCurrentUser: returned user id={Id} email={Email}", result.Id, result.Email);
            return Ok(result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetCurrentUser: unexpected error");
            throw;
        }
    }
}
