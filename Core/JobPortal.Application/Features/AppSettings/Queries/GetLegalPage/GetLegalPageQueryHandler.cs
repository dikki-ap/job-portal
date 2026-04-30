using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.Extensions.Caching.Memory;

namespace JobPortal.Application.Features.AppSettings.Queries.GetLegalPage;

public class GetLegalPageQueryHandler(
    IAppSettingRepository appSettingRepository,
    IMemoryCache cache)
    : IRequestHandler<GetLegalPageQuery, LegalPageDto>
{
    public async Task<LegalPageDto> Handle(GetLegalPageQuery request, CancellationToken cancellationToken)
    {
        var cacheKey = request.PageType == "privacy" ? CacheKeys.LegalPrivacy : CacheKeys.LegalTerms;

        if (cache.TryGetValue(cacheKey, out LegalPageDto? cached) && cached is not null)
            return cached;

        var settingKey = request.PageType == "privacy" ? "LegalPagePrivacy" : "LegalPageTerms";
        var content = await appSettingRepository.GetValueAsync(settingKey, cancellationToken) ?? "";

        var result = new LegalPageDto(content);
        cache.Set(cacheKey, result, TimeSpan.FromDays(30));
        return result;
    }
}
