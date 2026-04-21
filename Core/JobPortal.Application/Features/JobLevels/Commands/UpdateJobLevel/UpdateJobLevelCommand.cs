using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.JobLevels.Commands.UpdateJobLevel;

public record UpdateJobLevelCommand(int Id, string Name) : IRequest<JobLevelDto>;
