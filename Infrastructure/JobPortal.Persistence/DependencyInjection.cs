using FluentValidation;
using JobPortal.Application.Common.Behaviors;
using JobPortal.Application.Features.Departments.Queries.GetAllDepartments;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Persistence.Context;
using JobPortal.Persistence.Repositories;
using MediatR;
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
            options.UseMySql(connStr, ServerVersion.AutoDetect(connStr),
                mySql => mySql.CommandTimeout(120)));

        var applicationAssembly = typeof(GetAllDepartmentsQuery).Assembly;

        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(applicationAssembly));
        services.AddValidatorsFromAssembly(applicationAssembly);
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

        services.AddScoped<IDepartmentRepository, DepartmentRepository>();
        services.AddScoped<IUserRepository, UserRepository>();

        return services;
    }
}
