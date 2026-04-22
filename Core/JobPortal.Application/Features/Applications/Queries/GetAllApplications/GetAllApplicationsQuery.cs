using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Applications.Queries.GetAllApplications;

public record GetAllApplicationsQuery(int? JobPostId = null, string? Status = null)
    : IRequest<IEnumerable<ApplicationDto>>;
