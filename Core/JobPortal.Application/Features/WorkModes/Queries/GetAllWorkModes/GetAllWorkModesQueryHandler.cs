using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.WorkModes.Queries.GetAllWorkModes;

public class GetAllWorkModesQueryHandler(IWorkModeRepository repository, ILogger<GetAllWorkModesQueryHandler> logger)
    : IRequestHandler<GetAllWorkModesQuery, IEnumerable<WorkModeDto>>
{
    public async Task<IEnumerable<WorkModeDto>> Handle(GetAllWorkModesQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var workModes = await repository.GetAllAsync(cancellationToken);
            return workModes.Select(w => new WorkModeDto(
                w.Id, w.Name, w.CreatedAt, w.CreatedByUserId,
                w.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                w.UpdatedAt, w.UpdatedByUserId,
                w.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting all work modes");
            throw;
        }
    }
}
