using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Infrastructure.Options;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace JobPortal.Infrastructure.Services;

public class SmtpSettingsService(
    IServiceScopeFactory scopeFactory,
    IOptions<SmtpOptions> fallback,
    IMemoryCache cache) : ISmtpSettingsService
{
    private const string CacheKey = "smtp_runtime_settings";
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(5);

    public async Task<SmtpRuntimeSettings> GetSettingsAsync(CancellationToken ct = default)
    {
        if (cache.TryGetValue(CacheKey, out SmtpRuntimeSettings? cached) && cached is not null)
            return cached;

        var settings = await ResolveAsync(ct);
        cache.Set(CacheKey, settings, CacheTtl);
        return settings;
    }

    private async Task<SmtpRuntimeSettings> ResolveAsync(CancellationToken ct)
    {
        string? dbHost = null, dbPort = null, dbFromAddress = null,
                dbFromName = null, dbUsername = null, dbSsl = null;

        await using var scope = scopeFactory.CreateAsyncScope();
        var repo = scope.ServiceProvider.GetRequiredService<IAppSettingRepository>();

        dbHost        = await repo.GetValueAsync("SmtpHost",        ct);
        dbPort        = await repo.GetValueAsync("SmtpPort",        ct);
        dbFromName    = await repo.GetValueAsync("SmtpSenderName",  ct);
        dbFromAddress = await repo.GetValueAsync("SmtpSenderEmail", ct);
        dbUsername    = await repo.GetValueAsync("SmtpUsername",    ct);
        dbSsl         = await repo.GetValueAsync("SmtpEnableSsl",   ct);

        string Resolve(string envKey, string? dbValue, string fallbackValue)
            => Environment.GetEnvironmentVariable(envKey) ?? dbValue ?? fallbackValue;

        var opts = fallback.Value;
        var host        = Resolve("SMTP_HOST",         dbHost,        opts.Host);
        var portStr     = Resolve("SMTP_PORT",         dbPort,        opts.Port.ToString());
        var fromName    = Resolve("SMTP_SENDER_NAME",  dbFromName,    opts.FromName);
        var fromAddress = Resolve("SMTP_SENDER_EMAIL", dbFromAddress, opts.FromAddress);
        var username    = Resolve("SMTP_USERNAME",     dbUsername,    opts.Username ?? string.Empty);
        var sslStr      = Resolve("SMTP_ENABLE_SSL",   dbSsl,         opts.UseSsl ? "true" : "false");

        var password = Environment.GetEnvironmentVariable("SMTP_PASSWORD") ?? opts.Password;

        return new SmtpRuntimeSettings(
            Host:        host,
            Port:        int.TryParse(portStr, out var port) ? port : opts.Port,
            FromAddress: fromAddress,
            FromName:    fromName,
            Username:    string.IsNullOrWhiteSpace(username) ? null : username,
            Password:    password,
            UseSsl:      sslStr.Equals("true", StringComparison.OrdinalIgnoreCase));
    }
}
