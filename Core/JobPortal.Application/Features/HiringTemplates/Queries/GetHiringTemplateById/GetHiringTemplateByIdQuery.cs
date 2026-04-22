using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.HiringTemplates.Queries.GetHiringTemplateById;

public record GetHiringTemplateByIdQuery(int Id) : IRequest<HiringTemplateDto?>;
