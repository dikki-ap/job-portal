using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.JobLevels.Commands.CreateJobLevel;

public record CreateJobLevelCommand(string Name) : IRequest<JobLevelDto>;
