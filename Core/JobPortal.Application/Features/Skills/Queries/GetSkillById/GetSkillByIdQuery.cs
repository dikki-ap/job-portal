using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Skills.Queries.GetSkillById;

public record GetSkillByIdQuery(int Id) : IRequest<SkillDto?>;
