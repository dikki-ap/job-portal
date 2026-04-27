using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;

namespace JobPortal.Application.Features.PrivacyConsent.Commands.RecordConsent;

public class RecordConsentCommandHandler(
    IUserProfileRepository userProfileRepository,
    ICurrentUserService currentUserService)
    : IRequestHandler<RecordConsentCommand, ConsentStatusDto>
{
    public async Task<ConsentStatusDto> Handle(RecordConsentCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetCurrentUserId()
            ?? throw new UnauthorizedAccessException("User not authenticated.");
        var consentedAt = await userProfileRepository.RecordConsentAsync(userId, cancellationToken);
        await userProfileRepository.SaveChangesAsync(cancellationToken);
        return new ConsentStatusDto(true, consentedAt);
    }
}
