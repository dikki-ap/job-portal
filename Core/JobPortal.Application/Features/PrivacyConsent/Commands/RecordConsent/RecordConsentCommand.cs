using JobPortal.Application.DTOs;
using MediatR;

namespace JobPortal.Application.Features.PrivacyConsent.Commands.RecordConsent;

public record RecordConsentCommand : IRequest<ConsentStatusDto>;
