using MediatR;

namespace JobPortal.Application.Features.WorkModes.Commands.DeleteWorkMode;

public record DeleteWorkModeCommand(int Id) : IRequest<Unit>;
