using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.Users.Queries.GetCurrentUser;

public class GetCurrentUserQueryHandler(
    IUserRepository userRepository,
    ICurrentUserService currentUserService,
    ILogger<GetCurrentUserQueryHandler> logger)
    : IRequestHandler<GetCurrentUserQuery, UserDto?>
{
    public async Task<UserDto?> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = currentUserService.GetCurrentUserId();
            if (userId is null)
            {
                logger.LogWarning("GetCurrentUser: current user ID not found in context");
                return null;
            }

            var user = await userRepository.GetByIdAsync(userId.Value, cancellationToken);
            if (user is null)
            {
                logger.LogWarning("GetCurrentUser: no user found in DB for id={Id}", userId);
                return null;
            }

            return new UserDto(user.Id, user.Email, user.FirstName, user.LastName);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "GetCurrentUser: error occurred while fetching current user");
            throw;
        }
    }
}
