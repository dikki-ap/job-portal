using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.EducationLevels.Queries.GetEducationLevelById;

public class GetEducationLevelByIdQueryHandler(IEducationLevelRepository repository, ILogger<GetEducationLevelByIdQueryHandler> logger)
    : IRequestHandler<GetEducationLevelByIdQuery, EducationLevelDto?>
{
    public async Task<EducationLevelDto?> Handle(GetEducationLevelByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var e = await repository.GetByIdAsync(request.Id, cancellationToken);
            if (e is null) return null;
            return new EducationLevelDto(
                e.Id, e.Name, e.Level, e.CreatedAt, e.CreatedByUserId,
                e.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                e.UpdatedAt, e.UpdatedByUserId,
                e.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting education level id={Id}", request.Id);
            throw;
        }
    }
}
