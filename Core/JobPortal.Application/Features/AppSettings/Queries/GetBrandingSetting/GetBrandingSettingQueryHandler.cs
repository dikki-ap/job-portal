using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Caching.Memory;

namespace JobPortal.Application.Features.AppSettings.Queries.GetBrandingSetting;

public class GetBrandingSettingQueryHandler(
    IAppSettingRepository appSettingRepository,
    IMemoryCache cache)
    : IRequestHandler<GetBrandingSettingQuery, BrandingSettingDto>
{
    public async Task<BrandingSettingDto> Handle(
        GetBrandingSettingQuery request, CancellationToken cancellationToken)
    {
        if (cache.TryGetValue(CacheKeys.Branding, out BrandingSettingDto? cached) && cached is not null)
            return cached;

        var companyName       = await appSettingRepository.GetValueAsync("BrandCompanyName",       cancellationToken) ?? "JobPortal";
        var logoUrl           = await appSettingRepository.GetValueAsync("BrandLogoUrl",           cancellationToken) ?? "";
        var primaryColor      = await appSettingRepository.GetValueAsync("BrandPrimaryColor",      cancellationToken) ?? "#004181";
        var primaryHoverColor = await appSettingRepository.GetValueAsync("BrandPrimaryHoverColor", cancellationToken) ?? "#003166";
        var gradientMidColor  = await appSettingRepository.GetValueAsync("BrandGradientMidColor",  cancellationToken) ?? "#0066cc";
        var gradientEndColor  = await appSettingRepository.GetValueAsync("BrandGradientEndColor",  cancellationToken) ?? "#0080ff";
        var contactEmail      = await appSettingRepository.GetValueAsync("BrandContactEmail",      cancellationToken) ?? "hello@jobportal.tech";
        var contactPhone      = await appSettingRepository.GetValueAsync("BrandContactPhone",      cancellationToken) ?? "+62 21 0000 0000";
        var address           = await appSettingRepository.GetValueAsync("BrandAddress",           cancellationToken) ?? "South Jakarta, Indonesia";
        var description       = await appSettingRepository.GetValueAsync("BrandDescription",       cancellationToken) ?? "Empowering businesses through innovative technology solutions.";
        var timezone          = await appSettingRepository.GetValueAsync("BrandTimezone",          cancellationToken) ?? "Asia/Jakarta";

        var result = new BrandingSettingDto(companyName, logoUrl, primaryColor, primaryHoverColor,
            gradientMidColor, gradientEndColor, contactEmail, contactPhone, address, description, timezone);

        cache.Set(CacheKeys.Branding, result, TimeSpan.FromDays(1));
        return result;
    }
}
