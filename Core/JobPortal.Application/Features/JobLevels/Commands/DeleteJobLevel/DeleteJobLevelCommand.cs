using MediatR;

namespace JobPortal.Application.Features.JobLevels.Commands.DeleteJobLevel;

public record DeleteJobLevelCommand(int Id) : IRequest<Unit>;
