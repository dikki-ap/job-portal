using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;
using System.Text.Json;

namespace JobPortal.Web.Services;

public class KeycloakRolesClaimsTransformation(IConfiguration configuration) : IClaimsTransformation
{
    private readonly string _clientId = configuration["Keycloak:ClientId"] ?? string.Empty;

    public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        if (string.IsNullOrEmpty(_clientId))
            return Task.FromResult(principal);

        var resourceAccessClaim = principal.FindFirst("resource_access");
        if (resourceAccessClaim is null)
            return Task.FromResult(principal);

        try
        {
            var resourceAccess = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(resourceAccessClaim.Value);
            if (resourceAccess is null || !resourceAccess.TryGetValue(_clientId, out var clientAccess))
                return Task.FromResult(principal);

            if (!clientAccess.TryGetProperty("roles", out var rolesElement))
                return Task.FromResult(principal);

            var identity = (ClaimsIdentity)principal.Identity!;
            foreach (var role in rolesElement.EnumerateArray())
            {
                var roleName = role.GetString();
                if (roleName is not null && !principal.IsInRole(roleName))
                    identity.AddClaim(new Claim(ClaimTypes.Role, roleName));
            }
        }
        catch (JsonException)
        {
            // malformed claim — skip
        }

        return Task.FromResult(principal);
    }
}
