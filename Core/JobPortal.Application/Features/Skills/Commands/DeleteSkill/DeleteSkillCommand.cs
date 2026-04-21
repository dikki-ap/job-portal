using MediatR;

namespace JobPortal.Application.Features.Skills.Commands.DeleteSkill;

public record DeleteSkillCommand(int Id) : IRequest<Unit>;
