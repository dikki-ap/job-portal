using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.EducationLevels.Queries.GetAllEducationLevels;

public class GetAllEducationLevelsQueryHandler(IEducationLevelRepository repository, ILogger<GetAllEducationLevelsQueryHandler> logger)
    : IRequestHandler<GetAllEducationLevelsQuery, IEnumerable<EducationLevelDto>>
{
    public async Task<IEnumerable<EducationLevelDto>> Handle(GetAllEducationLevelsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var items = await repository.GetAllAsync(cancellationToken);
            return items.Select(e => new EducationLevelDto(
                e.Id, e.Name, e.Level, e.CreatedAt, e.CreatedByUserId,
                e.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                e.UpdatedAt, e.UpdatedByUserId,
                e.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting all education levels");
            throw;
        }
    }
}
