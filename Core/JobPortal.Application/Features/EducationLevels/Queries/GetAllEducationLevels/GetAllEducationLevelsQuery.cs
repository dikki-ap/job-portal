using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.EducationLevels.Queries.GetAllEducationLevels;

public record GetAllEducationLevelsQuery : IRequest<IEnumerable<EducationLevelDto>>;
