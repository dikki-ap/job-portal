using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Features.TalentPool.Queries.GetTalentPool;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Domain.Entities.TalentPool;
using MediatR;

namespace JobPortal.Application.Features.TalentPool.Commands.AddToTalentPool;

public class AddToTalentPoolCommandHandler(
    IApplicationRepository applicationRepository,
    ITalentPoolRepository talentPoolRepository,
    ICurrentUserService currentUserService)
    : IRequestHandler<AddToTalentPoolCommand, TalentPoolEntryDto>
{
    public async Task<TalentPoolEntryDto> Handle(AddToTalentPoolCommand request, CancellationToken ct)
    {
        var application = await applicationRepository.GetByIdAsync(request.ApplicationId, ct)
            ?? throw new KeyNotFoundException($"Application {request.ApplicationId} not found.");

        if (application.Status != ApplicationStatus.Rejected)
            throw new InvalidOperationException("Only rejected applications can be added to the Talent Pool.");

        var existing = await talentPoolRepository.GetByUserIdAsync(application.UserId, ct);
        if (existing is not null)
            throw new InvalidOperationException("This candidate is already in the Talent Pool.");

        var addedBy = currentUserService.GetCurrentUserId()
            ?? throw new UnauthorizedAccessException("User not authenticated.");

        var entry = new TalentPoolEntry
        {
            UserId = application.UserId,
            OriginalApplicationId = application.Id,
            Notes = request.Notes?.Trim(),
            AddedByUserId = addedBy,
            AddedAt = DateTime.UtcNow,
        };

        await talentPoolRepository.AddAsync(entry, ct);
        await talentPoolRepository.SaveChangesAsync(ct);

        var full = await talentPoolRepository.GetByIdAsync(entry.Id, ct);
        return GetTalentPoolQueryHandler.MapToDto(full!);
    }
}
