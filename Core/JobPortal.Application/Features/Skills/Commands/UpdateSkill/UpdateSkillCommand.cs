using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Skills.Commands.UpdateSkill;

public record UpdateSkillCommand(int Id, string Name) : IRequest<SkillDto>;
