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
    private static readonly string[] BrandingKeys =
    [
        "BrandCompanyName", "BrandLogoUrl", "BrandPrimaryColor", "BrandPrimaryHoverColor",
        "BrandGradientMidColor", "BrandGradientEndColor", "BrandContactEmail",
        "BrandContactPhone", "BrandAddress", "BrandDescription", "BrandTimezone",
    ];

    public async Task<BrandingSettingDto> Handle(
        GetBrandingSettingQuery request, CancellationToken cancellationToken)
    {
        if (cache.TryGetValue(CacheKeys.Branding, out BrandingSettingDto? cached) && cached is not null)
            return cached;

        var values = await appSettingRepository.GetManyAsync(BrandingKeys, cancellationToken);

        string Get(string key, string fallback) => values.GetValueOrDefault(key) ?? fallback;

        var result = new BrandingSettingDto(
            Get("BrandCompanyName",       "JobPortal"),
            Get("BrandLogoUrl",           ""),
            Get("BrandPrimaryColor",      "#004181"),
            Get("BrandPrimaryHoverColor", "#003166"),
            Get("BrandGradientMidColor",  "#0066cc"),
            Get("BrandGradientEndColor",  "#0080ff"),
            Get("BrandContactEmail",      "hello@jobportal.tech"),
            Get("BrandContactPhone",      "+62 21 0000 0000"),
            Get("BrandAddress",           "South Jakarta, Indonesia"),
            Get("BrandDescription",       "Empowering businesses through innovative technology solutions."),
            Get("BrandTimezone",          "Asia/Jakarta"));

        cache.Set(CacheKeys.Branding, result, CacheEntry.Default(TimeSpan.FromDays(1)));
        return result;
    }
}
