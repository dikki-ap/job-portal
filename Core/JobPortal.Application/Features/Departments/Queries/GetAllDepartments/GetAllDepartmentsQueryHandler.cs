using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.Departments.Queries.GetAllDepartments;

public class GetAllDepartmentsQueryHandler(
    IDepartmentRepository repository,
    IMemoryCache cache,
    ILogger<GetAllDepartmentsQueryHandler> logger)
    : IRequestHandler<GetAllDepartmentsQuery, IEnumerable<DepartmentDto>>
{
    public async Task<IEnumerable<DepartmentDto>> Handle(GetAllDepartmentsQuery request, CancellationToken cancellationToken)
    {
        if (cache.TryGetValue(CacheKeys.Departments, out IEnumerable<DepartmentDto>? cached) && cached is not null)
            return cached;

        try
        {
            var departments = await repository.GetAllAsync(cancellationToken);
            var result = departments.Select(d => new DepartmentDto(
                d.Id, d.Name, d.CreatedAt, d.CreatedByUserId,
                d.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                d.UpdatedAt, d.UpdatedByUserId,
                d.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null))
                .ToList();

            cache.Set(CacheKeys.Departments, (IEnumerable<DepartmentDto>)result, CacheEntry.Default(TimeSpan.FromDays(1)));
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while fetching all departments");
            throw;
        }
    }
}
