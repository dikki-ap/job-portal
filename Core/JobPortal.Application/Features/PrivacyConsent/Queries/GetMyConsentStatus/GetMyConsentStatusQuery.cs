using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.PrivacyConsent.Queries.GetMyConsentStatus;

public record GetMyConsentStatusQuery : IRequest<ConsentStatusDto>;
