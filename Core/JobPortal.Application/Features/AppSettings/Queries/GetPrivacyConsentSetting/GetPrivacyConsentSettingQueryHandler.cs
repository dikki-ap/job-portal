using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Caching.Memory;

namespace JobPortal.Application.Features.AppSettings.Queries.GetPrivacyConsentSetting;

public class GetPrivacyConsentSettingQueryHandler(
    IAppSettingRepository appSettingRepository,
    IMemoryCache cache)
    : IRequestHandler<GetPrivacyConsentSettingQuery, PrivacyConsentSettingDto>
{
    public async Task<PrivacyConsentSettingDto> Handle(
        GetPrivacyConsentSettingQuery request, CancellationToken cancellationToken)
    {
        if (cache.TryGetValue(CacheKeys.PrivacyConsentSetting, out PrivacyConsentSettingDto? cached) && cached is not null)
            return cached;

        var value = await appSettingRepository.GetValueAsync("RequirePrivacyConsent", cancellationToken);
        var result = new PrivacyConsentSettingDto(value == "true");
        cache.Set(CacheKeys.PrivacyConsentSetting, result, TimeSpan.FromDays(1));
        return result;
    }
}
