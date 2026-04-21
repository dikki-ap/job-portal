using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.WorkModes.Queries.GetWorkModeById;

public class GetWorkModeByIdQueryHandler(IWorkModeRepository repository, ILogger<GetWorkModeByIdQueryHandler> logger)
    : IRequestHandler<GetWorkModeByIdQuery, WorkModeDto?>
{
    public async Task<WorkModeDto?> Handle(GetWorkModeByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var workMode = await repository.GetByIdAsync(request.Id, cancellationToken);
            if (workMode is null) return null;

            return new WorkModeDto(
                workMode.Id, workMode.Name, workMode.CreatedAt, workMode.CreatedByUserId,
                workMode.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
                workMode.UpdatedAt, workMode.UpdatedByUserId,
                workMode.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error occurred while getting work mode id={Id}", request.Id);
            throw;
        }
    }
}
