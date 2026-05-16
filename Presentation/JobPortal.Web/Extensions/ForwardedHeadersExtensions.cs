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
    public static IServiceCollection AddReverseProxyForwardedHeaders(this IServiceCollection services)
    {
        services.Configure<ForwardedHeadersOptions>(options =>
        {
            // Rewrite RemoteIpAddress from X-Forwarded-For and
            // rewrite HttpContext.Request.Scheme from X-Forwarded-Proto.
            options.ForwardedHeaders =
                ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;

            // --- Uncomment for Docker Compose deployments ---
            // When nginx/Traefik runs in the same Docker network as this container,
            // the proxy's IP is in the 172.16.0.0/12 private range. Add it here so
            // the middleware trusts X-Forwarded-For from that address range.
            // Replace the CIDR below with your actual Docker network subnet.
            //
            // options.KnownNetworks.Add(new IPNetwork(IPAddress.Parse("172.16.0.0"), 12));
        });

        return services;
    }
}
