using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;

namespace JobPortal.Application.Features.AppSettings.Commands.UpdatePrivacyConsentSetting;

public class UpdatePrivacyConsentSettingCommandHandler(
    IAppSettingRepository appSettingRepository,
    ICurrentUserService currentUserService)
    : IRequestHandler<UpdatePrivacyConsentSettingCommand, Unit>
{
    public async Task<Unit> Handle(UpdatePrivacyConsentSettingCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetCurrentUserId();
        await appSettingRepository.SetValueAsync(
            "RequirePrivacyConsent",
            request.RequireConsent ? "true" : "false",
            userId,
            cancellationToken);
        await appSettingRepository.SaveChangesAsync(cancellationToken);
        return Unit.Value;
    }
}
