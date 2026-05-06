using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.DepartmentApplications.Queries.GetDepartmentApplicationById;

public record GetDepartmentApplicationByIdQuery(int ApplicationId, IReadOnlyList<int> DepartmentIds)
    : IRequest<ApplicationDto?>;
