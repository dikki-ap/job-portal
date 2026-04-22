using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Applications.Queries.GetApplicationById;

public record GetApplicationByIdQuery(int Id) : IRequest<ApplicationDto?>;
