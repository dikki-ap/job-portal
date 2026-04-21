using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.WorkModes.Commands.CreateWorkMode;

public record CreateWorkModeCommand(string Name) : IRequest<WorkModeDto>;
