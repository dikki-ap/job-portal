using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.HiringTemplates.Queries.GetAllHiringTemplates;

public record GetAllHiringTemplatesQuery : IRequest<IEnumerable<HiringTemplateDto>>;
