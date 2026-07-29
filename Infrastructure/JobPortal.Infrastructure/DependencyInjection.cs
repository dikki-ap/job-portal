using JobPortal.Application.Interfaces.Services;
using JobPortal.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;

namespace JobPortal.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddSingleton<IStorageService, MinioStorageService>();
        services.AddSingleton<ISmtpSettingsService, SmtpSettingsService>();
        services.AddTransient<IEmailService, SmtpEmailService>();
        return services;
    }
}
