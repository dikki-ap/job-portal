using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.AppSettings.Queries.GetLegalPage;

public record GetLegalPageQuery(string PageType) : IRequest<LegalPageDto>;
