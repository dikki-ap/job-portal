using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.JobLevels.Queries.GetAllJobLevels;

public record GetAllJobLevelsQuery : IRequest<IEnumerable<JobLevelDto>>;
