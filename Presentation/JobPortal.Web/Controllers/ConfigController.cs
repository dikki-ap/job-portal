using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/config")]
[Authorize]
public class ConfigController(IConfiguration configuration) : ControllerBase
{
    [HttpGet("application-sources")]
    [AllowAnonymous]
    public IActionResult GetApplicationSources()
    {
        var sources = configuration.GetSection("ApplicationSources").Get<string[]>() ?? [];
        return Ok(sources);
    }
}
