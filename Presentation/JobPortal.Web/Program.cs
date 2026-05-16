using System.IO.Compression;
using System.Net;
using System.Security.Claims;
using System.Threading.RateLimiting;
using FluentValidation;
using Microsoft.AspNetCore.Authentication;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Infrastructure;
using JobPortal.Infrastructure.Options;
using JobPortal.Persistence;
using JobPortal.Web.Middleware;
using JobPortal.Web.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Serilog.Events;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, services, config) =>
{
    config
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
        .WriteTo.File(
            path: "logs/web-log-.log",
            rollingInterval: RollingInterval.Day,
            retainedFileCountLimit: 7,
            outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {SourceContext} {Message:lj}{NewLine}{Exception}")
        .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
        .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", LogEventLevel.Warning);
});

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(
        ["application/json", "text/plain", "text/html", "text/css", "application/javascript"]);
});
builder.Services.Configure<BrotliCompressionProviderOptions>(o => o.Level = CompressionLevel.Fastest);
builder.Services.Configure<GzipCompressionProviderOptions>(o => o.Level = CompressionLevel.SmallestSize);

builder.Services.AddHealthChecks();

builder.Services.AddMemoryCache(options =>
{
    // Each cache entry calls SetSize(1); version counters call SetSize(0).
    // 1000 units covers all static entries + versioned job pages + slug cache with headroom.
    options.SizeLimit = 1000;
    options.CompactionPercentage = 0.25;
});

// Forward X-Forwarded-For / X-Forwarded-Proto from a trusted reverse proxy (nginx, Traefik, etc.)
// so the real client IP reaches rate limiting, logging, and HttpsRedirection.
// By default only loopback (127.0.0.1) is trusted — add your proxy IP/network to KnownProxies
// or KnownNetworks when deploying behind Docker/nginx on a private subnet.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    // Example for a typical Docker Compose nginx proxy on the 172.x.x.x network:
    // options.KnownNetworks.Add(new IPNetwork(IPAddress.Parse("172.16.0.0"), 12));
});

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5167", "http://127.0.0.1:5167")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var rlConfig = builder.Configuration.GetSection("RateLimiting");
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (ctx, token) =>
    {
        ctx.HttpContext.Response.ContentType = "application/json";
        await ctx.HttpContext.Response.WriteAsJsonAsync(
            new { error = "Too many requests. Please slow down and try again." }, token);
    };

    // Global fallback: 120 req/min per IP — covers all routes
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetSlidingWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = rlConfig.GetValue("GlobalPermitLimit", 120),
                Window = TimeSpan.FromSeconds(rlConfig.GetValue("GlobalWindowSeconds", 60)),
                SegmentsPerWindow = 6,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0,
            }));

    // Public read endpoints — 60 req/min per IP
    options.AddPolicy("public", httpContext =>
        RateLimitPartition.GetSlidingWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = rlConfig.GetValue("PublicPermitLimit", 60),
                Window = TimeSpan.FromSeconds(rlConfig.GetValue("PublicWindowSeconds", 60)),
                SegmentsPerWindow = 6,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0,
            }));

    // File upload endpoints — 5/min per authenticated user (or IP as fallback)
    options.AddPolicy("upload", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.User.FindFirstValue("sub") ?? httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = rlConfig.GetValue("UploadPermitLimit", 5),
                Window = TimeSpan.FromSeconds(rlConfig.GetValue("UploadWindowSeconds", 60)),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0,
            }));

    // Job application submission — 5/min per user to prevent spam
    options.AddPolicy("apply", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.User.FindFirstValue("sub") ?? httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = rlConfig.GetValue("ApplyPermitLimit", 5),
                Window = TimeSpan.FromSeconds(rlConfig.GetValue("ApplyWindowSeconds", 60)),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0,
            }));
});

builder.Services.AddPersistence(builder.Configuration);
builder.Services.Configure<StorageOptions>(builder.Configuration.GetSection("Storage"));
builder.Services.Configure<SmtpOptions>(builder.Configuration.GetSection("Smtp"));
builder.Services.AddInfrastructure();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IClaimsTransformation, KeycloakRolesClaimsTransformation>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Keycloak:Authority"];
        // Keep false: MetadataAddress may point to an internal Docker URL (HTTP).
        // In fully public deployments where Keycloak is HTTPS-only, set true via config.
        options.RequireHttpsMetadata = builder.Configuration.GetValue("Keycloak:RequireHttpsMetadata", false);
        options.MapInboundClaims = false;
        // MetadataAddress lets the container fetch JWKS from a different URL than Authority.
        // Useful when Authority uses a public hostname (for issuer validation) but the
        // container must reach Keycloak via host.docker.internal.
        var metadataAddress = builder.Configuration["Keycloak:MetadataAddress"];
        if (!string.IsNullOrEmpty(metadataAddress))
            options.MetadataAddress = metadataAddress;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = false,
            ValidateIssuer = true,
            // Explicitly use Authority as valid issuer so the issuer from the
            // discovery document (which may use a different hostname) is ignored.
            ValidIssuer = builder.Configuration["Keycloak:Authority"],
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("HrOrAdmin", policy => policy.RequireRole("Admin", "HR"));
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
});

var app = builder.Build();

// Must be first: rewrites RemoteIpAddress from X-Forwarded-For before any
// middleware that reads the client IP (rate limiting, logging, HttpsRedirection).
app.UseForwardedHeaders();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

app.UseMiddleware<SwaggerBasicAuthMiddleware>();
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "JobPortal API v1");
    c.RoutePrefix = "swagger";
});

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var feature = context.Features.Get<IExceptionHandlerFeature>();
        var ex = feature?.Error;

        context.Response.ContentType = "application/json";

        if (ex is ValidationException validationEx)
        {
            context.Response.StatusCode = 400;
            var errors = validationEx.Errors.Select(e => e.ErrorMessage);
            await context.Response.WriteAsJsonAsync(new { errors });
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
            var message = app.Environment.IsDevelopment() ? ex?.Message : "An unexpected error occurred.";
            await context.Response.WriteAsJsonAsync(new { error = message });
        }
    });
});

// Security headers on all responses
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "SAMEORIGIN";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    context.Response.Headers["X-Permitted-Cross-Domain-Policies"] = "none";
    await next();
});

app.UseResponseCompression();
app.UseHttpsRedirection();
app.UseCors();
app.UseStaticFiles();
app.UseRateLimiter();
app.UseAuthentication();
app.UseMiddleware<UserSyncMiddleware>();
app.UseAuthorization();
app.MapHealthChecks("/health").AllowAnonymous();
app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();
