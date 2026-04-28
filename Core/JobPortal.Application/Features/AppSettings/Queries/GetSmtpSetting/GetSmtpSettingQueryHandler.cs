using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;

namespace JobPortal.Application.Features.AppSettings.Queries.GetSmtpSetting;

public class GetSmtpSettingQueryHandler(IAppSettingRepository repo)
    : IRequestHandler<GetSmtpSettingQuery, SmtpSettingDto>
{
    public async Task<SmtpSettingDto> Handle(GetSmtpSettingQuery request, CancellationToken ct)
    {
        var envOverrides = new List<string>();

        var dbHost        = await repo.GetValueAsync("SmtpHost",        ct);
        var dbPort        = await repo.GetValueAsync("SmtpPort",        ct);
        var dbSenderName  = await repo.GetValueAsync("SmtpSenderName",  ct);
        var dbSenderEmail = await repo.GetValueAsync("SmtpSenderEmail", ct);
        var dbUsername    = await repo.GetValueAsync("SmtpUsername",    ct);
        var dbSsl         = await repo.GetValueAsync("SmtpEnableSsl",   ct);

        string Resolve(string envKey, string? dbValue, string defaultValue)
        {
            var envValue = Environment.GetEnvironmentVariable(envKey);
            if (envValue is not null) { envOverrides.Add(envKey); return envValue; }
            return dbValue ?? defaultValue;
        }

        var host        = Resolve("SMTP_HOST",         dbHost,        "smtp.example.com");
        var portStr     = Resolve("SMTP_PORT",         dbPort,        "587");
        var senderName  = Resolve("SMTP_SENDER_NAME",  dbSenderName,  "JobPortal");
        var senderEmail = Resolve("SMTP_SENDER_EMAIL", dbSenderEmail, "no-reply@example.com");
        var username    = Resolve("SMTP_USERNAME",     dbUsername,    "");
        var sslStr      = Resolve("SMTP_ENABLE_SSL",   dbSsl,         "true");

        if (Environment.GetEnvironmentVariable("SMTP_PASSWORD") is not null)
            envOverrides.Add("SMTP_PASSWORD");

        return new SmtpSettingDto(
            host,
            int.TryParse(portStr, out var port) ? port : 587,
            senderName,
            senderEmail,
            username,
            sslStr.Equals("true", StringComparison.OrdinalIgnoreCase),
            envOverrides);
    }
}
