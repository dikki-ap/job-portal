using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.WorkModes.Queries.GetAllWorkModes;

public record GetAllWorkModesQuery : IRequest<IEnumerable<WorkModeDto>>;
