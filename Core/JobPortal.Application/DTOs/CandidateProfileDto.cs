namespace JobPortal.Application.DTOs;

public record CandidateProfileDto(
    string FirstName,
    string LastName,
    string PhoneNumber,
    int? EducationLevelId,
    string? EducationLevelName,
    int? CvDocumentId,
    string? CvOriginalFileName);
