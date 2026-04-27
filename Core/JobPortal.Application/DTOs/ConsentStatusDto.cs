namespace JobPortal.Application.DTOs;

public record ConsentStatusDto(bool HasConsented, DateTime? ConsentedAt);
