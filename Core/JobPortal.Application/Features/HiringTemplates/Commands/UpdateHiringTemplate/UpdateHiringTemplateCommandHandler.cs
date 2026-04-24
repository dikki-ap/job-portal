using JobPortal.Application.DTOs;
using JobPortal.Application.Features.HiringTemplates.Queries.GetAllHiringTemplates;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.Jobs;
using MediatR;
using Microsoft.Extensions.Logging;

namespace JobPortal.Application.Features.HiringTemplates.Commands.UpdateHiringTemplate;

public class UpdateHiringTemplateCommandHandler(
    IHiringTemplateRepository repository,
    ICurrentUserService currentUserService,
    ILogger<UpdateHiringTemplateCommandHandler> logger)
    : IRequestHandler<UpdateHiringTemplateCommand, HiringTemplateDto>
{
    public async Task<HiringTemplateDto> Handle(UpdateHiringTemplateCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var template = await repository.GetByIdAsync(request.Id, cancellationToken)
                ?? throw new KeyNotFoundException($"HiringTemplate {request.Id} not found.");

            var now = DateTime.UtcNow;
            var userId = currentUserService.GetCurrentUserId() ?? 0;

            template.Name = request.Name;
            template.Description = request.Description;
            template.UpdatedAt = now;
            template.UpdatedByUserId = userId;

            template.Steps.Clear();
            foreach (var (s, i) in request.Steps.Select((s, i) => (s, i)))
            {
                template.Steps.Add(new HiringTemplateStep
                {
                    Name = s.Name,
                    StepOrder = i + 1,
                    IsRequired = s.IsRequired,
                    PassEmailSubject = s.PassEmailSubject,
                    PassEmailBody = s.PassEmailBody,
                    FailEmailSubject = s.FailEmailSubject,
                    FailEmailBody = s.FailEmailBody,
                });
            }

            await repository.UpdateAsync(template, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            logger.LogInformation("HiringTemplate updated id={Id}", template.Id);

            return GetAllHiringTemplatesQueryHandler.MapToDto(template);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating hiring template id={Id}", request.Id);
            throw;
        }
    }
}
