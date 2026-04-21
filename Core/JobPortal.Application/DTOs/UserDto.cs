namespace JobPortal.Application.DTOs;

public record UserDto(
    int Id,
    string Email,
    string FirstName,
    string LastName
);
