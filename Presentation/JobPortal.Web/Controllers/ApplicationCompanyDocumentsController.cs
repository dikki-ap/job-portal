using JobPortal.Application.Common;
using JobPortal.Application.DTOs;
using JobPortal.Application.Features.DepartmentManagers.Queries.IsDepartmentManager;
using JobPortal.Application.Interfaces.Repositories;
using JobPortal.Application.Interfaces.Services;
using JobPortal.Web.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System.Security.Claims;

namespace JobPortal.Web.Controllers;

[ApiController]
[Route("api/applications/{code}/company-documents")]
[Authorize]
public class ApplicationCompanyDocumentsController(
    IApplicationRepository applicationRepository,
    IApplicationDocumentRepository applicationDocumentRepository,
    IStorageService storageService,
    ICurrentUserService currentUserService,
    IMediator mediator,
    IMemoryCache cache,
    ILogger<ApplicationCompanyDocumentsController> logger) : ControllerBase
{
    private static readonly HashSet<string> AllowedMimeTypes =
    [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
    ];

    private const long MaxFileSizeBytes = 5L * 1024 * 1024; // 5 MB

    [HttpPost]
    public async Task<IActionResult> Upload(
        string code,
        [FromForm] string name,
        IFormFile file,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(name))
            return BadRequest(new { error = "Document name is required." });

        name = name.Trim();
        if (name.Length > 100)
            return BadRequest(new { error = "Document name must not exceed 100 characters." });

        if (file is null || file.Length == 0)
            return BadRequest(new { error = "No file provided." });

        if (file.Length > MaxFileSizeBytes)
            return BadRequest(new { error = "File exceeds the 5 MB limit." });

        if (!AllowedMimeTypes.Contains(file.ContentType))
            return BadRequest(new { error = $"File type '{file.ContentType}' is not allowed. Allowed: PDF, DOC, DOCX, JPEG, PNG." });

        await using (var sigStream = file.OpenReadStream())
        {
            if (!FileSignatureValidator.IsValidSignature(sigStream, file.ContentType))
                return BadRequest(new { error = "File content does not match the declared file type." });
        }

        var app = await applicationRepository.GetByCodeAsync(code, cancellationToken);

        if (app is null)
            return NotFound(new { error = "Application not found." });

        var accessError = await CheckAccessAsync(app.JobPost?.DepartmentId, cancellationToken);
        if (accessError is not null) return accessError;

        var userId = currentUserService.GetCurrentUserId();
        var externalId = currentUserService.GetCurrentUserExternalId();
        if (userId is null || externalId is null)
            return Unauthorized();

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        string storageKey;
        await using (var stream = file.OpenReadStream())
        {
            storageKey = await storageService.UploadAsync(stream, extension, file.ContentType, externalId, cancellationToken);
        }

        var appDoc = await applicationDocumentRepository.AddCompanyDocumentAsync(
            app.Id, storageKey, file.FileName, file.ContentType, userId.Value, name, cancellationToken);

        logger.LogInformation(
            "CompanyDocument: uploaded docId={DocId} appDoc={AppDocId} app={Code} by user={UserId}",
            appDoc.DocumentId, appDoc.Id, code, userId);

        return Ok(new ApplicationDocumentDto(
            appDoc.Id,
            appDoc.DocumentType,
            file.FileName,
            file.ContentType,
            appDoc.CreatedAt,
            true));
    }

    private async Task<IActionResult?> CheckAccessAsync(int? departmentId, CancellationToken ct)
    {
        if (User.IsInRole("HR") || User.IsInRole("Admin"))
            return null;

        var email = User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue("email") ?? string.Empty;
        if (!cache.TryGetValue(CacheKeys.DmIdentity(email), out IsDepartmentManagerDto? dmInfo))
        {
            dmInfo = await mediator.Send(new IsDepartmentManagerQuery(), ct);
            if (dmInfo.IsDepartmentManager && dmInfo.DepartmentIds.Count > 0)
                cache.Set(CacheKeys.DmIdentity(email), dmInfo, CacheEntry.Default(TimeSpan.FromMinutes(5)));
        }

        if (dmInfo is null || !dmInfo.IsDepartmentManager || dmInfo.DepartmentIds.Count == 0)
            return Forbid();

        if (departmentId is null || !dmInfo.DepartmentIds.Contains(departmentId.Value))
            return Forbid();

        return null;
    }
}
