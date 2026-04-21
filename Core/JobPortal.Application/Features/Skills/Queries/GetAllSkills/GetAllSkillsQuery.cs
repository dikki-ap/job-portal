using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Skills.Queries.GetAllSkills;

public record GetAllSkillsQuery : IRequest<IEnumerable<SkillDto>>;
