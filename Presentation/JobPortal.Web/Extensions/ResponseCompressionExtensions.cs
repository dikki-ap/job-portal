using System.IO.Compression;
using Microsoft.AspNetCore.ResponseCompression;

namespace JobPortal.Web.Extensions;

/// <summary>
/// Configures HTTP response compression using Brotli and Gzip.
///
/// Both algorithms are registered so the server negotiates the best one based on
/// the client's Accept-Encoding header. Brotli typically achieves 15–25 % better
/// compression ratios than Gzip at equivalent CPU cost; Gzip is kept as the
/// universal fallback for older clients.
///
/// Compression is explicitly enabled over HTTPS because the BREACH attack
/// (which motivated the original HTTPS compression ban) is only a risk for
/// responses that contain user-controlled secrets inside a compressed body —
/// not a concern for this API's JSON payloads. The performance benefit outweighs
/// the theoretical risk for this use case.
/// </summary>
public static class ResponseCompressionExtensions
{
    /// <summary>
    /// Registers Brotli and Gzip compression providers and extends the default MIME type
    /// list to include the content types this API commonly returns.
    /// </summary>
    public static IServiceCollection AddResponseCompressionWithDefaults(this IServiceCollection services)
    {
        services.AddResponseCompression(options =>
        {
            // Allow compression on HTTPS responses (safe for this API — see class summary).
            options.EnableForHttps = true;

            // Brotli first — preferred when the client supports it (br token in Accept-Encoding).
            options.Providers.Add<BrotliCompressionProvider>();

            // Gzip second — universal fallback for clients that do not support Brotli.
            options.Providers.Add<GzipCompressionProvider>();

            // Extend the default MIME list to cover API and frontend asset types.
            // The default list already includes text/plain and text/html; the additions
            // below ensure JSON API responses and JS/CSS bundles are also compressed.
            options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(
            [
                "application/json",
                "text/plain",
                "text/html",
                "text/css",
                "application/javascript",
            ]);
        });

        // Brotli: Fastest level trades ~5 % compression ratio for significantly lower CPU usage.
        // Appropriate for a single-container deployment where CPU is a shared resource.
        services.Configure<BrotliCompressionProviderOptions>(options =>
            options.Level = CompressionLevel.Fastest);

        // Gzip: SmallestSize maximises compression ratio at the cost of more CPU time.
        // Used here because Gzip is only served when Brotli is unavailable; less frequent
        // means the extra CPU cost is negligible.
        services.Configure<GzipCompressionProviderOptions>(options =>
            options.Level = CompressionLevel.SmallestSize);

        return services;
    }
}
