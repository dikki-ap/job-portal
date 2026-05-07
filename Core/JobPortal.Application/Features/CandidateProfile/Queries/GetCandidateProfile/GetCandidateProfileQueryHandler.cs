using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.CandidateProfile.Queries.GetCandidateProfile;

public class GetCandidateProfileQueryHandler(
    IUserProfileRepository repository,
    ICurrentUserService currentUserService,
    ILogger<GetCandidateProfileQueryHandler> logger)
    : IRequestHandler<GetCandidateProfileQuery, CandidateProfileDto?>
{
    public async Task<CandidateProfileDto?> Handle(GetCandidateProfileQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = currentUserService.GetCurrentUserId();
            if (userId is null) return null;

            var (user, profile, skills) = await repository.GetProfileAsync(userId.Value, cancellationToken);

            return new CandidateProfileDto(
                user.FirstName,
                user.LastName,
                profile?.PhoneNumber ?? string.Empty,
                profile?.EducationLevelId,
                profile?.EducationLevel?.Name,
                profile?.CvDocumentId,
                profile?.CvDocument?.OriginalFileName,
                profile?.EducationMajorId,
                profile?.EducationMajor?.Name,
                profile?.EducationMajorCustom,
                profile?.InstitutionName,
                profile?.EducationStartYear,
                profile?.EducationEndYear,
                profile?.DateOfBirth);
        }
        catch (KeyNotFoundException)
        {
            return null;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting candidate profile");
            throw;
        }
    }
}
