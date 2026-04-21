using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.EducationMajors.Commands.UpdateEducationMajor;

public record UpdateEducationMajorCommand(int Id, string Name) : IRequest<EducationMajorDto>;
