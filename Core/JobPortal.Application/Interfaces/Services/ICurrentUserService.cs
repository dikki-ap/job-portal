namespace JobPortal.Application.Interfaces.Services;

public interface ICurrentUserService
{
    int? GetCurrentUserId();
    string? GetCurrentUserExternalId();
    string? GetCurrentUserEmail();
    string? GetCurrentUserFullName();
    string GetBaseUrl();
}
