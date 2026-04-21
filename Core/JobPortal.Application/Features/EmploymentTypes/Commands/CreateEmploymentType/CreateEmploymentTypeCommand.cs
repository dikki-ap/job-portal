using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.EmploymentTypes.Commands.CreateEmploymentType;

public record CreateEmploymentTypeCommand(string Name) : IRequest<EmploymentTypeDto>;
