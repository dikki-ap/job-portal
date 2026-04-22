using FluentValidation;
using JobPortal.Application.Common.Behaviors;
using JobPortal.Application.Features.Departments.Queries.GetAllDepartments;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Persistence.Context;
using JobPortal.Persistence.Interceptors;
using JobPortal.Persistence.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace JobPortal.Persistence;

public static class DependencyInjection
{
    public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        var connStr = configuration.GetConnectionString("DefaultConnection")!;

        services.AddScoped<AuditInterceptor>();

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
            options.UseMySql(connStr, ServerVersion.AutoDetect(connStr),
                mySql => mySql.CommandTimeout(120)
                              .UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery))
                   .AddInterceptors(sp.GetRequiredService<AuditInterceptor>())
                   .ConfigureWarnings(w => w.Ignore(
                       CoreEventId.PossibleIncorrectRequiredNavigationWithQueryFilterInteractionWarning)));

        var applicationAssembly = typeof(GetAllDepartmentsQuery).Assembly;

        services.AddMediatR(applicationAssembly);
        services.AddValidatorsFromAssembly(applicationAssembly);
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

        services.AddScoped<IDepartmentRepository, DepartmentRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ISkillRepository, SkillRepository>();
        services.AddScoped<IWorkModeRepository, WorkModeRepository>();
        services.AddScoped<IEmploymentTypeRepository, EmploymentTypeRepository>();
        services.AddScoped<IJobCategoryRepository, JobCategoryRepository>();
        services.AddScoped<IJobLevelRepository, JobLevelRepository>();
        services.AddScoped<ICurrencyTypeRepository, CurrencyTypeRepository>();
        services.AddScoped<IDocumentTypeRepository, DocumentTypeRepository>();
        services.AddScoped<IEducationLevelRepository, EducationLevelRepository>();
        services.AddScoped<IEducationMajorRepository, EducationMajorRepository>();
        services.AddScoped<IJobPostRepository, JobPostRepository>();
        services.AddScoped<IHiringTemplateRepository, HiringTemplateRepository>();
        services.AddScoped<IApplicationRepository, ApplicationRepository>();
        services.AddScoped<IUserProfileRepository, UserProfileRepository>();

        return services;
    }
}
