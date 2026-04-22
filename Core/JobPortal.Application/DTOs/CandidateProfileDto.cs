namespace JobPortal.Application.DTOs;

public record CandidateSkillDto(int SkillId, string SkillName, string SkillLevel);

public record CandidateProfileDto(
    string FirstName,
    string LastName,
    string PhoneNumber,
    int? EducationLevelId,
    string? EducationLevelName,
    int? CvDocumentId,
    int? CvDocumentTypeId,
    string? CvOriginalFileName,
    IEnumerable<CandidateSkillDto> Skills);
