using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.EducationMajors.Commands.CreateEducationMajor;

public record CreateEducationMajorCommand(string Name) : IRequest<EducationMajorDto>;
