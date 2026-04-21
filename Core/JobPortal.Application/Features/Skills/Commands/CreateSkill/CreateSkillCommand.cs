using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Skills.Commands.CreateSkill;

public record CreateSkillCommand(string Name) : IRequest<SkillDto>;
