using JobPortal.Application.Interfaces.Services;

namespace JobPortal.Web.Services;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    public int? GetCurrentUserId()
    {
        var val = httpContextAccessor.HttpContext?.Items["CurrentUserId"];
        return val is int id ? id : null;
    }
}
