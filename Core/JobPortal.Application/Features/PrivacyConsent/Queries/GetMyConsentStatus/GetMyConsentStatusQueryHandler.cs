using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;

namespace JobPortal.Application.Features.PrivacyConsent.Queries.GetMyConsentStatus;

public class GetMyConsentStatusQueryHandler(
    IUserProfileRepository userProfileRepository,
    ICurrentUserService currentUserService)
    : IRequestHandler<GetMyConsentStatusQuery, ConsentStatusDto>
{
    public async Task<ConsentStatusDto> Handle(GetMyConsentStatusQuery request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetCurrentUserId()
            ?? throw new UnauthorizedAccessException("User not authenticated.");
        var result = await userProfileRepository.GetConsentStatusAsync(userId, cancellationToken);
        return new ConsentStatusDto(result.HasConsented, result.ConsentedAt);
    }
}
