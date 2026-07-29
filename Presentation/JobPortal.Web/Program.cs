using FluentValidation;
using Hangfire;
using Hangfire.MySql;
using HealthChecks.UI.Client;
using JobPortal.Infrastructure.HealthChecks;
using JobPortal.Persistence.Context;
using JobPortal.Web.Common;
using JobPortal.Web.Extensions;
using JobPortal.Web.Middleware;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;

// ────────────────────────────────────────────────────────────────────────────────
// Host & service registration
// Each extension method groups a cohesive set of services; see the corresponding
// file in the Extensions/ folder for configuration details and comments.
// ────────────────────────────────────────────────────────────────────────────────

var builder = WebApplication.CreateBuilder(args);

builder.Host.AddStructuredLogging();

builder.Services
    .AddResponseCompressionWithDefaults()   // Brotli + Gzip
    .AddMemoryCacheWithDefaults()           // bounded IMemoryCache
    .AddReverseProxyForwardedHeaders(builder.Configuration)  // X-Forwarded-For / X-Forwarded-Proto
    .AddRateLimitingPolicies(builder.Configuration)
    .AddKeycloakAuthentication(builder.Configuration, builder.Environment)
    .AddApplicationServices(builder.Configuration)
    .AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>("database")
    .AddCheck<MinioHealthCheck>("storage");

builder.Services.AddHangfire(cfg => cfg
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseStorage(new MySqlStorage(
        builder.Configuration.GetConnectionString("DefaultConnection")!,
        new MySqlStorageOptions { TablesPrefix = "Hangfire_" })));
builder.Services.AddHangfireServer();

// ────────────────────────────────────────────────────────────────────────────────
// Middleware pipeline
// Order is critical — do not reorder without understanding the impact.
// ────────────────────────────────────────────────────────────────────────────────

var app = builder.Build();

// Must be first: rewrites RemoteIpAddress and Request.Scheme from proxy headers
// before any middleware reads the client IP or protocol.
app.UseForwardedHeaders();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

// Swagger UI is protected by HTTP Basic Auth in non-Development environments.
app.UseMiddleware<SwaggerBasicAuthMiddleware>();
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "JobPortal API v1");
    c.RoutePrefix = "swagger";
});

// Translates unhandled exceptions into structured JSON error responses.
// Must come before controllers so all handler exceptions are caught.
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var ex = context.Features.Get<IExceptionHandlerFeature>()?.Error;
        context.Response.ContentType = "application/json";

        if (ex is ValidationException validationEx)
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(
                new { errors = validationEx.Errors.Select(e => e.ErrorMessage) });
        }
        else if (ex is KeyNotFoundException)
        {
            context.Response.StatusCode = 404;
            await context.Response.WriteAsJsonAsync(new { error = ex.Message });
        }
        else if (ex is InvalidOperationException)
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsJsonAsync(new { error = ex.Message });
        }
        else if (ex is UnauthorizedAccessException)
        {
            context.Response.StatusCode = 403;
            await context.Response.WriteAsJsonAsync(new { error = ex.Message });
        }
        else
        {
            context.Response.StatusCode = 500;
            var message = app.Environment.IsDevelopment()
                ? ex?.Message
                : "An unexpected error occurred.";
            await context.Response.WriteAsJsonAsync(new { error = message });
        }
    });
});

// Security headers applied to every response.
app.Use(async (context, next) =>
{
    // Prevent MIME-type sniffing attacks.
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";

    // Allow embedding only from the same origin (protects against clickjacking).
    context.Response.Headers["X-Frame-Options"] = "SAMEORIGIN";

    // Send the full origin URL as Referer only to same-origin requests;
    // send only the origin (no path) to cross-origin HTTPS requests; omit for HTTP.
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

    // Disallow Adobe Flash and PDF cross-domain policy files.
    context.Response.Headers["X-Permitted-Cross-Domain-Policies"] = "none";

    // Restrict resource loading to same origin. unsafe-inline is required for the
    // React SPA (Vite inlines script/style chunks). frame-ancestors replaces X-Frame-Options.
    context.Response.Headers["Content-Security-Policy"] =
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: blob:; " +
        "font-src 'self'; " +
        "connect-src 'self'; " +
        "frame-ancestors 'none';";

    await next();
});

app.UseResponseCompression();   // must be early — compresses everything after it
app.UseHttpsRedirection();
if (!app.Environment.IsDevelopment())
    app.UseHsts();
if (app.Environment.IsDevelopment())
    app.UseCors();
app.UseStaticFiles();           // serves the React SPA build output
app.UseRateLimiter();
app.UseAuthentication();
app.UseMiddleware<UserSyncMiddleware>();
app.UseAuthorization();

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
}).AllowAnonymous();

app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = [new HangfireAdminAuthFilter(app.Environment)]
});

app.MapControllers();
app.MapFallbackToFile("index.html"); // SPA client-side routing fallback

app.Run();
