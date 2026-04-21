using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.EducationLevels.Queries.GetEducationLevelById;

public record GetEducationLevelByIdQuery(int Id) : IRequest<EducationLevelDto?>;
