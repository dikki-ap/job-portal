using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.JobLevels.Queries.GetJobLevelById;

public record GetJobLevelByIdQuery(int Id) : IRequest<JobLevelDto?>;
