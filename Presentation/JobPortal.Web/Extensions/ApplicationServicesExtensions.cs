using Microsoft.AspNetCore.Authentication;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Infrastructure;
using JobPortal.Infrastructure.Options;
using JobPortal.Persistence;
using JobPortal.Web.Services;

namespace JobPortal.Web.Extensions;

/// <summary>
/// Registers all application-level services: persistence, infrastructure adapters,
/// HTTP-context utilities, API documentation, and CORS.
///
/// Persistence layer (<see cref="PersistenceServiceCollectionExtensions.AddPersistence"/>):
///   Registers the EF Core DbContext (MariaDB via Pomelo), all repository implementations,
///   and the database migrations runner. Connection string is read from configuration.
///
/// Infrastructure layer (<see cref="InfrastructureServiceCollectionExtensions.AddInfrastructure"/>):
///   Registers adapters for cross-cutting concerns:
///     - Email service (SMTP via MailKit, configured under "Smtp").
///     - File storage service (MinIO/S3-compatible, configured under "Storage").
///
/// Current user resolution (<see cref="ICurrentUserService"/>):
///   Extracts the authenticated user's ID, email, and roles from the JWT claims
///   available on <see cref="Microsoft.AspNetCore.Http.IHttpContextAccessor"/>.
///   Scoped to the HTTP request lifetime.
///
/// Keycloak claims transformation (<see cref="IClaimsTransformation"/>):
///   Keycloak embeds realm roles inside a nested JSON object in the token.
///   <see cref="KeycloakRolesClaimsTransformation"/> flattens them into standard
///   <see cref="System.Security.Claims.ClaimTypes.Role"/> claims so that
///   ASP.NET Core's built-in role-based authorization works without change.
///
/// CORS:
///   Allows requests from the Vite dev server (localhost:5167) during local development.
///   In production this application is deployed as a single container serving both
///   the API and the React SPA — no cross-origin requests occur and CORS is a no-op.
/// </summary>
public static class ApplicationServicesExtensions
{
    /// <summary>
    /// Registers all application, infrastructure, and API documentation services.
    /// </summary>
    public static IServiceCollection AddApplicationServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // ── Persistence ──────────────────────────────────────────────────────────────
        // EF Core DbContext + all repository implementations.
        // Connection string key: "ConnectionStrings:DefaultConnection" (or as defined in AddPersistence).
        services.AddPersistence(configuration);

        // ── Infrastructure adapters ───────────────────────────────────────────────
        // Bind strongly-typed option classes before AddInfrastructure so that
        // services can receive IOptions<T> through DI.
        services.Configure<StorageOptions>(configuration.GetSection("Storage"));
        services.Configure<SmtpOptions>(configuration.GetSection("Smtp"));
        services.AddInfrastructure();

        // ── HTTP context utilities ────────────────────────────────────────────────
        // IHttpContextAccessor is required by CurrentUserService to read JWT claims
        // from the active request outside of a controller.
        services.AddHttpContextAccessor();

        // Resolves the authenticated user's identity (ID, email, roles) from the JWT.
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        // Flattens Keycloak-specific role claims into standard ClaimTypes.Role entries
        // so that [Authorize(Roles = "Admin")] and policy.RequireRole("Admin") work
        // without any Keycloak-specific logic in controllers or handlers.
        services.AddScoped<IClaimsTransformation, KeycloakRolesClaimsTransformation>();

        // ── API documentation ─────────────────────────────────────────────────────
        // OpenAPI schema generation (available at /openapi/v1.json in Development).
        services.AddOpenApi();

        // Swagger UI served at /swagger — protected by SwaggerBasicAuthMiddleware
        // so it is not exposed publicly in production without credentials.
        services.AddSwaggerGen();

        // ── MVC controllers ───────────────────────────────────────────────────────
        services.AddControllers();

        // ── CORS ──────────────────────────────────────────────────────────────────
        // Permits cross-origin requests from the Vite dev server only.
        // This is a development convenience; in production both the SPA and API
        // are served from the same origin so CORS headers are never sent.
        services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                policy
                    .WithOrigins("http://localhost:5167", "http://127.0.0.1:5167")
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });

        return services;
    }
}
