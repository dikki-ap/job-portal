using JobPortal.Application.Common;
using JobPortal.Application.Features.AppSettings.Commands.UpdateBrandingSetting;
using JobPortal.Application.Features.AppSettings.Commands.UpdatePrivacyConsentSetting;
using JobPortal.Application.Features.AppSettings.Commands.UpdateSmtpSetting;
using JobPortal.Application.Features.AppSettings.Queries.GetBrandingSetting;
using JobPortal.Application.Features.AppSettings.Queries.GetPrivacyConsentSetting;
using JobPortal.Application.Features.AppSettings.Queries.GetSmtpSetting;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/app-settings")]
public class AppSettingsController(
    IMediator mediator,
    IStorageService storageService,
    IAppSettingRepository appSettingRepository,
    ICurrentUserService currentUserService,
    IMemoryCache cache) : ControllerBase
{
    private static readonly string[] AllowedLogoMimes = ["image/svg+xml", "image/png"];
    private const int MaxLogoSizeMb = 2;

    [HttpGet("branding")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBranding(CancellationToken ct)
        => Ok(await mediator.Send(new GetBrandingSettingQuery(), ct));

    [HttpPost("branding/logo")]
    [Authorize]
    [ApiExplorerSettings(IgnoreApi = true)]
    public async Task<IActionResult> UploadBrandingLogo(IFormFile file, CancellationToken ct)
    {
        if (!AllowedLogoMimes.Contains(file.ContentType))
            return BadRequest("Only SVG and PNG files are allowed.");

        if (file.Length > MaxLogoSizeMb * 1024 * 1024)
            return BadRequest($"File size must not exceed {MaxLogoSizeMb} MB.");

        var ext = file.ContentType == "image/svg+xml" ? ".svg" : ".png";
        using var stream = file.OpenReadStream();
        var storageKey = await storageService.UploadAsync(stream, ext, file.ContentType, "branding", ct);

        var userId = currentUserService.GetCurrentUserId();
        await appSettingRepository.SetValueAsync("BrandLogoStorageKey", storageKey, userId, ct);
        await appSettingRepository.SetValueAsync("BrandLogoUrl", "/api/app-settings/branding/logo", userId, ct);
        await appSettingRepository.SaveChangesAsync(ct);
        cache.Remove(CacheKeys.Branding);

        return Ok(new { url = "/api/app-settings/branding/logo" });
    }

    [HttpGet("branding/logo")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBrandingLogo(CancellationToken ct)
    {
        var key = await appSettingRepository.GetValueAsync("BrandLogoStorageKey", ct);
        if (string.IsNullOrEmpty(key)) return NotFound();

        var (stream, contentType) = await storageService.DownloadAsync(key, ct);
        return File(stream, contentType);
    }

    [HttpPut("branding")]
    [Authorize]
    [ApiExplorerSettings(IgnoreApi = true)]
    public async Task<IActionResult> UpdateBranding(
        [FromBody] UpdateBrandingSettingRequest req, CancellationToken ct)
    {
        await mediator.Send(new UpdateBrandingSettingCommand(
            req.CompanyName, req.LogoUrl, req.PrimaryColor, req.PrimaryHoverColor,
            req.GradientMidColor, req.GradientEndColor, req.ContactEmail,
            req.ContactPhone, req.Address, req.Description), ct);
        return NoContent();
    }

    public record UpdateBrandingSettingRequest(
        string CompanyName, string LogoUrl, string PrimaryColor, string PrimaryHoverColor,
        string GradientMidColor, string GradientEndColor, string ContactEmail,
        string ContactPhone, string Address, string Description);

    [HttpGet("require-privacy-consent")]
    [AllowAnonymous]
    public async Task<IActionResult> GetRequirePrivacyConsent(CancellationToken ct)
        => Ok(await mediator.Send(new GetPrivacyConsentSettingQuery(), ct));

    [HttpPut("require-privacy-consent")]
    [Authorize]
    public async Task<IActionResult> UpdateRequirePrivacyConsent(
        [FromBody] UpdatePrivacyConsentSettingRequest req, CancellationToken ct)
    {
        await mediator.Send(new UpdatePrivacyConsentSettingCommand(req.RequireConsent), ct);
        return NoContent();
    }

    public record UpdatePrivacyConsentSettingRequest(bool RequireConsent);

    [HttpGet("smtp")]
    [Authorize]
    public async Task<IActionResult> GetSmtpSetting(CancellationToken ct)
        => Ok(await mediator.Send(new GetSmtpSettingQuery(), ct));

    [HttpPut("smtp")]
    [Authorize]
    public async Task<IActionResult> UpdateSmtpSetting(
        [FromBody] UpdateSmtpSettingRequest req, CancellationToken ct)
    {
        await mediator.Send(new UpdateSmtpSettingCommand(
            req.Host, req.Port, req.SenderName, req.SenderEmail, req.Username, req.EnableSsl), ct);
        return NoContent();
    }

    public record UpdateSmtpSettingRequest(
        string Host, int Port, string SenderName, string SenderEmail, string Username, bool EnableSsl);
}
