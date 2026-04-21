using MediatR;

namespace JobPortal.Application.Features.EducationLevels.Commands.DeleteEducationLevel;

public record DeleteEducationLevelCommand(int Id) : IRequest<Unit>;
