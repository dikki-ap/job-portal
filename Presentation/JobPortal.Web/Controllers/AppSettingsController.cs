using System.Text.RegularExpressions;
using Ganss.Xss;
using JobPortal.Application.Common;
using JobPortal.Application.Features.AppSettings.Commands.UpdateBrandingSetting;
using JobPortal.Application.Features.AppSettings.Commands.UpdateLegalPage;
using JobPortal.Application.Features.AppSettings.Commands.UpdatePrivacyConsentSetting;
using JobPortal.Application.Features.AppSettings.Commands.UpdateSmtpSetting;
using JobPortal.Application.Features.AppSettings.Queries.GetBrandingSetting;
using JobPortal.Application.Features.AppSettings.Queries.GetLegalPage;
using JobPortal.Application.Features.AppSettings.Queries.GetPrivacyConsentSetting;
using JobPortal.Application.Features.AppSettings.Queries.GetSmtpSetting;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Web.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
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
    [EnableRateLimiting("public")]
    public async Task<IActionResult> GetBranding(CancellationToken ct)
        => Ok(await mediator.Send(new GetBrandingSettingQuery(), ct));

    [HttpPost("branding/logo")]
    [Authorize(Policy = "AdminOnly")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public async Task<IActionResult> UploadBrandingLogo(IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest("No file provided.");

        if (!AllowedLogoMimes.Contains(file.ContentType))
            return BadRequest("Only SVG and PNG files are allowed.");

        if (file.Length > MaxLogoSizeMb * 1024 * 1024)
            return BadRequest($"File size must not exceed {MaxLogoSizeMb} MB.");

        await using (var sigStream = file.OpenReadStream())
        {
            if (!FileSignatureValidator.IsValidSignature(sigStream, file.ContentType))
                return BadRequest("File content does not match the declared file type.");
        }

        var ext = file.ContentType == "image/svg+xml" ? ".svg" : ".png";
        Stream uploadStream;
        if (file.ContentType == "image/svg+xml")
        {
            using var rawStream = file.OpenReadStream();
            using var reader = new StreamReader(rawStream);
            var svgText = await reader.ReadToEndAsync(ct);
            var sanitized = SanitizeSvg(svgText);
            uploadStream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(sanitized));
        }
        else
        {
            uploadStream = file.OpenReadStream();
        }

        string storageKey;
        await using (uploadStream)
        {
            storageKey = await storageService.UploadAsync(uploadStream, ext, file.ContentType, "branding", ct);
        }

        var userId = currentUserService.GetCurrentUserId();
        await appSettingRepository.SetValueAsync("BrandLogoStorageKey", storageKey, userId, ct);
        await appSettingRepository.SetValueAsync("BrandLogoUrl", "/api/app-settings/branding/logo", userId, ct);
        await appSettingRepository.SaveChangesAsync(ct);
        cache.Remove(CacheKeys.Branding);

        return Ok(new { url = "/api/app-settings/branding/logo" });
    }

    [HttpGet("branding/logo")]
    [AllowAnonymous]
    [EnableRateLimiting("public")]
    public async Task<IActionResult> GetBrandingLogo(CancellationToken ct)
    {
        var key = await appSettingRepository.GetValueAsync("BrandLogoStorageKey", ct);
        if (string.IsNullOrEmpty(key)) return NotFound();

        var (stream, contentType) = await storageService.DownloadAsync(key, ct);

        // SVG can execute scripts when rendered inline in a browser tab.
        // Attachment disposition forces a download for direct navigation while
        // still allowing <img src> usage (browsers ignore Content-Disposition for images).
        if (contentType == "image/svg+xml")
            return File(stream, contentType, "logo.svg");

        return File(stream, contentType);
    }

    [HttpPut("branding")]
    [Authorize(Policy = "AdminOnly")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public async Task<IActionResult> UpdateBranding(
        [FromBody] UpdateBrandingSettingRequest req, CancellationToken ct)
    {
        var sanitizer = new HtmlSanitizer();
        var safeDescription = string.IsNullOrEmpty(req.Description)
            ? req.Description
            : sanitizer.Sanitize(req.Description);

        await mediator.Send(new UpdateBrandingSettingCommand(
            req.CompanyName, req.LogoUrl, req.PrimaryColor, req.PrimaryHoverColor,
            req.GradientMidColor, req.GradientEndColor, req.ContactEmail,
            req.ContactPhone, req.Address, safeDescription, req.Timezone), ct);
        return NoContent();
    }

    public record UpdateBrandingSettingRequest(
        string CompanyName, string LogoUrl, string PrimaryColor, string PrimaryHoverColor,
        string GradientMidColor, string GradientEndColor, string ContactEmail,
        string ContactPhone, string Address, string Description, string Timezone);

    [HttpGet("require-privacy-consent")]
    [AllowAnonymous]
    [EnableRateLimiting("public")]
    public async Task<IActionResult> GetRequirePrivacyConsent(CancellationToken ct)
        => Ok(await mediator.Send(new GetPrivacyConsentSettingQuery(), ct));

    [HttpPut("require-privacy-consent")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateRequirePrivacyConsent(
        [FromBody] UpdatePrivacyConsentSettingRequest req, CancellationToken ct)
    {
        await mediator.Send(new UpdatePrivacyConsentSettingCommand(req.RequireConsent), ct);
        return NoContent();
    }

    public record UpdatePrivacyConsentSettingRequest(bool RequireConsent);

    [HttpGet("legal/{type}")]
    [AllowAnonymous]
    [EnableRateLimiting("public")]
    public async Task<IActionResult> GetLegalPage(string type, CancellationToken ct)
    {
        if (type != "privacy" && type != "terms")
            return BadRequest("Invalid page type. Use 'privacy' or 'terms'.");
        return Ok(await mediator.Send(new GetLegalPageQuery(type), ct));
    }

    [HttpPut("legal/{type}")]
    [Authorize(Policy = "AdminOnly")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public async Task<IActionResult> UpdateLegalPage(
        string type, [FromBody] UpdateLegalPageRequest req, CancellationToken ct)
    {
        if (type != "privacy" && type != "terms")
            return BadRequest("Invalid page type. Use 'privacy' or 'terms'.");
        var sanitizer = new HtmlSanitizer();
        var safeContent = string.IsNullOrEmpty(req.Content)
            ? req.Content
            : sanitizer.Sanitize(req.Content);
        await mediator.Send(new UpdateLegalPageCommand(type, safeContent), ct);
        return NoContent();
    }

    public record UpdateLegalPageRequest(string Content);

    [HttpGet("smtp")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetSmtpSetting(CancellationToken ct)
        => Ok(await mediator.Send(new GetSmtpSettingQuery(), ct));

    [HttpPut("smtp")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateSmtpSetting(
        [FromBody] UpdateSmtpSettingRequest req, CancellationToken ct)
    {
        await mediator.Send(new UpdateSmtpSettingCommand(
            req.Host, req.Port, req.SenderName, req.SenderEmail, req.Username, req.EnableSsl), ct);
        return NoContent();
    }

    public record UpdateSmtpSettingRequest(
        string Host, int Port, string SenderName, string SenderEmail, string Username, bool EnableSsl);

    private static string SanitizeSvg(string svgContent)
    {
        // Strip <script> blocks
        var result = Regex.Replace(svgContent, @"<script[\s\S]*?</script>", string.Empty, RegexOptions.IgnoreCase);
        // Strip on* event handler attributes (onclick, onload, etc.)
        result = Regex.Replace(result, @"\s+on\w+\s*=\s*(?:""[^""]*""|'[^']*'|[^\s>]+)", string.Empty, RegexOptions.IgnoreCase);
        // Strip javascript: URI scheme in href / xlink:href
        result = Regex.Replace(result, @"((?:xlink:)?href)\s*=\s*[""']\s*javascript:[^""']*[""']", "$1=\"#\"", RegexOptions.IgnoreCase);
        return result;
    }
}
