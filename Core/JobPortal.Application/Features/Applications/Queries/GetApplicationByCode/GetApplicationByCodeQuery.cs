using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.Applications.Queries.GetApplicationByCode;

public record GetApplicationByCodeQuery(string Code, bool ExcludeCompanyDocuments = false) : IRequest<ApplicationDto?>;
