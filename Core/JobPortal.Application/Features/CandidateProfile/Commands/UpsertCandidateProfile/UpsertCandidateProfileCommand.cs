using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.CandidateProfile.Commands.UpsertCandidateProfile;

public record UpsertSkillItem(int SkillId, string SkillLevel);

public record UpsertCandidateProfileCommand(
    string FirstName,
    string LastName,
    string PhoneNumber,
    int? EducationLevelId,
    int? EducationMajorId = null,
    string? EducationMajorCustom = null,
    string? InstitutionName = null,
    int? EducationStartYear = null,
    int? EducationEndYear = null,
    DateOnly? DateOfBirth = null,
    List<UpsertSkillItem>? Skills = null) : IRequest<CandidateProfileDto>;
