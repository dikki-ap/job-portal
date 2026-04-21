using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.WorkModes.Commands.UpdateWorkMode;

public record UpdateWorkModeCommand(int Id, string Name) : IRequest<WorkModeDto>;
