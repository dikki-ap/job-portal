using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Applications.Queries.GetMyApplications;

public record GetMyApplicationsQuery : IRequest<IEnumerable<ApplicationDto>>;
