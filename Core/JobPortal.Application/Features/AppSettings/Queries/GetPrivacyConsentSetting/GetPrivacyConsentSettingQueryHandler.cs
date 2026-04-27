using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;

namespace JobPortal.Application.Features.AppSettings.Queries.GetPrivacyConsentSetting;

public class GetPrivacyConsentSettingQueryHandler(IAppSettingRepository appSettingRepository)
    : IRequestHandler<GetPrivacyConsentSettingQuery, PrivacyConsentSettingDto>
{
    public async Task<PrivacyConsentSettingDto> Handle(
        GetPrivacyConsentSettingQuery request, CancellationToken cancellationToken)
    {
        var value = await appSettingRepository.GetValueAsync("RequirePrivacyConsent", cancellationToken);
        return new PrivacyConsentSettingDto(value == "true");
    }
}
