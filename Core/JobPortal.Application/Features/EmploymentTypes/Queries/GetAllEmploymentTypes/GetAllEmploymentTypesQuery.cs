using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.EmploymentTypes.Queries.GetAllEmploymentTypes;

public record GetAllEmploymentTypesQuery : IRequest<IEnumerable<EmploymentTypeDto>>;
