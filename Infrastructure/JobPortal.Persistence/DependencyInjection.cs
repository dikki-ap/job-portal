using JobPortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace JobPortal.Persistence;

public static class DependencyInjection
{
    public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        var connStr = configuration.GetConnectionString("DefaultConnection")!;

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseMySql(connStr, ServerVersion.AutoDetect(connStr)));

        return services;
    }
}
