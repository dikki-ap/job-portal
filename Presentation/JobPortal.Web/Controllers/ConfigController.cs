using Microsoft.AspNetCore.Mvc;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/config")]
public class ConfigController(IConfiguration configuration) : ControllerBase
{
    [HttpGet("application-sources")]
    public IActionResult GetApplicationSources()
    {
        var sources = configuration.GetSection("ApplicationSources").Get<string[]>() ?? [];
        return Ok(sources);
    }
}
