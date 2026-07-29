using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace JobPortal.Web.Extensions;

/// <summary>
/// Configures JWT Bearer authentication against a Keycloak identity provider
/// and registers the application's authorization policies.
///
/// Token validation flow:
///   1. The client obtains a JWT from Keycloak (Authorization Code or Client Credentials flow).
///   2. The JWT is sent in the Authorization: Bearer header.
///   3. ASP.NET Core fetches the Keycloak JWKS endpoint (cached) and validates the signature.
///   4. The issuer claim is compared against <c>Keycloak:Authority</c> from configuration.
///   5. Roles are extracted from the token via <see cref="KeycloakRolesClaimsTransformation"/>
///      and mapped into standard <c>ClaimTypes.Role</c> claims used by authorization policies.
///
/// Docker / split-network setup:
///   In containerised deployments the container may need to reach Keycloak via an internal
///   hostname (e.g. host.docker.internal) while the JWT issuer claim contains the public URL.
///   <c>Keycloak:MetadataAddress</c> overrides the JWKS discovery URL independently of
///   <c>Keycloak:Authority</c>, which is still used for issuer validation.
///
/// HTTPS metadata:
///   <c>RequireHttpsMetadata</c> defaults to false to support local and Docker environments
///   where Keycloak runs on plain HTTP internally. In fully public deployments with TLS
///   end-to-end, set <c>Keycloak:RequireHttpsMetadata: true</c> in appsettings.Production.json.
///
/// Authorization policies:
///   - "HrOrAdmin" — requires the Admin or HR realm role.
///   - "AdminOnly" — requires the Admin realm role only.
/// </summary>
public static class AuthenticationExtensions
{
    /// <summary>
    /// Registers JWT Bearer authentication and role-based authorization policies.
    /// Reads Keycloak settings from the "Keycloak" configuration section.
    /// </summary>
    public static IServiceCollection AddKeycloakAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                // The public Keycloak realm URL — used as the expected issuer in JWT validation.
                // Example: https://auth.example.com/realms/job-portal
                options.Authority = configuration["Keycloak:Authority"];

                // Set to true in production when Keycloak is reachable only over HTTPS.
                // Keep false when the container fetches JWKS from an internal HTTP URL.
                options.RequireHttpsMetadata = configuration.GetValue("Keycloak:RequireHttpsMetadata", false);

                // Disable automatic claim type mapping (e.g. "sub" → ClaimTypes.NameIdentifier)
                // so that claim names in the token are used as-is and Keycloak-specific claims
                // are accessible by their original keys.
                options.MapInboundClaims = false;

                // Optional: override the OIDC discovery / JWKS endpoint URL.
                // Useful when the container must reach Keycloak via host.docker.internal
                // while the Authority (public URL) is used only for issuer validation.
                var metadataAddress = configuration["Keycloak:MetadataAddress"];
                if (!string.IsNullOrEmpty(metadataAddress))
                    options.MetadataAddress = metadataAddress;

                var clientId = configuration["Keycloak:ClientId"];
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    // When Keycloak:ClientId is configured, validate that the token's audience
                    // contains the client ID or "account" (Keycloak default realm audience).
                    // When not configured, audience validation is skipped for backward compatibility.
                    ValidateAudience = !string.IsNullOrEmpty(clientId),
                    ValidAudiences = string.IsNullOrEmpty(clientId) ? null : [clientId, "account"],

                    ValidateIssuer = true,

                    // Explicitly pin the valid issuer to the configured Authority so that
                    // the issuer from the discovery document (which may use a different hostname
                    // in a Docker setup) cannot inadvertently pass validation.
                    ValidIssuer = configuration["Keycloak:Authority"],
                };
            });

        services.AddAuthorization(options =>
        {
            // Grants access to users with either the "Admin" or "HR" Keycloak realm role.
            // Used for endpoints that HR staff and administrators can both reach.
            options.AddPolicy("HrOrAdmin", policy =>
                policy.RequireRole("Admin", "HR"));

            // Grants access only to users with the "Admin" Keycloak realm role.
            // Used for sensitive management endpoints (master data, settings, user management).
            options.AddPolicy("AdminOnly", policy =>
                policy.RequireRole("Admin"));
        });

        return services;
    }
}
