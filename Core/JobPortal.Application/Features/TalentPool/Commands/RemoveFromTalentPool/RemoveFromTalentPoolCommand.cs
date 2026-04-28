using MediatR;

namespace JobPortal.Application.Features.TalentPool.Commands.RemoveFromTalentPool;

public record RemoveFromTalentPoolCommand(int Id) : IRequest<Unit>;
