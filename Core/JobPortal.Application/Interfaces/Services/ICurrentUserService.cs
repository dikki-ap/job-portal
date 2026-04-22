namespace JobPortal.Application.Interfaces.Services;

public interface ICurrentUserService
{
    int? GetCurrentUserId();
    string? GetCurrentUserExternalId();
}
