using Serilog;
using Serilog.Events;

namespace JobPortal.Web.Extensions;

/// <summary>
/// Configures structured application logging using Serilog.
///
/// Log output targets:
///   - Console: human-readable template for local development and container stdout.
///   - Rolling file: machine-parseable format retained for 7 days, located at logs/web-log-{date}.log.
///
/// Noise reduction:
///   ASP.NET Core request pipeline logs and EF Core SQL command logs are suppressed
///   below Warning level to keep log volume manageable in production.
/// </summary>
public static class LoggingExtensions
{
    /// <summary>
    /// Replaces the default .NET logging with Serilog and wires it into the DI container
    /// so that injected <see cref="ILogger{T}"/> instances are backed by Serilog sinks.
    /// Configuration values (minimum level overrides, additional sinks, etc.) can be
    /// supplied through appsettings.json under the "Serilog" section.
    /// </summary>
    public static IHostBuilder AddStructuredLogging(this IHostBuilder host)
    {
        host.UseSerilog((context, services, config) =>
        {
            config
                // Allow appsettings.json to override levels and add extra sinks at runtime
                // without recompiling (e.g. enable Seq or Elasticsearch in production).
                .ReadFrom.Configuration(context.Configuration)
                // Enables enrichers and destructuring policies registered in the DI container.
                .ReadFrom.Services(services)

                // Console sink — concise template suited for docker logs / local dev.
                .WriteTo.Console(
                    outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")

                // File sink — daily rolling, 7-day retention.
                // Full timestamp + timezone for cross-region incident correlation.
                .WriteTo.File(
                    path: "logs/web-log-.log",
                    rollingInterval: RollingInterval.Day,
                    retainedFileCountLimit: 7,
                    outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {SourceContext} {Message:lj}{NewLine}{Exception}")

                // Suppress verbose ASP.NET Core pipeline noise (e.g. request start/end at Information).
                .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)

                // Suppress EF Core SQL command logs — they are too chatty at Information level.
                // Raise to Information in development appsettings if you need to inspect queries.
                .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", LogEventLevel.Warning);
        });

        return host;
    }
}
