using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

namespace JobPortal.Web.Extensions;

/// <summary>
/// Configures tiered rate limiting policies to protect the API from abusive traffic
/// patterns such as scraping, credential stuffing, and application-layer denial-of-service.
///
/// Policy overview:
/// ┌─────────────────┬─────────────────────┬────────────────────────────────────────────┐
/// │ Policy name     │ Default limit        │ Applied to                                 │
/// ├─────────────────┼─────────────────────┼────────────────────────────────────────────┤
/// │ (global)        │ 120 req / 60 s / IP │ Every request — last-resort safety net      │
/// │ "public"        │  60 req / 60 s / IP │ Unauthenticated read endpoints              │
/// │ "upload"        │   5 req / 60 s / user│ File upload endpoints                      │
/// │ "apply"         │   5 req / 60 s / user│ Job application submission endpoint        │
/// └─────────────────┴─────────────────────┴────────────────────────────────────────────┘
///
/// Partition key:
///   Authenticated endpoints use the "sub" (subject) claim as the partition key so that
///   NAT / shared IPs do not cause innocent users to hit each other's rate limits.
///   Unauthenticated endpoints fall back to the client IP.
///
/// Algorithm choice:
///   - Sliding window for general/public traffic: smooths bursts across 6 segments.
///   - Fixed window for upload/apply: simpler semantics suit low-limit abuse prevention.
///
/// Configuration:
///   All limits and window sizes can be overridden at runtime via appsettings.json
///   under the "RateLimiting" section without redeploying:
///   {
///     "RateLimiting": {
///       "GlobalPermitLimit": 120,  "GlobalWindowSeconds": 60,
///       "PublicPermitLimit":  60,  "PublicWindowSeconds":  60,
///       "UploadPermitLimit":   5,  "UploadWindowSeconds":  60,
///       "ApplyPermitLimit":    5,  "ApplyWindowSeconds":   60
///     }
///   }
/// </summary>
public static class RateLimitingExtensions
{
    /// <summary>
    /// Registers all rate limiting policies and the rejection handler that returns
    /// a consistent JSON error body with HTTP 429 instead of an empty response.
    /// </summary>
    public static IServiceCollection AddRateLimitingPolicies(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var rlConfig = configuration.GetSection("RateLimiting");

        services.AddRateLimiter(options =>
        {
            // Return 429 with a JSON body so clients can distinguish rate limiting
            // from other 4xx errors and implement exponential back-off.
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.OnRejected = async (ctx, token) =>
            {
                ctx.HttpContext.Response.ContentType = "application/json";
                await ctx.HttpContext.Response.WriteAsJsonAsync(
                    new { error = "Too many requests. Please slow down and try again." }, token);
            };

            // ── Global limiter ───────────────────────────────────────────────────────
            // Applies to every request regardless of which controller/policy is matched.
            // Acts as a safety net against volumetric attacks that bypass named policies.
            // Partitioned per client IP using a sliding window to smooth burst traffic.
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
                RateLimitPartition.GetSlidingWindowLimiter(
                    partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    factory: _ => new SlidingWindowRateLimiterOptions
                    {
                        PermitLimit         = rlConfig.GetValue("GlobalPermitLimit", 120),
                        Window              = TimeSpan.FromSeconds(rlConfig.GetValue("GlobalWindowSeconds", 60)),
                        SegmentsPerWindow   = 6,   // divides the window into 10-second segments
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit          = 0,   // reject immediately — do not queue excess requests
                    }));

            // ── "public" policy ──────────────────────────────────────────────────────
            // For unauthenticated read endpoints (job listings, company info, etc.).
            // Lower than the global cap to prevent scraping without affecting normal browsing.
            // Decorate controller actions with [EnableRateLimiting("public")].
            options.AddPolicy("public", httpContext =>
                RateLimitPartition.GetSlidingWindowLimiter(
                    partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    factory: _ => new SlidingWindowRateLimiterOptions
                    {
                        PermitLimit         = rlConfig.GetValue("PublicPermitLimit", 60),
                        Window              = TimeSpan.FromSeconds(rlConfig.GetValue("PublicWindowSeconds", 60)),
                        SegmentsPerWindow   = 6,
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit          = 0,
                    }));

            // ── "upload" policy ──────────────────────────────────────────────────────
            // Restricts file upload frequency per authenticated user to prevent
            // storage exhaustion attacks. Falls back to client IP for unauthenticated callers.
            // Decorate upload endpoints with [EnableRateLimiting("upload")].
            options.AddPolicy("upload", httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: httpContext.User.FindFirstValue("sub")
                                  ?? httpContext.Connection.RemoteIpAddress?.ToString()
                                  ?? "unknown",
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit         = rlConfig.GetValue("UploadPermitLimit", 5),
                        Window              = TimeSpan.FromSeconds(rlConfig.GetValue("UploadWindowSeconds", 60)),
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit          = 0,
                    }));

            // ── "apply" policy ───────────────────────────────────────────────────────
            // Limits job application submissions per user to prevent spam applications
            // from bots or disruptive users. Separate from "upload" to allow independent
            // tuning (e.g. tighten apply without affecting document uploads).
            // Decorate the apply endpoint with [EnableRateLimiting("apply")].
            options.AddPolicy("apply", httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: httpContext.User.FindFirstValue("sub")
                                  ?? httpContext.Connection.RemoteIpAddress?.ToString()
                                  ?? "unknown",
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit         = rlConfig.GetValue("ApplyPermitLimit", 5),
                        Window              = TimeSpan.FromSeconds(rlConfig.GetValue("ApplyWindowSeconds", 60)),
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit          = 0,
                    }));
        });

        return services;
    }
}
