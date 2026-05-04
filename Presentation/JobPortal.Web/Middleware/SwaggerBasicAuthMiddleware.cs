using System.Security.Cryptography;
using System.Text;

namespace JobPortal.Web.Middleware;

public class SwaggerBasicAuthMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        if (!context.Request.Path.StartsWithSegments("/swagger"))
        {
            await next(context);
            return;
        }

        var username = Environment.GetEnvironmentVariable("SWAGGER_USERNAME");
        var password = Environment.GetEnvironmentVariable("SWAGGER_PASSWORD");

        // Credentials not configured → block access entirely
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            return;
        }

        if (!TryValidate(context, username, password))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.Headers.WWWAuthenticate = "Basic realm=\"JobPortal API Docs\", charset=\"UTF-8\"";
            return;
        }

        await next(context);
    }

    private static bool TryValidate(HttpContext context, string expectedUser, string expectedPass)
    {
        var authHeader = context.Request.Headers.Authorization.FirstOrDefault();
        if (authHeader is null || !authHeader.StartsWith("Basic ", StringComparison.OrdinalIgnoreCase))
            return false;

        try
        {
            var encoded = authHeader["Basic ".Length..].Trim();
            var decoded = Encoding.UTF8.GetString(Convert.FromBase64String(encoded));
            var colon   = decoded.IndexOf(':');
            if (colon < 0) return false;

            var user = decoded[..colon];
            var pass = decoded[(colon + 1)..];

            // Hash both sides before comparing so FixedTimeEquals always receives
            // equal-length inputs regardless of credential length.
            var userMatch = CryptographicOperations.FixedTimeEquals(
                SHA256.HashData(Encoding.UTF8.GetBytes(user)),
                SHA256.HashData(Encoding.UTF8.GetBytes(expectedUser)));

            var passMatch = CryptographicOperations.FixedTimeEquals(
                SHA256.HashData(Encoding.UTF8.GetBytes(pass)),
                SHA256.HashData(Encoding.UTF8.GetBytes(expectedPass)));

            return userMatch && passMatch;
        }
        catch
        {
            return false;
        }
    }
}
