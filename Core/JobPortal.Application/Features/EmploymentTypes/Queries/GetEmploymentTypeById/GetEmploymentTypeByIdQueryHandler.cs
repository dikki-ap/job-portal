using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.EmploymentTypes.Queries.GetEmploymentTypeById;

public class GetEmploymentTypeByIdQueryHandler(IEmploymentTypeRepository repository, ILogger<GetEmploymentTypeByIdQueryHandler> logger)
    : IRequestHandler<GetEmploymentTypeByIdQuery, EmploymentTypeDto?>
{
    public async Task<EmploymentTypeDto?> Handle(GetEmploymentTypeByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var employmentType = await repository.GetByIdAsync(request.Id, cancellationToken);
            if (employmentType is null) return null;

            return new EmploymentTypeDto(
                employmentType.Id, employmentType.Name, employmentType.CreatedAt, employmentType.CreatedByUserId,
                employmentType.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                employmentType.UpdatedAt, employmentType.UpdatedByUserId,
                employmentType.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting employment type id={Id}", request.Id);
            throw;
        }
    }
}
