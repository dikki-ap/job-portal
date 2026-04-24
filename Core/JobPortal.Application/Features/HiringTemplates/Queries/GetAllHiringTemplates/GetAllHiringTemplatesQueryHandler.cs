using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.HiringTemplates.Queries.GetAllHiringTemplates;

public class GetAllHiringTemplatesQueryHandler(
    IHiringTemplateRepository repository,
    ILogger<GetAllHiringTemplatesQueryHandler> logger)
    : IRequestHandler<GetAllHiringTemplatesQuery, IEnumerable<HiringTemplateDto>>
{
    public async Task<IEnumerable<HiringTemplateDto>> Handle(GetAllHiringTemplatesQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var items = await repository.GetAllAsync(cancellationToken);
            return items.Select(MapToDto);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting all hiring templates");
            throw;
        }
    }

    internal static HiringTemplateDto MapToDto(Domain.Entities.Jobs.HiringTemplate t) => new(
        t.Id,
        t.Name,
        t.Description,
        t.Steps.OrderBy(s => s.StepOrder).Select(s => new HiringTemplateStepDto(
            s.Id, s.Name, s.StepOrder, s.IsRequired,
            s.PassEmailSubject, s.PassEmailBody, s.FailEmailSubject, s.FailEmailBody)),
        t.CreatedAt,
        t.CreatedByUser is { } cb ? $"{cb.FirstName} {cb.LastName}".Trim() : null,
        t.UpdatedAt,
        t.UpdatedByUser is { } ub ? $"{ub.FirstName} {ub.LastName}".Trim() : null);
}
