using MediatR;

namespace JobPortal.Application.Features.EducationMajors.Commands.DeleteEducationMajor;

public record DeleteEducationMajorCommand(int Id) : IRequest<Unit>;
