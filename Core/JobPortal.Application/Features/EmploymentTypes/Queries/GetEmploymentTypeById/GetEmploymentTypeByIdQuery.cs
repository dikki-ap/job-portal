using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.EmploymentTypes.Queries.GetEmploymentTypeById;

public record GetEmploymentTypeByIdQuery(int Id) : IRequest<EmploymentTypeDto?>;
