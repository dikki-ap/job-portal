using JobPortal.Application.DTOs;
using JobPortal.Application.Features.HiringTemplates.Queries.GetAllHiringTemplates;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.HiringTemplates.Queries.GetHiringTemplateById;

public class GetHiringTemplateByIdQueryHandler(
    IHiringTemplateRepository repository,
    ILogger<GetHiringTemplateByIdQueryHandler> logger)
    : IRequestHandler<GetHiringTemplateByIdQuery, HiringTemplateDto?>
{
    public async Task<HiringTemplateDto?> Handle(GetHiringTemplateByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var template = await repository.GetByIdAsync(request.Id, cancellationToken);
            return template is null ? null : GetAllHiringTemplatesQueryHandler.MapToDto(template);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting hiring template id={Id}", request.Id);
            throw;
        }
    }
}
