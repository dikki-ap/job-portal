using JobPortal.Application.Common;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.Extensions.Caching.Memory;

namespace JobPortal.Application.Features.AppSettings.Commands.UpdateLegalPage;

public class UpdateLegalPageCommandHandler(
    IAppSettingRepository repo,
    ICurrentUserService currentUserService,
    IMemoryCache cache)
    : IRequestHandler<UpdateLegalPageCommand, Unit>
{
    public async Task<Unit> Handle(UpdateLegalPageCommand request, CancellationToken ct)
    {
        var userId = currentUserService.GetCurrentUserId();
        var settingKey = request.PageType == "privacy" ? "LegalPagePrivacy" : "LegalPageTerms";
        var cacheKey = request.PageType == "privacy" ? CacheKeys.LegalPrivacy : CacheKeys.LegalTerms;

        await repo.SetValueAsync(settingKey, request.Content, userId, ct);
        await repo.SaveChangesAsync(ct);
        cache.Remove(cacheKey);
        return Unit.Value;
    }
}
