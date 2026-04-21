using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.EmploymentTypes.Commands.UpdateEmploymentType;

public record UpdateEmploymentTypeCommand(int Id, string Name) : IRequest<EmploymentTypeDto>;
