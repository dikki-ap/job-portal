using MediatR;

namespace JobPortal.Application.Features.EmploymentTypes.Commands.DeleteEmploymentType;

public record DeleteEmploymentTypeCommand(int Id) : IRequest<Unit>;
