using JobPortal.Application.Interfaces.Services;
using JobPortal.Infrastructure.HealthChecks;
using JobPortal.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;

namespace JobPortal.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddSingleton<IStorageService, MinioStorageService>();
        services.AddSingleton<ISmtpSettingsService, SmtpSettingsService>();
        services.AddTransient<SmtpEmailService>();
        services.AddTransient<EmailBackgroundJob>();
        services.AddTransient<IEmailService, HangfireEmailService>();
        services.AddSingleton<MinioHealthCheck>();
        return services;
    }
}
