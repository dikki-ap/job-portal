using System.Net;
using Microsoft.AspNetCore.HttpOverrides;

namespace JobPortal.Web.Extensions;

/// <summary>
/// Configures processing of X-Forwarded-For and X-Forwarded-Proto headers sent
/// by a trusted reverse proxy (nginx, Traefik, Caddy, etc.) that sits in front
/// of this application.
///
/// Why this matters:
///   When the application runs behind a reverse proxy, <c>HttpContext.Connection.RemoteIpAddress</c>
///   contains the proxy's IP, not the real client IP. Without this middleware:
///     - Rate limiting partitions are wrong (all traffic appears to come from one IP).
///     - <c>HttpsRedirection</c> may redirect incorrectly if the proxy terminates TLS.
///     - Logs and audit trails record the proxy IP instead of the user's real IP.
///
/// Security note:
///   By default only loopback (127.0.0.1 / ::1) is a trusted proxy source.
///   If the reverse proxy runs on a private Docker network (e.g. 172.x.x.x),
///   uncomment and adjust the <c>KnownNetworks</c> entry below to prevent
///   untrusted clients from spoofing their IP via the X-Forwarded-For header.
/// </summary>
public static class ForwardedHeadersExtensions
{
    /// <summary>
    /// Registers the <see cref="ForwardedHeadersOptions"/> configuration.
    /// <para>
    /// IMPORTANT: <c>app.UseForwardedHeaders()</c> must be called before any other
    /// middleware that reads <c>RemoteIpAddress</c> or the scheme (rate limiting,
    /// HTTPS redirection, logging) for the rewritten values to take effect.
    /// </para>
    /// </summary>
    public static IServiceCollection AddReverseProxyForwardedHeaders(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<ForwardedHeadersOptions>(options =>
        {
            // Rewrite RemoteIpAddress from X-Forwarded-For and
            // rewrite HttpContext.Request.Scheme from X-Forwarded-Proto.
            options.ForwardedHeaders =
                ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;

            // Load trusted proxy networks from config (e.g. Docker bridge range).
            // Set ReverseProxy:TrustedNetworks in appsettings or via env var:
            //   ReverseProxy__TrustedNetworks__0=172.16.0.0/12
            var networks = configuration.GetSection("ReverseProxy:TrustedNetworks").Get<string[]>() ?? [];
            foreach (var cidr in networks)
            {
                var parts = cidr.Split('/');
                if (parts.Length == 2
                    && IPAddress.TryParse(parts[0], out var addr)
                    && int.TryParse(parts[1], out var prefix))
                {
                    options.KnownIPNetworks.Add(new System.Net.IPNetwork(addr, prefix));
                }
            }
        });

        return services;
    }
}
