using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;

namespace JobPortal.Application.Features.AppSettings.Commands.UpdateBrandingSetting;

public class UpdateBrandingSettingCommandHandler(
    IAppSettingRepository repo,
    ICurrentUserService currentUserService)
    : IRequestHandler<UpdateBrandingSettingCommand, Unit>
{
    public async Task<Unit> Handle(UpdateBrandingSettingCommand request, CancellationToken ct)
    {
        var userId = currentUserService.GetCurrentUserId();
        await repo.SetValueAsync("BrandCompanyName",      request.CompanyName,      userId, ct);
        await repo.SetValueAsync("BrandLogoUrl",          request.LogoUrl,          userId, ct);
        await repo.SetValueAsync("BrandPrimaryColor",     request.PrimaryColor,     userId, ct);
        await repo.SetValueAsync("BrandPrimaryHoverColor",request.PrimaryHoverColor,userId, ct);
        await repo.SetValueAsync("BrandGradientMidColor", request.GradientMidColor, userId, ct);
        await repo.SetValueAsync("BrandGradientEndColor", request.GradientEndColor, userId, ct);
        await repo.SetValueAsync("BrandContactEmail",     request.ContactEmail,     userId, ct);
        await repo.SetValueAsync("BrandContactPhone",     request.ContactPhone,     userId, ct);
        await repo.SetValueAsync("BrandAddress",          request.Address,          userId, ct);
        await repo.SetValueAsync("BrandDescription",      request.Description,      userId, ct);
        await repo.SaveChangesAsync(ct);
        return Unit.Value;
    }
}
