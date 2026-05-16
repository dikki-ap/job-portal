using System.Security.Claims;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Domain.Entities.Users;

namespace JobPortal.Web.Middleware;

public class UserSyncMiddleware(RequestDelegate next, ILogger<UserSyncMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context, IUserRepository userRepo)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var externalId = context.User.FindFirstValue("sub");
            if (externalId is not null)
            {
                try
                {
                    var user = await userRepo.GetByExternalIdAsync(externalId);
                    if (user is null)
                    {
                        user = new User
                        {
                            ExternalId = externalId,
                            Email = context.User.FindFirstValue("email") ?? string.Empty,
                            FirstName = context.User.FindFirstValue("given_name") ?? string.Empty,
                            LastName = context.User.FindFirstValue("family_name") ?? string.Empty,
                            CreatedAt = DateTime.UtcNow,
                        };
                        await userRepo.AddAsync(user);
                        await userRepo.SaveChangesAsync();
                        logger.LogInformation("UserSync: created user ExternalId={ExternalId} Id={Id}", externalId, user.Id);
                    }
                    context.Items["CurrentUserId"] = user.Id;
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "UserSync: failed to sync user ExternalId={ExternalId}", externalId);
                    // Do not continue — request must not proceed with an unresolved identity.
                    // An unset CurrentUserId would cause silent null writes or confusing 403s downstream.
                    // The global exception handler will return HTTP 500 to the client.
                    throw;
                }
            }
            else
            {
                logger.LogWarning("UserSync: authenticated but 'sub' claim missing. Claims present: {Claims}",
                    string.Join(", ", context.User.Claims.Select(c => c.Type)));
            }
        }
        await next(context);
    }
}
