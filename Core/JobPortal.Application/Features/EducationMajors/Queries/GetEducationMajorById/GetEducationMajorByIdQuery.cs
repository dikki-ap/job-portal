using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.EducationMajors.Queries.GetEducationMajorById;

public record GetEducationMajorByIdQuery(int Id) : IRequest<EducationMajorDto?>;
