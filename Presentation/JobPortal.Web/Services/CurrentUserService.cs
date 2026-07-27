using System.Security.Claims;
using JobPortal.Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;

namespace JobPortal.Web.Services;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor, IConfiguration configuration) : ICurrentUserService
{
    public int? GetCurrentUserId()
    {
        var val = httpContextAccessor.HttpContext?.Items["CurrentUserId"];
        return val is int id ? id : null;
    }

    public string? GetCurrentUserExternalId()
        => httpContextAccessor.HttpContext?.User.FindFirstValue("sub");

    public string? GetCurrentUserEmail()
        => httpContextAccessor.HttpContext?.User.FindFirstValue("email");

    public string? GetCurrentUserFullName()
        => httpContextAccessor.HttpContext?.User.FindFirstValue("name");

    public string GetBaseUrl()
    {
        var configured = configuration["App:BaseUrl"];
        if (!string.IsNullOrWhiteSpace(configured)) return configured.TrimEnd('/');
        var req = httpContextAccessor.HttpContext?.Request;
        if (req is null) return string.Empty;
        return $"{req.Scheme}://{req.Host}";
    }
}
