namespace JobPortal.Application.DTOs;

public record SmtpSettingDto(
    string Host,
    int Port,
    string SenderName,
    string SenderEmail,
    string Username,
    bool EnableSsl,
    IReadOnlyList<string> EnvOverrides);
