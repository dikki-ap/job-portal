namespace JobPortal.Application.Interfaces.Services;

public record SmtpRuntimeSettings(
    string Host,
    int Port,
    string FromAddress,
    string FromName,
    string? Username,
    string? Password,
    bool UseSsl);

public interface ISmtpSettingsService
{
    Task<SmtpRuntimeSettings> GetSettingsAsync(CancellationToken ct = default);
}
