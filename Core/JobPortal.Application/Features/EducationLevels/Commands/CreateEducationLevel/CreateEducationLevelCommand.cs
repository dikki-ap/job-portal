using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.EducationLevels.Commands.CreateEducationLevel;

public record CreateEducationLevelCommand(string Name, int Level) : IRequest<EducationLevelDto>;
