using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.EmploymentTypes.Queries.GetAllEmploymentTypes;

public class GetAllEmploymentTypesQueryHandler(IEmploymentTypeRepository repository, ILogger<GetAllEmploymentTypesQueryHandler> logger)
    : IRequestHandler<GetAllEmploymentTypesQuery, IEnumerable<EmploymentTypeDto>>
{
    public async Task<IEnumerable<EmploymentTypeDto>> Handle(GetAllEmploymentTypesQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var employmentTypes = await repository.GetAllAsync(cancellationToken);
            return employmentTypes.Select(e => new EmploymentTypeDto(
                e.Id, e.Name, e.CreatedAt, e.CreatedByUserId,
                e.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                e.UpdatedAt, e.UpdatedByUserId,
                e.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting all employment types");
            throw;
        }
    }
}
