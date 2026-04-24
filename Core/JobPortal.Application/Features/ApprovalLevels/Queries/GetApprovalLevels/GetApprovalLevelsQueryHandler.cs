using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.ApprovalLevels.Queries.GetApprovalLevels;

public class GetApprovalLevelsQueryHandler(
    IApprovalLevelRepository repository,
    ILogger<GetApprovalLevelsQueryHandler> logger)
    : IRequestHandler<GetApprovalLevelsQuery, IEnumerable<ApprovalLevelDto>>
{
    public async Task<IEnumerable<ApprovalLevelDto>> Handle(GetApprovalLevelsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var items = await repository.GetAllAsync(cancellationToken);
            return items.Select(MapToDto);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting approval levels");
            throw;
        }
    }

    internal static ApprovalLevelDto MapToDto(Domain.Entities.Jobs.ApprovalLevel a) => new(
        a.Id,
        a.Name,
        a.LevelOrder,
        a.ApproverName,
        a.ApproverEmail,
        a.IsActive,
        a.CreatedAt,
        a.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null);
}
