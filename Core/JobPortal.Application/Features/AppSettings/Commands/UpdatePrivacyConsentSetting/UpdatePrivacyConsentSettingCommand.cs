using MediatR;

namespace JobPortal.Application.Features.AppSettings.Commands.UpdatePrivacyConsentSetting;

public record UpdatePrivacyConsentSettingCommand(bool RequireConsent) : IRequest<Unit>;
