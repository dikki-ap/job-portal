using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.CandidateProfile.Commands.UpsertCandidateProfile;

public record UpsertSkillItem(int SkillId, string SkillLevel);

public record UpsertCandidateProfileCommand(
    string FirstName,
    string LastName,
    string PhoneNumber,
    int? EducationLevelId,
    List<UpsertSkillItem> Skills) : IRequest<CandidateProfileDto>;
