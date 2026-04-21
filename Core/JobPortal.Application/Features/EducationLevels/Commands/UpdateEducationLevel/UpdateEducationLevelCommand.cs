using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.EducationLevels.Commands.UpdateEducationLevel;

public record UpdateEducationLevelCommand(int Id, string Name, int Level) : IRequest<EducationLevelDto>;
