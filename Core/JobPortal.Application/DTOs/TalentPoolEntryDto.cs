namespace JobPortal.Application.DTOs;

public record TalentPoolEntryDto(
    int Id,
    int UserId,
    string CandidateName,
    string CandidateEmail,
    string? CandidatePhone,
    int? Rating,
    string? RatingNote,
    string OriginalJobTitle,
    int OriginalApplicationId,
    string OriginalApplicationCode,
    string? Notes,
    DateTime AddedAt,
    string AddedByName);
