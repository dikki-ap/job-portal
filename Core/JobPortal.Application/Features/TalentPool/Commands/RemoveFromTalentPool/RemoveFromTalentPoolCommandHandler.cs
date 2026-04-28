using JobPortal.Application.Interfaces.Repositories;
using MediatR;

namespace JobPortal.Application.Features.TalentPool.Commands.RemoveFromTalentPool;

public class RemoveFromTalentPoolCommandHandler(ITalentPoolRepository repository)
    : IRequestHandler<RemoveFromTalentPoolCommand, Unit>
{
    public async Task<Unit> Handle(RemoveFromTalentPoolCommand request, CancellationToken ct)
    {
        var entry = await repository.GetByIdAsync(request.Id, ct)
            ?? throw new KeyNotFoundException($"Talent pool entry {request.Id} not found.");

        repository.Remove(entry);
        await repository.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
