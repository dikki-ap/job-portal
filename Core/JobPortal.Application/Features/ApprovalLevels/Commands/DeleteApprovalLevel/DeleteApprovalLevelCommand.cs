using MediatR;

namespace JobPortal.Application.Features.ApprovalLevels.Commands.DeleteApprovalLevel;

public record DeleteApprovalLevelCommand(int Id) : IRequest<Unit>;
