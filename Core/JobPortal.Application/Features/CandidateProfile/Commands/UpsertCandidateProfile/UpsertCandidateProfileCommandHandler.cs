using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Users;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.CandidateProfile.Commands.UpsertCandidateProfile;

public class UpsertCandidateProfileCommandHandler(
    IUserProfileRepository repository,
    ICurrentUserService currentUserService,
    ILogger<UpsertCandidateProfileCommandHandler> logger)
    : IRequestHandler<UpsertCandidateProfileCommand, CandidateProfileDto>
{
    public async Task<CandidateProfileDto> Handle(UpsertCandidateProfileCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = currentUserService.GetCurrentUserId()
                ?? throw new UnauthorizedAccessException("User not authenticated.");

            var now = DateTime.UtcNow;
            var (user, _, _) = await repository.GetProfileAsync(userId, cancellationToken);

            user.FirstName = request.FirstName.Trim();
            user.LastName = request.LastName.Trim();

            var profile = new UserProfile
            {
                UserId = userId,
                PhoneNumber = request.PhoneNumber.Trim(),
                EducationLevelId = request.EducationLevelId,
                EducationMajorId = request.EducationMajorId,
                EducationMajorCustom = string.IsNullOrWhiteSpace(request.EducationMajorCustom) ? null : request.EducationMajorCustom.Trim(),
                UpdatedAt = now,
                UpdatedByUserId = userId,
                NIK = string.Empty,
            };

            var skills = (request.Skills ?? []).Select(s => new UserSkill
            {
                UserId = userId,
                SkillId = s.SkillId,
                SkillLevel = s.SkillLevel,
                CreatedAt = now,
                CreatedByUserId = userId,
            }).ToList();

            await repository.UpsertProfileAsync(user, profile, skills, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            logger.LogInformation("Candidate profile upserted userId={UserId}", userId);

            return new CandidateProfileDto(
                user.FirstName, user.LastName,
                request.PhoneNumber,
                request.EducationLevelId, null,
                null, null,
                request.EducationMajorId, null, request.EducationMajorCustom);
        }
        catch (Exception ex) when (ex is not UnauthorizedAccessException and not KeyNotFoundException)
        {
            logger.LogError(ex, "Error upserting candidate profile");
            throw;
        }
    }
}
