using JobPortal.Application.DTOs;
using JobPortal.Application.Features.HiringTemplates.Queries.GetAllHiringTemplates;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Jobs;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.HiringTemplates.Commands.CreateHiringTemplate;

public class CreateHiringTemplateCommandHandler(
    IHiringTemplateRepository repository,
    ICurrentUserService currentUserService,
    ILogger<CreateHiringTemplateCommandHandler> logger)
    : IRequestHandler<CreateHiringTemplateCommand, HiringTemplateDto>
{
    public async Task<HiringTemplateDto> Handle(CreateHiringTemplateCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var now = DateTime.UtcNow;
            var userId = currentUserService.GetCurrentUserId() ?? 0;

            var template = new HiringTemplate
            {
                Name = request.Name,
                Description = request.Description,
                CreatedAt = now,
                CreatedByUserId = userId,
                Steps = request.Steps.Select((s, i) => new HiringTemplateStep
                {
                    Name = s.Name,
                    StepOrder = i + 1,
                    IsRequired = s.IsRequired,
                }).ToList(),
            };

            await repository.AddAsync(template, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            logger.LogInformation("HiringTemplate created id={Id}", template.Id);

            return GetAllHiringTemplatesQueryHandler.MapToDto(template);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating hiring template name={Name}", request.Name);
            throw;
        }
    }
}
