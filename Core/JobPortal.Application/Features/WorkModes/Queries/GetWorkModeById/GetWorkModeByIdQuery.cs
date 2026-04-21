using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.WorkModes.Queries.GetWorkModeById;

public record GetWorkModeByIdQuery(int Id) : IRequest<WorkModeDto?>;
